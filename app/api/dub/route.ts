import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

export const maxDuration = 800; // 13 min — long videos need more time

const execAsync = promisify(exec);
const TEMP_DIR = path.join(process.cwd(), 'temp');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'dubbed');

function ensureDirs() {
  [TEMP_DIR, OUTPUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
}

async function getFfmpegPath(): Promise<string> {
  // Allow explicit override via env var
  if (process.env.FFMPEG_PATH) return `"${process.env.FFMPEG_PATH}"`;

  if (process.platform === 'win32') {
    // Check PATH first
    try {
      const { stdout } = await execAsync('where ffmpeg');
      const found = stdout.trim().split('\n')[0].trim();
      console.log(`[Dub] Found ffmpeg in PATH: ${found}`);
      return `"${found}"`;
    } catch {}

    // Common install locations on Windows
    const candidates = [
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
      `${process.env.LOCALAPPDATA}\\Programs\\ffmpeg\\bin\\ffmpeg.exe`,
      `${process.env.USERPROFILE}\\ffmpeg\\bin\\ffmpeg.exe`,
    ];
    // Also scan WinGet packages folder for any ffmpeg install
    const wingetBase = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages`;
    if (wingetBase && fs.existsSync(wingetBase)) {
      try {
        const pkgs = fs.readdirSync(wingetBase).filter(d => d.toLowerCase().startsWith('gyan.ffmpeg'));
        for (const pkg of pkgs) {
          const pkgDir = path.join(wingetBase, pkg);
          // Walk one level deeper to find bin/ffmpeg.exe
          const builds = fs.readdirSync(pkgDir);
          for (const build of builds) {
            const candidate = path.join(pkgDir, build, 'bin', 'ffmpeg.exe');
            candidates.push(candidate);
          }
        }
      } catch {}
    }
    for (const c of candidates) {
      if (c && fs.existsSync(c)) {
        console.log(`[Dub] Found ffmpeg at: ${c}`);
        return `"${c}"`;
      }
    }
  }

  return 'ffmpeg'; // assume it's in PATH on Linux/Mac
}

async function downloadVideo(url: string, outputPath: string) {
  // Allow explicit override via env var (useful for servers with non-standard install paths)
  let ytDlp = process.env.YT_DLP_PATH ? `"${process.env.YT_DLP_PATH}"` : 'yt-dlp';

  if (!process.env.YT_DLP_PATH && process.platform === 'win32') {
    // Check if yt-dlp is in PATH first
    try {
      const { stdout } = await execAsync('where yt-dlp');
      ytDlp = `"${stdout.trim().split('\n')[0].trim()}"`;
      console.log(`[Dub] Found yt-dlp in PATH: ${ytDlp}`);
    } catch {
      // Fall back to common install locations — check both APPDATA (Roaming) and LOCALAPPDATA
      const appdata = process.env.APPDATA || '';
      const localappdata = process.env.LOCALAPPDATA || '';
      const versions = ['Python314', 'Python313', 'Python312', 'Python311', 'Python310', 'Python39'];
      const candidates: string[] = [];
      for (const ver of versions) {
        candidates.push(`${appdata}\\${ver}\\Scripts\\yt-dlp.exe`);
        candidates.push(`${appdata}\\Python\\${ver}\\Scripts\\yt-dlp.exe`);
        candidates.push(`${localappdata}\\Programs\\Python\\${ver}\\Scripts\\yt-dlp.exe`);
        candidates.push(`${localappdata}\\Programs\\Python\\Python${ver.replace('Python','')}\\Scripts\\yt-dlp.exe`);
      }
      // Also check direct LOCALAPPDATA paths (e.g. C:\Users\...\AppData\Local\Programs\Python\Python310\Scripts)
      candidates.push(`${localappdata}\\Programs\\Python\\Python310\\Scripts\\yt-dlp.exe`);
      candidates.push(`${localappdata}\\Programs\\Python\\Python311\\Scripts\\yt-dlp.exe`);
      candidates.push(`${localappdata}\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe`);

      for (const c of candidates) {
        if (c && fs.existsSync(c)) {
          ytDlp = `"${c}"`;
          console.log(`[Dub] Found yt-dlp at: ${c}`);
          break;
        }
      }
    }
  }

  console.log(`[Dub] Using yt-dlp: ${ytDlp}`);

  // Use cookies file if it exists on the Desktop (works on both swanti and Jambo server)
  const cookiesFile = path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'Desktop', 'cookies.txt');
  const cookiesFlag = fs.existsSync(cookiesFile) ? `--cookies "${cookiesFile}"` : '';

  if (cookiesFile && !fs.existsSync(cookiesFile)) {
    console.warn(`[Dub] No cookies.txt found at ${cookiesFile} — some videos may fail`);
  }

  // Use formats that have video+audio already combined (no DASH merging needed)
  // 18 = 360p mp4 with audio (https, single file — most reliable)
  // 93-11/94-11/95-11 = HLS streams with video+audio combined (en-US original)
  // Fall back to DASH merge as last resort
  const formatSelector = `"18/93-11/94-11/95-11/96-11/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best"`;
  // Strip extension from outputPath — yt-dlp will add it; we force mp4 with --merge-output-format
  const outputTemplate = outputPath.replace(/\.[^.]+$/, '');

  // Try multiple strategies in order — handles both old and new yt-dlp versions
  const strategies = [
    // 1. Best: cookies + remote JS solver + combined formats
    `${ytDlp} ${cookiesFlag} --remote-components ejs:github --merge-output-format mp4 -f ${formatSelector} -o "${outputTemplate}.%(ext)s" "${url}"`,
    // 2. Cookies + combined formats, no JS solver
    `${ytDlp} ${cookiesFlag} --merge-output-format mp4 -f ${formatSelector} -o "${outputTemplate}.%(ext)s" "${url}"`,
    // 3. tv_embedded client — bypasses JS challenge entirely
    `${ytDlp} ${cookiesFlag} --extractor-args "youtube:player_client=tv_embedded" --merge-output-format mp4 -f ${formatSelector} -o "${outputTemplate}.%(ext)s" "${url}"`,
    // 4. No cookies fallback for public videos
    `${ytDlp} --remote-components ejs:github --merge-output-format mp4 -f ${formatSelector} -o "${outputTemplate}.%(ext)s" "${url}"`,
  ];

  let lastError: any;
  for (let i = 0; i < strategies.length; i++) {
    const cmd = strategies[i];
    console.log(`[Dub] Strategy ${i + 1}/${strategies.length}: ${cmd}`);
    try {
      await execAsync(cmd);
      console.log(`[Dub] Strategy ${i + 1} succeeded`);
      // Find the actual downloaded file (yt-dlp picks the extension)
      for (const ext of ['mp4', 'mkv', 'webm', 'avi', 'm4a', 'mp3']) {
        const candidate = `${outputTemplate}.${ext}`;
        if (fs.existsSync(candidate)) {
          console.log(`[Dub] Downloaded file: ${candidate}`);
          if (ext === 'm4a' || ext === 'mp3') {
            console.warn(`[Dub] WARNING: Got audio-only file (${ext}) — video stream will be missing!`);
          }
          return candidate;
        }
      }
      // Fallback: scan the temp dir for any new video file
      const dir = path.dirname(outputTemplate);
      const base = path.basename(outputTemplate);
      const files = fs.readdirSync(dir).filter(f => f.startsWith(base));
      if (files.length > 0) {
        console.log(`[Dub] Found by scan: ${files[0]}`);
        return path.join(dir, files[0]);
      }
      throw new Error('Downloaded file not found after yt-dlp succeeded');
    } catch (e: any) {
      console.warn(`[Dub] Strategy ${i + 1} failed: ${e.message?.split('\n')[0]}`);
      lastError = e;
    }
  }
  throw lastError;
}

async function extractAudio(videoPath: string, audioPath: string) {
  const ffmpeg = await getFfmpegPath();
  await execAsync(`${ffmpeg} -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`);
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

  console.log(`[Dub] Audio is ${fileSizeMB.toFixed(1)}MB — splitting into chunks...`);
  const chunkDir = path.join(path.dirname(audioPath), 'chunks_' + Date.now());
  fs.mkdirSync(chunkDir, { recursive: true });
  const ffmpeg = await getFfmpegPath();
  await execAsync(`${ffmpeg} -i "${audioPath}" -f segment -segment_time 600 -c copy "${path.join(chunkDir, 'chunk_%03d.wav')}" -y`);

  const chunkFiles = fs.readdirSync(chunkDir).filter(f => f.endsWith('.wav')).sort().map(f => path.join(chunkDir, f));
  const allSegments: any[] = [];
  let timeOffset = 0;

  for (const chunk of chunkFiles) {
    const result = await transcribeChunk(chunk, apiKey);
    const segs = (result.segments || []).map((s: any) => ({
      ...s,
      start: s.start + timeOffset,
      end: s.end + timeOffset,
    }));
    allSegments.push(...segs);
    timeOffset += result.duration || 600;
  }

  fs.rmSync(chunkDir, { recursive: true, force: true });
  return { segments: allSegments, duration: timeOffset };
}

async function translateSegments(texts: string[], apiKey: string): Promise<string[]> {
  // Batch all segments into one GPT-4o call — much faster than N individual calls
  const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `You are an expert Kikuyu translator. Translate each numbered line to natural spoken Kikuyu. Return ONLY the translations, keeping the same numbering format.\n\n${numbered}`
      }],
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  const raw = data.choices[0].message.content.trim();
  // Parse "1. translation\n2. translation\n..." back into array
  const lines = raw.split('\n').filter((l: string) => l.trim());
  const results: string[] = new Array(texts.length).fill('');
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s*(.+)$/);
    if (m) {
      const idx = parseInt(m[1]) - 1;
      if (idx >= 0 && idx < texts.length) results[idx] = m[2].trim();
    }
  }
  // Fill any missing with individual fallback
  for (let i = 0; i < results.length; i++) {
    if (!results[i]) results[i] = texts[i]; // keep original if translation missing
  }
  return results;
}

const KIKUYU_DUB_PROMPT = `You are an expert Kikuyu (Gĩkũyũ) linguist and native speaker from Central Kenya.
Translate spoken English into natural, fluent Kikuyu suitable for voice dubbing.

RULES:
- Use proper diacritics always: ĩ (mid-central vowel), ũ (rounded back vowel)
- Keep translations concise — dubbing must fit the original speech timing
- Use natural spoken register, not formal/written Kikuyu
- Keep proper nouns (names, places, brands) unchanged
- Nĩ = emphasis prefix before verbs; gũ- = verb infinitive prefix
- Double vowels = long sounds: ũũ="oo", ĩĩ="ee"; ci/ce → "sh" sound
- Return ONLY the Kikuyu translation, nothing else

EXAMPLES:
"Hello" → "Wee mwega"
"How are you?" → "Wee mwega?"
"I am fine" → "Nĩ mwega"
"Thank you" → "Nĩ ngatho"
"Come here" → "Ũka haha"
"I am going" → "Nĩndĩkienda"
"I don't understand" → "Ndĩngĩũndũ"`;

async function translateSegment(text: string, apiKey: string): Promise<string> {
  // Try Gemma Modal endpoint first — fine-tuned for Kikuyu, faster
  const gemmaUrl = process.env.GEMMA_TRANSLATE_URL;
  if (gemmaUrl) {
    try {
      const res = await fetch(`${gemmaUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_lang: 'en' }),
        signal: AbortSignal.timeout(120000),
      });
      if (res.ok) {
        const data = await res.json();
        const translation = data?.translation?.trim();
        if (translation && translation !== text && translation.length > 2) {
          return translation;
        }
      }
    } catch (e: any) {
      console.warn('[Dub] Gemma translation failed, falling back to GPT-4o:', e.message);
    }
  }

  // Fall back to GPT-4o with full Kikuyu linguistic prompt
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: KIKUYU_DUB_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.2,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function synthesizeSegment(text: string, outputPath: string, mmsUrl?: string, openaiKey?: string) {
  const safeText = text.slice(0, 500).trim();

  if (mmsUrl) {
    // Retry up to 3 times — Modal can be slow on cold start mid-job
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${mmsUrl}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: safeText, speed: 0.85 }),
          signal: AbortSignal.timeout(180000), // 3 min per attempt
        });
        if (res.ok) {
          fs.writeFileSync(outputPath, Buffer.from(await res.arrayBuffer()));
          return;
        }
        console.warn(`[Dub] MMS TTS attempt ${attempt} returned ${res.status}`);
      } catch (e: any) {
        console.warn(`[Dub] MMS TTS attempt ${attempt} failed: ${e.message?.split('\n')[0]}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
      }
    }
    throw new Error('MMS TTS failed after 3 attempts — keeping MMS speaker consistent');
  }

  // MMS not configured — only then fall back to OpenAI TTS
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'tts-1', voice: 'onyx', input: safeText, response_format: 'wav', speed: 0.78 }),
      signal: AbortSignal.timeout(60000),
    });
    if (res.ok) {
      fs.writeFileSync(outputPath, Buffer.from(await res.arrayBuffer()));
      return;
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI TTS failed: ${res.status} — ${err?.error?.message ?? ''}`);
  }

  throw new Error('No TTS engine available');
}

