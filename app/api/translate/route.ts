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

async function translateWithOpenAI(text: string, sourceLang: string, apiKey: string): Promise<string> {
  const isSwahili = sourceLang === 'sw';

  const kikuyuGuide = `You are a native Kikuyu speaker from Central Kenya. Translate to natural spoken Kikuyu only — no explanations.

KIKUYU VOWEL PRONUNCIATION:
- a = like "arm" (open back)
- e = like "egg" (short e)
- i = like "in" (short i)
- o = like "opposite" (short o)
- u = like "ululation" (short u)
- í = like "it" (high tone i)
- ú = like "own/oat/oak" (high tone, rounded — like the 'o' in "own")

KEY GRAMMAR RULES:
- Nĩ = emphasis prefix before verbs
- Verb person prefixes: nd(i)=I, tu=we, w=you, (none)=he/she, m=they
- Example (root "oka"=come): Nĩndoka=I have come, Nĩtuoka=we, Nĩwoka=you, Nĩoka=he/she, Nĩmoka=they
- ci/ce = always pronounced as sh (ciara=shiara)
- Double ũũ = long stretchy "oo" sound
- Rũ = pronounced as "RO"
- ú = "own/oat" sound (rounded o)
- í = short "it" sound`;

  const prompt = isSwahili
    ? `${kikuyuGuide}\n\nTranslate this Kiswahili to Kikuyu:\n${text}`
    : `${kikuyuGuide}\n\nTranslate this English to Kikuyu:\n${text}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Translation failed');
  return data.choices[0].message.content.trim();
}

export async function POST(request: Request) {
  try {
    const { text, sourceLang } = await request.json();
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
    const cached = getCached(text);
    if (cached) return NextResponse.json({ translation: cached, cached: true });

    // 3. Try local phrase library first
    const local = findLocalTranslation(text);
    if (local) {
      setCached(text, local);
      return NextResponse.json({ translation: local });
    }

    // 4. Try Gooey — Kikuyu-specific model
    try {
      const gooeyResult = await translateWithGooey(text, sourceLang === 'sw' ? 'sw' : 'en');
      if (gooeyResult && gooeyResult !== text) {
        const phonetic = phoneticConvert(gooeyResult);
        setCached(text, phonetic);
        return NextResponse.json({ translation: phonetic });
      }
    } catch { /* fall through to OpenAI */ }

    // 5. OpenAI fallback
    if (!apiKey) {
      return NextResponse.json({
        error: 'No translation available. Add an OPENAI_API_KEY for AI fallback.'
      }, { status: 500 });
    }

    const kikuyu = await translateWithOpenAI(text, sourceLang ?? 'en', apiKey);
    const phonetic = phoneticConvert(kikuyu);
    setCached(text, phonetic);
    return NextResponse.json({ translation: phonetic });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown server error' }, { status: 500 });
  }
}
