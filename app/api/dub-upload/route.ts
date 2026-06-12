import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

export const maxDuration = 300;

const execAsync = promisify(exec);
const TEMP_DIR = path.join(process.cwd(), 'temp');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'dubbed');

function ensureDirs() {
  [TEMP_DIR, OUTPUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
}

async function extractAudio(videoPath: string, audioPath: string) {
  await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`);
}

async function transcribeChunk(audioPath: string, apiKey: string) {
  const formData = new FormData();
  const audioBuffer = fs.readFileSync(audioPath);
  const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'segment');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Whisper failed: ${res.status}`);
  return res.json();
}

async function transcribeWithTimestamps(audioPath: string, apiKey: string) {
  const stats = fs.statSync(audioPath);
  const fileSizeMB = stats.size / (1024 * 1024);

  if (fileSizeMB < 24) return transcribeChunk(audioPath, apiKey);

  const chunkDir = path.join(path.dirname(audioPath), 'chunks_' + Date.now());
  fs.mkdirSync(chunkDir, { recursive: true });
  await execAsync(`ffmpeg -i "${audioPath}" -f segment -segment_time 600 -c copy "${path.join(chunkDir, 'chunk_%03d.wav')}" -y`);

  const chunkFiles = fs.readdirSync(chunkDir).filter(f => f.endsWith('.wav')).sort().map(f => path.join(chunkDir, f));
  const allSegments: any[] = [];
  let timeOffset = 0;

  for (const chunk of chunkFiles) {
    const result = await transcribeChunk(chunk, apiKey);
    const segs = (result.segments || []).map((s: any) => ({ ...s, start: s.start + timeOffset, end: s.end + timeOffset }));
    allSegments.push(...segs);
    timeOffset += result.duration || 600;
  }

  fs.rmSync(chunkDir, { recursive: true, force: true });
  return { segments: allSegments, duration: timeOffset };
}

async function translateSegment(text: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Translate to natural spoken Kikuyu. Return ONLY the translation.\n\n${text}` }],
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function synthesizeSegment(text: string, outputPath: string, mmsUrl?: string, openaiKey?: string) {
  if (mmsUrl) {
    try {
      const res = await fetch(`${mmsUrl}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(60000),
      });
      if (res.ok) {
        fs.writeFileSync(outputPath, Buffer.from(await res.arrayBuffer()));
        return;
      }
    } catch (e: any) {
      console.warn('[DubUpload] MMS TTS failed:', e.message);
    }
  }
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'tts-1', voice: 'onyx', input: text, response_format: 'wav', speed: 0.85 }),
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) {
      fs.writeFileSync(outputPath, Buffer.from(await res.arrayBuffer()));
      return;
    }
  }
  throw new Error('No TTS engine available');
}

async function buildDubbedAudio(segments: any[], tempDir: string, totalDuration: number): Promise<string> {
  const silentPath = path.join(tempDir, 'silent.wav');
  await execAsync(`ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t ${totalDuration} "${silentPath}" -y`);

  const inputs = [`-i "${silentPath}"`];
  const filterParts: string[] = [];
  let prevLabel = '0:a';

  for (let i = 0; i < segments.length; i++) {
    const segPath = path.join(tempDir, `seg_${i}.wav`);
    if (!fs.existsSync(segPath)) continue;
    inputs.push(`-i "${segPath}"`);
    const outLabel = `mix${i}`;
    filterParts.push(`[${prevLabel}][${i + 1}:a]adelay=${Math.round(segments[i].start * 1000)}|${Math.round(segments[i].start * 1000)},amix=inputs=2:duration=longest[${outLabel}]`);
    prevLabel = outLabel;
  }

  const dubbedAudioPath = path.join(tempDir, 'dubbed_audio.wav');
  await execAsync(`ffmpeg ${inputs.join(' ')} -filter_complex "${filterParts.join(';')}" -map "[${prevLabel}]" "${dubbedAudioPath}" -y`);
  return dubbedAudioPath;
}

async function mergeVideoAudio(videoPath: string, audioPath: string, outputPath: string) {
  await execAsync(`ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outputPath}" -y`);
}

export async function POST(request: Request) {
  ensureDirs();
  const timestamp = Date.now();

  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    if (!videoFile) return NextResponse.json({ error: 'No video file provided' }, { status: 400 });

    const openaiKey = process.env.OPENAI_API_KEY;
    const mmsUrl = process.env.MMS_TTS_URL;
    if (!openaiKey) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });

    // Save uploaded video
    const videoPath  = path.join(TEMP_DIR, `upload_${timestamp}.mp4`);
    const audioPath  = path.join(TEMP_DIR, `audio_${timestamp}.wav`);
    const outputPath = path.join(OUTPUT_DIR, `dubbed_${timestamp}.mp4`);
    const segTempDir = path.join(TEMP_DIR, `segs_${timestamp}`);
    fs.mkdirSync(segTempDir, { recursive: true });

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    fs.writeFileSync(videoPath, buffer);
    console.log(`[DubUpload] Saved ${(buffer.length / 1024 / 1024).toFixed(1)}MB video`);

    console.log('[DubUpload] Extracting audio...');
    await extractAudio(videoPath, audioPath);

    console.log('[DubUpload] Transcribing...');
    const transcription = await transcribeWithTimestamps(audioPath, openaiKey);
    const segments = transcription.segments || [];
    const totalDuration = transcription.duration || 60;
    console.log(`[DubUpload] ${segments.length} segments, ${totalDuration}s`);

    const processedSegments = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      console.log(`[DubUpload] Segment ${i + 1}/${segments.length}`);
      const kikuyu = await translateSegment(seg.text, openaiKey);
      const segAudioPath = path.join(segTempDir, `seg_${i}.wav`);
      await synthesizeSegment(kikuyu, segAudioPath, mmsUrl, openaiKey);
      processedSegments.push({ ...seg, kikuyu });
    }

    console.log('[DubUpload] Building dubbed audio...');
    const dubbedAudioPath = await buildDubbedAudio(processedSegments, segTempDir, totalDuration);

    console.log('[DubUpload] Merging...');
    await mergeVideoAudio(videoPath, dubbedAudioPath, outputPath);

    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
    fs.rmSync(segTempDir, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      videoUrl: `/dubbed/dubbed_${timestamp}.mp4`,
      segments: processedSegments.map(s => ({ start: s.start, end: s.end, original: s.text, kikuyu: s.kikuyu })),
    });

  } catch (error: any) {
    console.error('[DubUpload]', error.message);
    try { fs.rmSync(path.join(TEMP_DIR, `segs_${timestamp}`), { recursive: true, force: true }); } catch {}
    return NextResponse.json({ error: error.message || 'Dubbing failed' }, { status: 500 });
  }
}
