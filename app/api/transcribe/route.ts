import { NextResponse } from 'next/server';

export const maxDuration = 60;

/**
 * Transcription priority:
 * 1. MMS-1b-all (Meta) via HuggingFace — best for Kikuyu/African languages
 * 2. OpenAI Whisper — fallback for English input
 */

async function transcribeWithMMS(audioFile: File, hfToken: string): Promise<string | null> {
  try {
    // MMS-1b-all supports 1,107 languages including Kikuyu (kik)
    const arrayBuffer = await audioFile.arrayBuffer();

    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/mms-1b-all',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': audioFile.type || 'audio/webm',
        },
        body: arrayBuffer,
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('[MMS ASR] failed:', response.status, err?.error ?? '');
      return null;
    }

    const data = await response.json();
    const text = data?.text || data?.transcription || null;
    if (text) console.log('[MMS ASR] transcript:', text.slice(0, 100));
    return text?.trim() || null;
  } catch (err: any) {
    console.warn('[MMS ASR] fetch failed:', err.message);
    return null;
  }
}

async function transcribeWithWhisper(audioFile: File, openaiKey: string, language: string): Promise<string> {
  const whisperFormData = new FormData();
  whisperFormData.append('file', audioFile);
  whisperFormData.append('model', 'whisper-1');
  if (language && language !== 'auto') {
    whisperFormData.append('language', language);
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}` },
    body: whisperFormData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Whisper transcription failed');
  }

  const data = await response.json();
  return data.text?.trim() ?? '';
}

export async function POST(request: Request) {
  try {
    const formData  = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language  = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const hfToken   = process.env.HUGGINGFACE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Try MMS-1b-all first (better for Kikuyu)
    if (hfToken) {
      const mmsText = await transcribeWithMMS(audioFile, hfToken);
      if (mmsText) {
        return NextResponse.json({ transcript: mmsText, model: 'mms-1b-all' });
      }
    }

    // 2. Fall back to Whisper
    if (!openaiKey) {
      return NextResponse.json({
        error: 'No transcription service available. Add OPENAI_API_KEY or HUGGINGFACE_API_KEY.'
      }, { status: 500 });
    }

    console.log('[Transcribe] Falling back to Whisper...');
    const whisperText = await transcribeWithWhisper(audioFile, openaiKey, language);
    return NextResponse.json({ transcript: whisperText, model: 'whisper-1' });

  } catch (error: any) {
    console.error('[Transcribe] error:', error.message);
    return NextResponse.json({ error: error.message || 'Unknown server error' }, { status: 500 });
  }
}
