import { NextResponse } from 'next/server';
import { synthesizeWithOpenAI } from '@/lib/openaiTTS';
import { synthesizeWithCoqui } from '@/lib/coquiTTS';

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();

    const coquiUrl  = process.env.COQUI_TTS_URL;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Try Coqui first if configured, fall back to OpenAI on any failure
    if (coquiUrl) {
      try {
        const audioBuffer = await synthesizeWithCoqui(text);
        return new NextResponse(audioBuffer, {
          headers: { 'Content-Type': 'audio/wav' },
        });
      } catch (coquiErr: any) {
        console.warn('[Speak] Coqui failed, falling back to OpenAI:', coquiErr.message);
      }
    }

    // OpenAI TTS fallback
    if (!openaiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }
    const audioBuffer = await synthesizeWithOpenAI(text, openaiKey, voice ?? 'onyx');
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (error: any) {
    console.error('[Speak]', error.message);
    return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
  }
}
