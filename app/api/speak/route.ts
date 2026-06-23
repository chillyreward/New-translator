import { NextResponse } from 'next/server';
import { synthesizeWithOpenAI } from '@/lib/openaiTTS';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execAsync = promisify(exec);

export const maxDuration = 300; // 5 min — long passages need more time

/**
 * Resample any WAV to 48kHz and normalize volume to broadcast level.
 * MMS outputs 16kHz — this brings it up to c-elo quality range.
 */
async function resampleAndNormalize(input: Buffer): Promise<Buffer> {
  const tmpIn  = path.join(os.tmpdir(), `tts_in_${Date.now()}.wav`);
  const tmpOut = path.join(os.tmpdir(), `tts_out_${Date.now()}.wav`);
  try {
    fs.writeFileSync(tmpIn, input);
    await execAsync(
      `ffmpeg -i "${tmpIn}" -af "aresample=48000,loudnorm=I=-18:TP=-1:LRA=7" -acodec pcm_s16le -ar 48000 -ac 1 "${tmpOut}" -y`
    );
    return fs.readFileSync(tmpOut);
  } catch (e: any) {
    console.warn('[Speak] ffmpeg normalize failed:', e.message?.split('\n')[0]);
    return input;
  } finally {
    try { fs.unlinkSync(tmpIn); } catch {}
    try { fs.unlinkSync(tmpOut); } catch {}
  }
}

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

