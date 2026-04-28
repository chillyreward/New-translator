import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// A warm, natural-sounding voice. Options: alloy, echo, fable, onyx, nova, shimmer
const DEFAULT_VOICE = "nova" as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and cannot be empty." },
        { status: 400 }
      );
    }

    const selectedVoice = voice || DEFAULT_VOICE;

    const mp3Response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: selectedVoice,
      input: text.trim(),
      response_format: "mp3",
    });

    // Stream the audio binary back to the client
    const audioBuffer = await mp3Response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("[/api/text-to-speech] Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
