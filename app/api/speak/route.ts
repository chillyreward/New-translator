import { NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/elevenlabs';
import { synthesizeWithOpenAI } from '@/lib/openaiTTS';
import { synthesizeWithGooey } from '@/lib/gooeyTTS';
import { synthesizeWithCoqui } from '@/lib/coquiTTS';

export async function POST(request: Request) {
  try {
    const { text, engine, voice } = await request.json();

    const coquiUrl     = process.env.COQUI_TTS_URL;
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const openaiKey    = process.env.OPENAI_API_KEY;
    const gooeyKey     = process.env.GOOEY_API_KEY;
    const voiceId      = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

    let audioBuffer: ArrayBuffer;
    let contentType = 'audio/mpeg';

    if (engine === 'coqui' || coquiUrl) {
      // Coqui XTTS v2 — cloned Kikuyu voice
      audioBuffer = await synthesizeWithCoqui(text);
      contentType = 'audio/wav';
    } else if (engine === 'elevenlabs') {
      if (!elevenLabsKey) return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 });
      audioBuffer = await synthesizeSpeech(text, elevenLabsKey, voiceId);
    } else if (engine === 'gooey') {
      if (!gooeyKey) return NextResponse.json({ error: 'Missing GOOEY_API_KEY' }, { status: 500 });
      audioBuffer = await synthesizeWithGooey(text, gooeyKey);
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