/**
 * Synthesize a group of consecutive segments as ONE TTS call for consistent tone.
 * The combined audio is then split back by word-count ratio into per-segment files.
 */
async function synthesizeGroup(
  segments: Array<{ text: string; index: number }>,
  tempDir: string,
  mmsUrl?: string,
  openaiKey?: string
): Promise<void> {
  const ffmpeg = await getFfmpegPath();

  // Join all texts with a natural pause marker
  const combined = segments.map(s => s.text).join(' ... ');
  const groupPath = path.join(tempDir, `group_${segments[0].index}.wav`);

  await synthesizeSegment(combined, groupPath, mmsUrl, openaiKey);

  if (!fs.existsSync(groupPath)) {
    // Fallback: synthesize each individually
    console.warn('[Dub] Group synthesis produced no file — falling back to individual synthesis');
    for (const seg of segments) {
      await synthesizeSegment(seg.text, path.join(tempDir, `seg_${seg.index}.wav`), mmsUrl, openaiKey);
    }
    return;
  }

  // Get total duration of the combined audio
  let totalAudioDuration = 0;
  try {
    await execAsync(`${ffmpeg} -i "${groupPath}" -f null - 2>&1`);
  } catch (e: any) {
    const m = (e.message || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (m) totalAudioDuration = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
  }

  if (totalAudioDuration < 0.1 || segments.length === 1) {
    // Single segment — just rename
    fs.renameSync(groupPath, path.join(tempDir, `seg_${segments[0].index}.wav`));
    return;
  }

  // Split by word-count proportion — each segment gets a slice of the combined audio
  const totalWords = segments.reduce((sum, s) => sum + s.text.split(' ').length, 0);
  let timeOffset = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segWords = seg.text.split(' ').length;
    const segDuration = (segWords / totalWords) * totalAudioDuration;
    const segPath = path.join(tempDir, `seg_${seg.index}.wav`);

    await execAsync(
      `${ffmpeg} -i "${groupPath}" -ss ${timeOffset.toFixed(3)} -t ${segDuration.toFixed(3)} ` +
      `-acodec pcm_s16le -ar 24000 -ac 1 "${segPath}" -y`
    );

    timeOffset += segDuration;
  }

  try { fs.unlinkSync(groupPath); } catch {}
}

