import { NextResponse } from 'next/server';
import { synthesizeWithOpenAI } from '@/lib/openaiTTS';
import { synthesizeWithCoqui } from '@/lib/coquiTTS';

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();

    const mmsUrl    = process.env.MMS_TTS_URL;
    const coquiUrl  = process.env.COQUI_TTS_URL;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Local Meta MMS-TTS — best native Kikuyu pronunciation
    if (mmsUrl) {
      try {
        console.log('[Speak] Trying local MMS TTS...');
        const response = await fetch(`${mmsUrl}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: AbortSignal.timeout(30000), // 30s timeout
        });
        if (!response.ok) throw new Error(`MMS server error: ${response.status}`);
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: { 'Content-Type': 'audio/wav' },
        });
      } catch (mmsErr: any) {
        console.warn('[Speak] MMS TTS failed, trying Coqui:', mmsErr.message);
      }
    }

    // 2. Coqui XTTS v2 — voice cloning fallback
    if (coquiUrl) {
      try {
        console.log('[Speak] Trying Coqui TTS...');
        const audioBuffer = await synthesizeWithCoqui(text);
        return new NextResponse(audioBuffer, {
          headers: { 'Content-Type': 'audio/wav' },
        });
      } catch (coquiErr: any) {
        console.warn('[Speak] Coqui failed, trying OpenAI:', coquiErr.message);
      }
    }

    // 3. OpenAI TTS — last resort fallback
    if (!openaiKey) {
      return NextResponse.json({ error: 'No TTS service available' }, { status: 500 });
    }
    console.log('[Speak] Falling back to OpenAI TTS...');
    const audioBuffer = await synthesizeWithOpenAI(text, openaiKey, voice ?? 'onyx');
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (error: any) {
    console.error('[Speak]', error.message);
    return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
  }
}
