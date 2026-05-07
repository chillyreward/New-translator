import { NextRequest } from "next/server";
import { generateSpeech } from "@/lib/process";

function format(text: string): string {
  return `Neewega...${text}...ni...tafadhali`;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const audio = await generateSpeech(format(text));
  return new Response(audio.buffer as ArrayBuffer, {
    headers: { "Content-Type": "audio/wav" },
  });
}