/**
 * Re-encode a WAV segment to exactly 24kHz 16-bit mono PCM using ffmpeg.
 * This normalises whatever format TTS engines return (different sample rates,
 * bit depths, header sizes) into a consistent format for stitching.
 */
async function normalizeSegmentWav(inputPath: string, outputPath: string, targetDuration?: number): Promise<void> {
  const ffmpeg = await getFfmpegPath();
  const sampleRate = 24000;

  if (targetDuration && targetDuration > 0.5) {
    // Get actual audio duration first
    let actualDuration = 0;
    try {
      const { stdout } = await execAsync(
        `${ffmpeg} -i "${inputPath}" -f null - 2>&1 || true`
      );
      const m = (stdout || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
      if (m) actualDuration = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
    } catch (e: any) {
      const m = (e.message || '').match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
      if (m) actualDuration = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
    }

    if (actualDuration > 0.1) {
      // Calculate tempo to stretch/compress audio to fit the segment duration
      // Clamp between 0.5x (half speed) and 1.2x (slightly faster) for naturalness
      const rawTempo = actualDuration / targetDuration;
      const tempo = Math.max(0.5, Math.min(1.2, rawTempo));
      console.log(`[Dub] Segment duration: ${targetDuration.toFixed(2)}s, audio: ${actualDuration.toFixed(2)}s, tempo: ${tempo.toFixed(2)}x`);

      // atempo only accepts 0.5–2.0; chain filters if needed
      let atempoFilter = '';
      if (tempo <= 0.5) {
        atempoFilter = 'atempo=0.5';
      } else if (tempo <= 1.0) {
        atempoFilter = `atempo=${tempo.toFixed(3)}`;
      } else {
        atempoFilter = `atempo=${tempo.toFixed(3)}`;
      }

      await execAsync(
        `${ffmpeg} -i "${inputPath}" -af "${atempoFilter}" -acodec pcm_s16le -ar ${sampleRate} -ac 1 "${outputPath}" -y`
      );
      return;
    }
  }

  // No time-stretching — just re-encode to target format
  await execAsync(
    `${ffmpeg} -i "${inputPath}" -acodec pcm_s16le -ar ${sampleRate} -ac 1 "${outputPath}" -y`
  );
}

async function buildDubbedAudio(segments: any[], tempDir: string, totalDuration: number): Promise<string> {
  const dubbedAudioPath = path.join(tempDir, 'dubbed_audio.wav');
  const sampleRate = 24000;
  const totalSamples = Math.ceil(totalDuration * sampleRate);
  const silenceBuffer = Buffer.alloc(totalSamples * 2, 0); // 16-bit PCM = 2 bytes per sample

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const rawSegPath = path.join(tempDir, `seg_${i}.wav`);
    const normSegPath = path.join(tempDir, `seg_${i}_norm.wav`);
    if (!fs.existsSync(rawSegPath)) continue;

    try {
      // Calculate how long this segment slot is (time until next segment or end)
      const segDuration = seg.end - seg.start;

      // Normalize: re-encode to exact 24kHz 16-bit mono + time-stretch to fit slot
      await normalizeSegmentWav(rawSegPath, normSegPath, segDuration);

      const segBuffer = fs.readFileSync(normSegPath);

      // Parse WAV header properly — find the 'data' chunk offset
      let dataOffset = 44; // default
      let dataSize = segBuffer.length - 44;
      if (segBuffer.slice(0, 4).toString('ascii') === 'RIFF') {
        // Scan for 'data' chunk marker
        for (let pos = 12; pos < Math.min(segBuffer.length - 8, 200); pos++) {
          if (segBuffer.slice(pos, pos + 4).toString('ascii') === 'data') {
            dataSize = segBuffer.readUInt32LE(pos + 4);
            dataOffset = pos + 8;
            break;
          }
        }
      }

      const pcmData = segBuffer.slice(dataOffset, dataOffset + dataSize);
      const startSample = Math.floor(seg.start * sampleRate);
      const startByte = startSample * 2;

      // Apply short fade-in (20ms) and fade-out (20ms) to smooth hard cuts
      const fadeFrames = Math.floor(0.02 * sampleRate); // 20ms
      for (let f = 0; f < fadeFrames && f * 2 + 1 < pcmData.length; f++) {
        const factor = f / fadeFrames;
        const sampleIn = pcmData.readInt16LE(f * 2);
        pcmData.writeInt16LE(Math.round(sampleIn * factor), f * 2);
      }
      for (let f = 0; f < fadeFrames; f++) {
        const pos = pcmData.length - 2 - f * 2;
        if (pos < 0) break;
        const factor = f / fadeFrames;
        const sampleOut = pcmData.readInt16LE(pos);
        pcmData.writeInt16LE(Math.round(sampleOut * factor), pos);
      }

      const copyLen = Math.min(pcmData.length, silenceBuffer.length - startByte);
      if (copyLen > 0 && startByte < silenceBuffer.length) {
        pcmData.copy(silenceBuffer, startByte, 0, copyLen);
      }

      // Clean up normalized file
      try { fs.unlinkSync(normSegPath); } catch {}
    } catch (e: any) {
      console.warn(`[Dub] Skipping segment ${i}:`, e.message);
    }
  }

  const wavHeader = createWavHeader(silenceBuffer.length, sampleRate, 1, 16);
  fs.writeFileSync(dubbedAudioPath, Buffer.concat([wavHeader, silenceBuffer]));
  console.log(`[Dub] Built dubbed audio: ${(silenceBuffer.length / 1024 / 1024).toFixed(1)}MB`);
  return dubbedAudioPath;
}