// ── Engine 1: MMS (Modal GPU) ─────────────────────────────────────────────────
async function synthesizeMMS(text: string, speed: number): Promise<Buffer> {
  const mmsUrl = process.env.MMS_TTS_URL;
  if (!mmsUrl) throw new Error('MMS_TTS_URL not configured');

  const res = await fetch(`${mmsUrl}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, speed }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`MMS error: ${res.status}`);
  const raw = Buffer.from(await res.arrayBuffer());
  // Upsample 16kHz → 48kHz + normalize
  return resampleAndNormalize(raw);
}

// ── Engine 2: OpenVoice v2 (local, port 5004) ─────────────────────────────────
// Two-stage: MMS for phonemes → OpenVoice for voice conversion using celo_reference.wav
async function synthesizeOpenVoice(text: string, speed: number): Promise<Buffer> {
  const openvoiceUrl = process.env.OPENVOICE_URL || 'http://localhost:5004';

  // Stage 1 — get MMS audio for correct Kikuyu phonemes
  let sourceAudio: Buffer;
  try {
    const mmsUrl = process.env.MMS_TTS_URL;
    if (mmsUrl) {
      const mmsRes = await fetch(`${mmsUrl}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed }),
        signal: AbortSignal.timeout(60000),
      });
      sourceAudio = mmsRes.ok ? Buffer.from(await mmsRes.arrayBuffer()) : Buffer.alloc(0);
    } else {
      sourceAudio = Buffer.alloc(0);
    }
  } catch {
    sourceAudio = Buffer.alloc(0);
  }

  if (sourceAudio.length === 0) {
    throw new Error('MMS returned no audio — cannot run OpenVoice conversion');
  }

  // Prepend 0.3s of silence to the MMS audio before sending to OpenVoice.
  // This prevents the first syllable from being clipped during voice conversion
  // because OpenVoice needs a small audio context window to initialize correctly.
  const prependedAudio = prependSilenceToWav(sourceAudio, 0.3);

  // Stage 2 — send MMS audio to OpenVoice for voice conversion
  const formData = new FormData();
  formData.append('text', text);
  formData.append('speed', speed.toString());
  formData.append('source_audio', new Blob([new Uint8Array(prependedAudio)], { type: 'audio/wav' }), 'source.wav');

  const res = await fetch(`${openvoiceUrl}/convert`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`OpenVoice error: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Prepend N seconds of silence to a WAV buffer.
 * Reads the sample rate from the WAV header and inserts zero-filled PCM samples.
 */
function prependSilenceToWav(wavBuffer: Buffer, seconds: number): Buffer {
  try {
    // WAV header: bytes 24-27 = sample rate (little-endian uint32)
    //             bytes 34-35 = bits per sample
    //             bytes 22-23 = num channels
    const sampleRate   = wavBuffer.readUInt32LE(24);
    const numChannels  = wavBuffer.readUInt16LE(22);
    const bitsPerSample = wavBuffer.readUInt16LE(34);
    const bytesPerSample = bitsPerSample / 8;
    const silenceSamples = Math.floor(sampleRate * seconds);
    const silenceBytes   = silenceSamples * numChannels * bytesPerSample;
    const silence        = Buffer.alloc(silenceBytes, 0);

    // Update the data chunk size and RIFF chunk size in the header
    const originalDataSize = wavBuffer.readUInt32LE(40);
    const newDataSize      = originalDataSize + silenceBytes;
    const newRiffSize      = wavBuffer.readUInt32LE(4) + silenceBytes;

    const newHeader = Buffer.from(wavBuffer.subarray(0, 44));
    newHeader.writeUInt32LE(newRiffSize, 4);
    newHeader.writeUInt32LE(newDataSize, 40);

    // data starts at byte 44 in a standard WAV
    return Buffer.concat([newHeader, silence, wavBuffer.subarray(44)]);
  } catch {
    // If header parsing fails, just return original
    return wavBuffer;
  }
}

// ── Engine 4: RVC (local, port 5005) ──────────────────────────────────────────
// Two-stage: MMS for phonemes → RVC for voice conversion using pretrained model
async function synthesizeRVC(text: string, speed: number): Promise<Buffer> {
  const rvcUrl = process.env.RVC_URL || 'http://localhost:5005';

  // Stage 1 — MMS audio
  let sourceAudio: Buffer = Buffer.alloc(0);
  try {
    const mmsUrl = process.env.MMS_TTS_URL;
    if (mmsUrl) {
      const mmsRes = await fetch(`${mmsUrl}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed }),
        signal: AbortSignal.timeout(60000),
      });
      if (mmsRes.ok) sourceAudio = Buffer.from(await mmsRes.arrayBuffer());
    }
  } catch {}

  // Stage 2 — RVC voice conversion
  const formData = new FormData();
  formData.append('pitch_shift', '0');           // 0 semitones = same pitch
  formData.append('f0_method', 'rmvpe');         // best pitch extraction method
  formData.append('index_rate', '0.75');         // voice similarity to training data
  if (sourceAudio.length > 0) {
    formData.append('audio', new Blob([new Uint8Array(sourceAudio)], { type: 'audio/wav' }), 'input.wav');
  }

  const res = await fetch(`${rvcUrl}/convert`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`RVC error: ${res.status}`);
  const converted = Buffer.from(await res.arrayBuffer());
  return resampleAndNormalize(converted);
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { text, voice, speed, engine = 'mms' } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const ttsSpeed  = typeof speed === 'number' ? Math.max(0.5, Math.min(1.5, speed)) : 0.75;
    const openaiKey = process.env.OPENAI_API_KEY;

    console.log(`[Speak] Engine: ${engine} | Speed: ${ttsSpeed} | Length: ${text.length} chars`);

    // Route to selected engine
    try {
      let audioBuffer: Buffer;

      switch (engine) {
        case 'openvoice':
          audioBuffer = await synthesizeOpenVoice(text, ttsSpeed);
          break;
        case 'rvc':
          audioBuffer = await synthesizeRVC(text, ttsSpeed);
          break;
        case 'mms':
        default:
          audioBuffer = await synthesizeMMS(text, ttsSpeed);
          break;
      }

      console.log(`[Speak] ${engine} succeeded — ${audioBuffer.length} bytes`);
      return new NextResponse(bufferToArrayBuffer(audioBuffer), {
        headers: { 'Content-Type': 'audio/wav' },
      });

    } catch (engineErr: any) {
      console.warn(`[Speak] ${engine} failed: ${engineErr.message?.split('\n')[0]}`);

      // Auto-fallback chain: any engine failure → try MMS → OpenAI
      if (engine !== 'mms') {
        try {
          console.log('[Speak] Falling back to MMS...');
          const audioBuffer = await synthesizeMMS(text, ttsSpeed);
          return new NextResponse(bufferToArrayBuffer(audioBuffer), {
            headers: { 'Content-Type': 'audio/wav', 'X-Fallback': 'mms' },
          });
        } catch (mmsErr: any) {
          console.warn('[Speak] MMS fallback failed:', mmsErr.message?.split('\n')[0]);
        }
      }

      // Last resort — OpenAI
      if (openaiKey) {
        console.log('[Speak] Falling back to OpenAI TTS...');
        const openaiSpeed = Math.max(0.25, Math.min(4.0, ttsSpeed));
        const audioBuffer = await synthesizeWithOpenAI(text, openaiKey, voice ?? 'onyx', openaiSpeed);
        return new NextResponse(audioBuffer, {
          headers: { 'Content-Type': 'audio/mpeg', 'X-Fallback': 'openai' },
        });
      }

      return NextResponse.json(
        { error: `${engine} failed: ${engineErr.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[Speak]', error.message);
    return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
  }
}
