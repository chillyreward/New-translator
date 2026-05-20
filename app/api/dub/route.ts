import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const TEMP_DIR = path.join(process.cwd(), 'temp');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'dubbed');

function ensureDirs() {
  [TEMP_DIR, OUTPUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
}

async function downloadVideo(url: string, outputPath: string) {
  await execAsync(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" -o "${outputPath}" "${url}"`);
}

async function extractAudio(videoPath: string, audioPath: string) {
  await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`);
}

async function transcribeWithTimestamps(audioPath: string, apiKey: string) {
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

async function translateSegment(text: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `You are an expert Kikuyu translator. Translate this to natural spoken Kikuyu. Return ONLY the Kikuyu translation.\n\n${text}`
      }],
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function synthesizeSegment(text: string, outputPath: string, coquiUrl?: string, openaiKey?: string) {
  if (coquiUrl) {
    // Use Coqui for voice cloning
    const res = await fetch(`${coquiUrl}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'en' }),
      signal: AbortSignal.timeout(60000),
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      return;
    }
  }
  // Fallback to OpenAI TTS
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'tts-1', voice: 'onyx', input: text, response_format: 'wav', speed: 0.85 }),
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      return;
    }
  }
  throw new Error('No TTS engine available');
}

async function buildDubbedAudio(segments: any[], tempDir: string, totalDuration: number): Promise<string> {
  // Create a silent base track
  const silentPath = path.join(tempDir, 'silent.wav');
  await execAsync(`ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t ${totalDuration} "${silentPath}" -y`);

  // Build ffmpeg filter to overlay each segment at the right timestamp
  const inputs = [`-i "${silentPath}"`];
  const filterParts: string[] = [];
  let prevLabel = '0:a';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segPath = path.join(tempDir, `seg_${i}.wav`);
    if (!fs.existsSync(segPath)) continue;

    inputs.push(`-i "${segPath}"`);
    const inputIdx = i + 1;
    const outLabel = `mix${i}`;
    filterParts.push(`[${prevLabel}][${inputIdx}:a]adelay=${Math.round(seg.start * 1000)}|${Math.round(seg.start * 1000)},amix=inputs=2:duration=longest[${outLabel}]`);
    prevLabel = outLabel;
  }

  const dubbedAudioPath = path.join(tempDir, 'dubbed_audio.wav');
  const filterComplex = filterParts.join(';');
  const cmd = `ffmpeg ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[${prevLabel}]" "${dubbedAudioPath}" -y`;
  await execAsync(cmd);
  return dubbedAudioPath;
}

async function mergeVideoAudio(videoPath: string, audioPath: string, outputPath: string) {
  // Mix original video (muted) with dubbed audio
  await execAsync(
    `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outputPath}" -y`
  );
}

export async function POST(request: Request) {
  ensureDirs();
  const timestamp = Date.now();

  try {
    const { youtubeUrl } = await request.json();
    if (!youtubeUrl) return NextResponse.json({ error: 'YouTube URL required' }, { status: 400 });

    const openaiKey = process.env.OPENAI_API_KEY;
    const coquiUrl = process.env.COQUI_TTS_URL;

    if (!openaiKey) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });

    const videoPath   = path.join(TEMP_DIR, `video_${timestamp}.mp4`);
    const audioPath   = path.join(TEMP_DIR, `audio_${timestamp}.wav`);
    const outputPath  = path.join(OUTPUT_DIR, `dubbed_${timestamp}.mp4`);
    const segTempDir  = path.join(TEMP_DIR, `segs_${timestamp}`);
    fs.mkdirSync(segTempDir, { recursive: true });

    // Step 1: Download video
    console.log('[Dub] Downloading video...');
    await downloadVideo(youtubeUrl, videoPath);

    // Step 2: Extract audio
    console.log('[Dub] Extracting audio...');
    await extractAudio(videoPath, audioPath);

    // Step 3: Transcribe with timestamps
    console.log('[Dub] Transcribing...');
    const transcription = await transcribeWithTimestamps(audioPath, openaiKey);
    const segments = transcription.segments || [];
    const totalDuration = transcription.duration || 60;

    console.log(`[Dub] Got ${segments.length} segments, duration: ${totalDuration}s`);

    // Step 4 & 5: Translate and synthesize each segment
    const processedSegments = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      console.log(`[Dub] Segment ${i + 1}/${segments.length}: "${seg.text.substring(0, 40)}..."`);

      const kikuyu = await translateSegment(seg.text, openaiKey);
      const segAudioPath = path.join(segTempDir, `seg_${i}.wav`);
      await synthesizeSegment(kikuyu, segAudioPath, coquiUrl, openaiKey);

      processedSegments.push({ ...seg, kikuyu, audioPath: segAudioPath });
    }

    // Step 6: Build dubbed audio track
    console.log('[Dub] Building dubbed audio track...');
    const dubbedAudioPath = await buildDubbedAudio(processedSegments, segTempDir, totalDuration);

    // Step 7: Merge with video
    console.log('[Dub] Merging with video...');
    await mergeVideoAudio(videoPath, dubbedAudioPath, outputPath);

    // Cleanup temp files
    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
    fs.rmSync(segTempDir, { recursive: true, force: true });

    const videoUrl = `/dubbed/dubbed_${timestamp}.mp4`;
    console.log('[Dub] Done:', videoUrl);

    return NextResponse.json({
      success: true,
      videoUrl,
      segments: processedSegments.map(s => ({
        start: s.start,
        end: s.end,
        original: s.text,
        kikuyu: s.kikuyu,
      })),
    });

  } catch (error: any) {
    console.error('[Dub]', error.message);
    // Cleanup on error
    try { fs.rmSync(path.join(TEMP_DIR, `segs_${timestamp}`), { recursive: true, force: true }); } catch {}
    return NextResponse.json({ error: error.message || 'Dubbing failed' }, { status: 500 });
  }
}