function createWavHeader(dataLength: number, sampleRate: number, channels: number, bitDepth: number): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);          // PCM chunk size
  header.writeUInt16LE(1, 20);           // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

async function hasVideoStream(filePath: string): Promise<boolean> {
  const ffmpeg = await getFfmpegPath();
  // ffprobe is in the same bin dir as ffmpeg
  const ffprobe = ffmpeg.replace(/ffmpeg(\.exe)?"/i, 'ffprobe$1"');
  try {
    const { stdout } = await execAsync(
      `${ffprobe} -v quiet -print_format json -show_streams "${filePath}"`
    );
    const info = JSON.parse(stdout);
    return (info.streams || []).some((s: any) => s.codec_type === 'video');
  } catch {
    // ffprobe not available — fall back to ffmpeg stderr parsing
    try {
      await execAsync(`${ffmpeg} -i "${filePath}" -t 0 -f null - 2>&1`);
    } catch (e: any) {
      return /Stream #\d+:\d+.*Video:/i.test(e.message || '');
    }
    return false;
  }
}

async function mergeVideoAudio(videoPath: string, audioPath: string, outputPath: string) {
  const ffmpeg = await getFfmpegPath();
  const hasVideo = await hasVideoStream(videoPath);
  console.log(`[Dub] Input has video stream: ${hasVideo} (${path.basename(videoPath)})`);

  if (hasVideo) {
    // Replace original audio with dubbed audio, keep video stream
    await execAsync(`${ffmpeg} -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outputPath}" -y`);
  } else {
    // Audio-only input — just wrap dubbed audio in mp4
    console.warn('[Dub] No video stream — outputting audio-only mp4');
    await execAsync(`${ffmpeg} -i "${audioPath}" -c:a aac "${outputPath}" -y`);
  }
}

export async function POST(request: Request) {
  ensureDirs();
  const timestamp = Date.now();

  try {
    const { youtubeUrl } = await request.json();
    if (!youtubeUrl) return NextResponse.json({ error: 'YouTube URL required' }, { status: 400 });

    const openaiKey = process.env.OPENAI_API_KEY;
    const mmsUrl = process.env.MMS_TTS_URL;
    if (!openaiKey) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });

    const videoPath  = path.join(TEMP_DIR, `video_${timestamp}`); // no extension — yt-dlp picks it
    const audioPath  = path.join(TEMP_DIR, `audio_${timestamp}.wav`);
    const outputPath = path.join(OUTPUT_DIR, `dubbed_${timestamp}.mp4`);
    const segTempDir = path.join(TEMP_DIR, `segs_${timestamp}`);
    fs.mkdirSync(segTempDir, { recursive: true });

    console.log('[Dub] Downloading video...');
    const actualVideoPath = await downloadVideo(youtubeUrl, videoPath);

    console.log('[Dub] Extracting audio...');
    await extractAudio(actualVideoPath, audioPath);

    console.log('[Dub] Transcribing...');
    const transcription = await transcribeWithTimestamps(audioPath, openaiKey);
    const segments = transcription.segments || [];
    const totalDuration = transcription.duration || 60;
    console.log(`[Dub] Got ${segments.length} segments, duration: ${totalDuration}s`);

    const processedSegments: any[] = new Array(segments.length);
    const CONCURRENCY = 5; // synthesize 5 segments at a time

    console.log(`[Dub] Translating ${segments.length} segments individually...`);
    // Translate each segment individually — reliable, no parsing edge cases
    // Run translations in parallel batches too since Gemma handles concurrent requests
    const translations: string[] = new Array(segments.length);
    for (let batch = 0; batch < segments.length; batch += CONCURRENCY) {
      const slice = segments.slice(batch, batch + CONCURRENCY);
      await Promise.all(slice.map(async (seg: any, j: number) => {
        const i = batch + j;
        console.log(`[Dub] Translating ${i + 1}/${segments.length}: "${seg.text.substring(0, 40)}..."`);
        translations[i] = await translateSegment(seg.text, openaiKey);
      }));
    }

    console.log(`[Dub] Synthesizing ${segments.length} segments in groups of 4 for consistent tone...`);
    // Group synthesis: synthesize 4 segments at a time as one TTS call
    // This keeps the voice engine in the same prosodic state across sentences
    const GROUP_SIZE = 4;
    for (let batch = 0; batch < segments.length; batch += GROUP_SIZE) {
      const groupSegs = segments.slice(batch, batch + GROUP_SIZE).map((seg: any, j: number) => ({
        text: translations[batch + j] || seg.text,
        index: batch + j,
      }));
      console.log(`[Dub] TTS group ${Math.floor(batch / GROUP_SIZE) + 1}: segments ${batch + 1}–${batch + groupSegs.length}`);
      try {
        await synthesizeGroup(groupSegs, segTempDir, mmsUrl, openaiKey);
      } catch (e: any) {
        // Group failed — fall back to individual MMS synthesis for this group
        // Still uses MMS to maintain the same speaker/voice throughout
        console.warn(`[Dub] Group ${Math.floor(batch / GROUP_SIZE) + 1} failed (${e.message?.split('\n')[0]}), retrying individually with MMS...`);
        for (const gs of groupSegs) {
          try {
            await synthesizeSegment(gs.text, path.join(segTempDir, `seg_${gs.index}.wav`), mmsUrl, undefined);
          } catch (se: any) {
            console.warn(`[Dub] Segment ${gs.index} MMS TTS failed:`, se.message);
          }
        }
      }
      // Store processed segments
      groupSegs.forEach((gs, j) => {
        processedSegments[gs.index] = { ...segments[batch + j], kikuyu: gs.text };
      });
    }

    console.log('[Dub] Building dubbed audio track...');
    const dubbedAudioPath = await buildDubbedAudio(processedSegments, segTempDir, totalDuration);

    console.log('[Dub] Merging with video...');
    await mergeVideoAudio(actualVideoPath, dubbedAudioPath, outputPath);

    fs.unlinkSync(actualVideoPath);
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
    try { fs.rmSync(path.join(TEMP_DIR, `segs_${timestamp}`), { recursive: true, force: true }); } catch {}
    return NextResponse.json({ error: error.message || 'Dubbing failed' }, { status: 500 });
  }
}
