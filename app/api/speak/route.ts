import { NextResponse } from 'next/server';
import { synthesizeWithOpenAI } from '@/lib/openaiTTS';
import { synthesizeWithCoqui } from '@/lib/coquiTTS';

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();

    const coquiUrl  = process.env.COQUI_TTS_URL;
    const openaiKey = process.env.OPENAI_API_KEY;

    let audioBuffer: ArrayBuffer;
    let contentType = 'audio/mpeg';

    if (coquiUrl) {
      // Coqui XTTS v2 — cloned Kikuyu voice (local server)
      audioBuffer = await synthesizeWithCoqui(text);
      contentType = 'audio/wav';
    } else {
      // Default: OpenAI TTS
      if (!openaiKey) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
      audioBuffer = await synthesizeWithOpenAI(text, openaiKey, voice ?? 'onyx');
    }

    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': contentType },
    });

  } catch (error: any) {
    console.error('[Speak]', error.message);
    return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
  }
}
