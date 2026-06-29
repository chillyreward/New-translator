import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/translationCache';
import { lookupLocal } from '@/lib/localLibrary';

export const maxDuration = 300;

// ── GPT-4o prompt (fallback only) ─────────────────────────────────────────────
const KIKUYU_GUIDE = `You are an expert Kikuyu (Gĩkũyũ) linguist and native speaker from Central Kenya (Nyeri/Muranga/Kiambu region).

PHONOLOGY & DIACRITICS:
- Always use proper diacritics: ĩ (mid-central vowel), ũ (rounded back vowel), ã (nasal a)
- Double vowels = long sound: ũũ="oo", ĩĩ="ee"
- ci/ce → "sh" sound (e.g. ciara → shiara)

GRAMMAR RULES:
- Nĩ = emphasis/copula prefix before verbs
- Subject prefixes: ndĩ=I, tũ=we, wĩ=you(sg), mũ=you(pl), a=he/she, ma=they
- Verb infinitive prefix: gũ- (e.g. gũthoma=to read)
- Past tense: add -ire suffix

FEW-SHOT EXAMPLES (English → Kikuyu):
"Hello" → "Wee mwega"
"How are you?" → "Wee mwega?"
"I am fine, thank you" → "Nĩ mwega, nĩ ngatho"
"I love you" → "Nĩngwendete"
"Come here" → "Ũka haha"
"Thank you very much" → "Nĩ wega mũno mũno"
"Good morning" → "Wega wa rũciinĩ"
"I don't understand" → "Ndĩngĩũndũ"`;

async function callOpenAI(systemPrompt: string, userMessage: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI failed');
  return data.choices[0].message.content.trim();
}

async function translateWithOpenAI(text: string, sourceLang: string, apiKey: string): Promise<string> {
  const isSwahili = sourceLang === 'sw';
  const system = `${KIKUYU_GUIDE}

TASK: Translate the given ${isSwahili ? 'Kiswahili' : 'English'} text into natural spoken Kikuyu.
- Use proper diacritics (ĩ, ũ) always
- Match the register — casual stays casual, formal stays formal
- For proper nouns (names, places), keep them as-is
- Return ONLY the Kikuyu translation. No explanations, no alternatives.`;
  return callOpenAI(system, text, apiKey);
}

async function answerInKikuyu(text: string, sourceLang: string, apiKey: string): Promise<string> {
  const isSwahili = sourceLang === 'sw';
  const system = `${KIKUYU_GUIDE}

TASK: The user has asked a question in ${isSwahili ? 'Kiswahili' : 'English'}.
Respond naturally IN KIKUYU as a native speaker would.
- Do NOT translate the question — ANSWER it in Kikuyu
- Keep the answer concise (1–3 sentences)
- Use proper diacritics (ĩ, ũ) always
- Return ONLY the Kikuyu response.`;
  return callOpenAI(system, text, apiKey);
}

// ── Gemma (gateremark fine-tuned) — PRIMARY translator ────────────────────────
async function translateWithGemma(text: string, sourceLang: string): Promise<string | null> {
  const modalUrl = process.env.GEMMA_TRANSLATE_URL;
  if (!modalUrl) return null;

  try {
    const response = await fetch(`${modalUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_lang: sourceLang }),
      signal: AbortSignal.timeout(600000),
    });

    if (!response.ok) {
      console.warn('[Gemma/Modal] API error:', response.status);
      return null;
    }

    const data = await response.json();
    const result = data?.translation?.trim();
    console.log('[Gemma/Modal] result:', result?.slice(0, 100));
    return result || null;
  } catch (err: any) {
    console.warn('[Gemma/Modal] fetch failed:', err.message);
    return null;
  }
}

function isQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t.endsWith('?') ||
    /^(what|who|where|when|why|how|is|are|do|does|did|can|could|would|should|tell me|explain)\b/.test(t);
}

export async function POST(request: Request) {
  try {
    const { text, sourceLang, mode } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
    }

    // 1. Check local library FIRST — instant, no API call
    const localMatch = lookupLocal(text.trim());
    if (localMatch) {
      console.log('[Translate] Local library hit:', text.trim());
      return NextResponse.json({
        translation: localMatch.kikuyu,
        source: 'local',
        wav: localMatch.wav,   // front-end uses this for Speak button
      });
    }

    // 2. Check cache
    const cacheKey = `${mode ?? 'translate'}:${sourceLang ?? 'en'}:${text}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json({ translation: cached, cached: true });

    // 3. Gemma — PRIMARY for ALL requests (no local dictionary bypass)
    const gemmaResult = await translateWithGemma(text, sourceLang ?? 'en');
    if (gemmaResult && gemmaResult !== text && gemmaResult.length > 2) {
      console.log('[Translate] Gemma result:', gemmaResult.slice(0, 100));
      setCached(cacheKey, gemmaResult);
      return NextResponse.json({ translation: gemmaResult, source: 'gemma' });
    }

    // 4. GPT-4o — fallback only when Gemma is unreachable
    if (!apiKey) {
      return NextResponse.json({
        error: 'No translation available. Check GEMMA_TRANSLATE_URL or add OPENAI_API_KEY.'
      }, { status: 500 });
    }

    console.log('[Translate] Gemma unavailable — falling back to GPT-4o');
    let result: string;
    if (mode === 'answer' || (mode !== 'translate' && isQuestion(text))) {
      result = await answerInKikuyu(text, sourceLang ?? 'en', apiKey);
    } else {
      result = await translateWithOpenAI(text, sourceLang ?? 'en', apiKey);
    }

    setCached(cacheKey, result);
    return NextResponse.json({ translation: result, source: 'gpt-4o' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown server error' }, { status: 500 });
  }
}
