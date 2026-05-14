import { NextResponse } from 'next/server';
import { localTranslate, hasLocalTranslation } from '@/lib/localTranslate';
import { searchPhrases, phoneticConvert } from '@/lib/kikuyuPhrases';
import { getCached, setCached } from '@/lib/translationCache';
import { audioLibrary, phraseDictionary } from '@/lib/dictionary';
import { translateWithGooey } from '@/lib/gooeyTranslate';

function findLocalTranslation(text: string): string | null {
  if (hasLocalTranslation(text)) return localTranslate(text);
  const results = searchPhrases(text);
  return results.length > 0 ? phoneticConvert(results[0].kikuyu) : null;
}

const KIKUYU_GUIDE = `You are an expert Kikuyu (Gĩkũyũ) linguist and native speaker from Central Kenya.

KIKUYU VOWEL SOUNDS:
- a = "arm", e = "egg", i = "in", o = "opposite", u = "ululation"
- í = "it" (high tone), ú = "own/oat/oak" (high tone rounded o)

GRAMMAR:
- Nĩ = emphasis prefix before verbs
- Person prefixes: nd(i)=I, tu=we, w=you, (none)=he/she, m=they
- ci/ce → sh sound (ciara=shiara)
- Double ũũ = long "oo", Rũ = "RO"
- Use proper diacritics (ĩ, ũ) in natural Kikuyu speech
- Match the register — casual stays casual, formal stays formal`;

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
      temperature: 0.3,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI failed');
  return data.choices[0].message.content.trim();
}

async function translateWithOpenAI(text: string, sourceLang: string, apiKey: string): Promise<string> {
  const isSwahili = sourceLang === 'sw';
  const system = `${KIKUYU_GUIDE}

Your task: Translate the given ${isSwahili ? 'Kiswahili' : 'English'} text into natural spoken Kikuyu.
Return ONLY the Kikuyu translation. No explanations, no alternatives.`;
  return callOpenAI(system, text, apiKey);
}

async function answerInKikuyu(text: string, sourceLang: string, apiKey: string): Promise<string> {
  const isSwahili = sourceLang === 'sw';
  const system = `${KIKUYU_GUIDE}

Your task: The user has asked a question or made a statement in ${isSwahili ? 'Kiswahili' : 'English'}.
Understand what they are asking, then respond naturally IN KIKUYU as a native speaker would.
Do NOT translate the question — ANSWER it in Kikuyu.
Keep the answer concise and natural (1–3 sentences).
Return ONLY the Kikuyu response. No explanations.`;
  return callOpenAI(system, text, apiKey);
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

    // 1. Check audio library — serve pre-recorded file path
    const audioPath = audioLibrary[text.toLowerCase()];
    if (audioPath) {
      const kikuyuText = phraseDictionary[text.toLowerCase()]
        ?? findLocalTranslation(text)
        ?? text;
      return NextResponse.json({ translation: kikuyuText, audioUrl: audioPath });
    }

    // 2. Check cache
    const cacheKey = `${mode ?? 'translate'}:${text}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json({ translation: cached, cached: true });

    // 3. Try local phrase library (translate mode only)
    if (mode !== 'answer') {
      const local = findLocalTranslation(text);
      if (local) {
        setCached(cacheKey, local);
        return NextResponse.json({ translation: local });
      }
    }

    // 4. Try Gooey for translation (not for answer mode)
    if (mode !== 'answer') {
      try {
        const gooeyResult = await translateWithGooey(text, sourceLang === 'sw' ? 'sw' : 'en');
        if (gooeyResult && gooeyResult !== text) {
          const phonetic = phoneticConvert(gooeyResult);
          setCached(cacheKey, phonetic);
          return NextResponse.json({ translation: phonetic });
        }
      } catch { /* fall through */ }
    }

    // 5. OpenAI — answer mode OR translation fallback
    if (!apiKey) {
      return NextResponse.json({
        error: 'No translation available. Add an OPENAI_API_KEY for AI fallback.'
      }, { status: 500 });
    }

    let result: string;

    if (mode === 'answer' || (mode !== 'translate' && isQuestion(text))) {
      // Understand the question and answer in Kikuyu
      result = await answerInKikuyu(text, sourceLang ?? 'en', apiKey);
    } else {
      // Translate to Kikuyu
      result = await translateWithOpenAI(text, sourceLang ?? 'en', apiKey);
    }

    const phonetic = phoneticConvert(result);
    setCached(cacheKey, phonetic);
    return NextResponse.json({ translation: phonetic, mode: mode ?? (isQuestion(text) ? 'answer' : 'translate') });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown server error' }, { status: 500 });
  }
}
