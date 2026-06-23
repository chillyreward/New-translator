import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "An audio file is required." },
        { status: 400 }
      );
    }

    // Convert the Blob to a File object that OpenAI SDK expects
    const file = new File([audioFile], "recording.webm", {
      type: audioFile.type || "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file,
      response_format: "text",
    });

    // The text response comes back as a plain string when response_format is "text"
    const text = typeof transcription === "string" ? transcription : (transcription as { text: string }).text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No speech detected in the audio. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: unknown) {
    console.error("[/api/speech-to-text] Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
