import { NextResponse } from 'next/server';
import { synthesizeWithOpenAI } from '@/lib/openaiTTS';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execAsync = promisify(exec);

export const maxDuration = 60;

/**
 * Resample MMS 16kHz output → 48kHz and normalize volume to ~-18dB peak.
 * This closes the quality gap vs natural speech recordings.
 * Falls back to raw buffer if ffmpeg isn't available.
 */
async function resampleAndNormalize(input: Buffer): Promise<Buffer> {
  const tmpIn  = path.join(os.tmpdir(), `mms_in_${Date.now()}.wav`);
  const tmpOut = path.join(os.tmpdir(), `mms_out_${Date.now()}.wav`);
  try {
    fs.writeFileSync(tmpIn, input);
    // aresample=48000 — upsample to 48kHz (matches c-elo reference)
    // loudnorm — normalize to -18 LUFS integrated, -1 dBTP true peak (natural broadcast level)
    await execAsync(
      `ffmpeg -i "${tmpIn}" -af "aresample=48000,loudnorm=I=-18:TP=-1:LRA=7" -acodec pcm_s16le -ar 48000 -ac 1 "${tmpOut}" -y`
    );
    const result = fs.readFileSync(tmpOut);
    return result;
  } catch (e: any) {
    console.warn('[Speak] ffmpeg resample failed, returning raw audio:', e.message?.split('\n')[0]);
    return input; // graceful fallback
  } finally {
    try { fs.unlinkSync(tmpIn); } catch {}
    try { fs.unlinkSync(tmpOut); } catch {}
  }
}

export async function POST(request: Request) {
  try {
    const { text, voice, speed } = await request.json();

    const mmsUrl    = process.env.MMS_TTS_URL;
    const openaiKey = process.env.OPENAI_API_KEY;

    // MMS accepts 0.5–1.5; default 0.75 = natural pace for Kikuyu
    const ttsSpeed = typeof speed === 'number' ? Math.max(0.5, Math.min(1.5, speed)) : 0.75;

    // 1. Modal MMS-TTS (GPU) — best native Kikuyu pronunciation
    if (mmsUrl) {
      try {
        console.log(`[Speak] Trying Modal MMS TTS (speed=${ttsSpeed})...`);
        const response = await fetch(`${mmsUrl}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, speed: ttsSpeed }),
          signal: AbortSignal.timeout(45000),
        });
        if (!response.ok) throw new Error(`MMS server error: ${response.status}`);
        const rawBuffer = await response.arrayBuffer();

        // MMS outputs 16kHz mono — upsample to 48kHz and normalize volume
        // so it sounds closer to natural speech (c-elo reference: 48kHz, -20dB peak)
        const normalized = await resampleAndNormalize(Buffer.from(rawBuffer));
        console.log('[Speak] Modal MMS TTS succeeded');
        // Convert Node Buffer → plain ArrayBuffer for NextResponse
        const ab = normalized.buffer as ArrayBuffer;
        const slice = ab.slice(normalized.byteOffset, normalized.byteOffset + normalized.byteLength);
        return new NextResponse(slice, {
          headers: { 'Content-Type': 'audio/wav' },
        });
      } catch (mmsErr: any) {
        console.warn('[Speak] Modal MMS TTS failed, trying OpenAI:', mmsErr.message);
      }
    }

    // 2. OpenAI TTS — reliable fallback
    if (!openaiKey) {
      return NextResponse.json({ error: 'No TTS service available' }, { status: 500 });
    }
    console.log('[Speak] Falling back to OpenAI TTS...');
    // Map our 0.5–1.5 speed range to OpenAI's 0.25–4.0 range
    const openaiSpeed = Math.max(0.25, Math.min(4.0, ttsSpeed));
    const audioBuffer = await synthesizeWithOpenAI(text, openaiKey, voice ?? 'onyx', openaiSpeed);
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (error: any) {
    console.error('[Speak]', error.message);
    return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
  }
}
