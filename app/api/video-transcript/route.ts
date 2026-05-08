import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Save video to temp folder
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const timestamp = Date.now();
    const ext = videoFile.name.split('.').pop() || 'mp4';
    const videoPath = path.join(tempDir, `video_${timestamp}.${ext}`);

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    fs.writeFileSync(videoPath, buffer);

    // Send directly to Whisper — it handles video files (mp4, mov, avi, mkv, webm)
    const whisperForm = new FormData();
    const videoBlob = new Blob([buffer], { type: videoFile.type || 'video/mp4' });
    whisperForm.append('file', videoBlob, videoFile.name);
    whisperForm.append('model', 'whisper-1');

    const transcriptionRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}` },
      body: whisperForm,
    });

    // Clean up temp file
    fs.unlinkSync(videoPath);

    if (!transcriptionRes.ok) {
      const err = await transcriptionRes.json();
      throw new Error(err.error?.message || 'Transcription failed');
    }

    const data = await transcriptionRes.json();
    return NextResponse.json({ transcript: data.text });

  } catch (error: any) {
    console.error('[video-transcript]', error.message);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
