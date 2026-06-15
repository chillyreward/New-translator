import { NextResponse } from 'next/server';
import { localTranslate, hasLocalTranslation } from '@/lib/localTranslate';
import { searchPhrases, phoneticConvert } from '@/lib/kikuyuPhrases';
import { getCached, setCached } from '@/lib/translationCache';

export const maxDuration = 300; // 5 minutes for Modal cold start

function findLocalTranslation(text: string): string | null {
  if (hasLocalTranslation(text)) return localTranslate(text);
  const results = searchPhrases(text);
  return results.length > 0 ? phoneticConvert(results[0].kikuyu) : null;
}

// ── Improved few-shot GPT-4o prompt ──────────────────────────────────────────
const KIKUYU_GUIDE = `You are an expert Kikuyu (Gĩkũyũ) linguist and native speaker from Central Kenya (Nyeri/Muranga/Kiambu region).

PHONOLOGY & DIACRITICS:
- Always use proper diacritics: ĩ (mid-central vowel), ũ (rounded back vowel), ã (nasal a)
- Tonal vowels: í (high tone i), ú (high tone u)
- Vowel sounds: a="arm", e="egg", i="in", o="opposite", u="ululation"
- Double vowels = long sound: ũũ="oo", ĩĩ="ee"
- ci/ce → "sh" sound (e.g. ciara → shiara)
- Rũ → "RO" sound

GRAMMAR RULES:
- Nĩ = emphasis/copula prefix before verbs
- Subject prefixes: ndĩ=I, tũ=we, wĩ=you(sg), mũ=you(pl), a=he/she, ma=they
- Negative: ndĩ→ ndĩngĩ, tũ→tũtingĩ
- Verb infinitive prefix: gũ- (e.g. gũthoma=to read, gũoya=to take)
- Past tense: add -ire suffix (e.g. ndĩthomire=I read)
- Noun classes affect agreement (mũ-/a- for people, gĩ-/i- for things)

FEW-SHOT EXAMPLES (English → Kikuyu):
"Hello" → "Wee mwega"
"How are you?" → "Wee mwega?"
"I am fine, thank you" → "Nĩ mwega, nĩ ngatho"
"What is your name?" → "Wĩtagwo atĩa?"
"My name is John" → "Njĩtagwo John"
"Where are you going?" → "Ũkienda kũ?"
"I am going to the market" → "Nĩndĩkienda mũtũũrainĩ"
"The food is ready" → "Irio nĩ ikĩrĩire"
"I love you" → "Nĩngwendete"
"God bless you" → "Ngai akuhe gĩthomo"
"Come here" → "Ũka haha"
"How much does this cost?" → "Kĩĩ gĩkũrĩa ĩthano?"
"I don't understand" → "Ndĩngĩũndũ"
"Please speak slowly" → "Ndagũthaitha ũambĩrĩrie na ũũru"
"Thank you very much" → "Nĩ wega mũno mũno"
"Good morning" → "Wega wa rũciinĩ"
"Good night" → "Ũrĩa mwega ũtukũ"
"I am hungry" → "Nĩnjĩũkĩte njara"
"Water please" → "Maaĩ, ndagũthaitha"
"I am from Kenya" → "Nĩ wa Kenya"`;

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
- Return ONLY the Kikuyu translation. No explanations, no alternatives, no romanization notes.`;
  return callOpenAI(system, text, apiKey);
}

async function answerInKikuyu(text: string, sourceLang: string, apiKey: string): Promise<string> {
  const isSwahili = sourceLang === 'sw';
  const system = `${KIKUYU_GUIDE}

TASK: The user has asked a question or made a statement in ${isSwahili ? 'Kiswahili' : 'English'}.
Understand what they are asking, then respond naturally IN KIKUYU as a native speaker would.
- Do NOT translate the question — ANSWER it in Kikuyu
- Keep the answer concise and natural (1–3 sentences)
- Use proper diacritics (ĩ, ũ) always
- Return ONLY the Kikuyu response. No explanations.`;
  return callOpenAI(system, text, apiKey);
}

// ── Helsinki-NLP local translation ────────────────────────────────────────────
async function translateWithHelsinki(text: string): Promise<string | null> {
  const helsinkiUrl = process.env.HELSINKI_TRANSLATE_URL;
  if (!helsinkiUrl) return null;

  try {
    const response = await fetch(`${helsinkiUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.translation || null;
  } catch {
    return null;
  }
}

// ── Gemma TranslateGemma-12B via Modal serverless GPU ────────────────────────
async function translateWithGemma(text: string, sourceLang: string): Promise<string | null> {
  const modalUrl = process.env.GEMMA_TRANSLATE_URL;
  if (!modalUrl) return null;

  try {
    const response = await fetch(`${modalUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_lang: sourceLang }),
      signal: AbortSignal.timeout(600000), // 10 min for first cold start
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

    // 1. Check cache
    const cacheKey = `${mode ?? 'translate'}:${sourceLang ?? 'en'}:${text}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json({ translation: cached, cached: true });

    // 2. Local phrase library (fast, no AI needed) — skip for 'answer' mode
    if (mode !== 'answer') {
      const local = findLocalTranslation(text);
      if (local) {
        setCached(cacheKey, local);
        return NextResponse.json({ translation: local, source: 'local' });
      }
    }

    // 3. Gemma (gateremark fine-tuned) — PRIMARY translator for ALL modes
    // This is the best model for Kikuyu — use it for translate AND answer
    const gemmaResult = await translateWithGemma(text, sourceLang ?? 'en');
    if (gemmaResult && gemmaResult !== text && gemmaResult.length > 2) {
      console.log('[Translate] Gemma result:', gemmaResult.slice(0, 100));
      // Do NOT phoneticConvert Gemma output — it already has proper diacritics (ĩ, ũ)
      // phoneticConvert strips diacritics (ũ→u, ĩ→i) which corrupts the output
      setCached(cacheKey, gemmaResult);
      return NextResponse.json({ translation: gemmaResult, source: 'gemma' });
    }

    // 4. GPT-4o — fallback only when Gemma is unreachable or returned empty
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

    const phonetic = phoneticConvert(result);
    setCached(cacheKey, phonetic);
    return NextResponse.json({ translation: phonetic, source: 'gpt-4o' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown server error' }, { status: 500 });
  }
}
