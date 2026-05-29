import { NextRequest } from "next/server";
import { generateSpeech } from "@/lib/process";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const audio = await generateSpeech(text);
  return new Response(audio.buffer as ArrayBuffer, {
    headers: { "Content-Type": "audio/wav" },
  });
}
