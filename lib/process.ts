import { ttsChunk } from "./coqui";
import { toKikuyuSpeech, sanitizeKikuyu } from "./phonetic";

export async function generateSpeech(text: string): Promise<Buffer> {
  const phonetic = sanitizeKikuyu(toKikuyuSpeech(text));
  const audioBuffer = await ttsChunk(phonetic);
  return Buffer.from(audioBuffer);
}
