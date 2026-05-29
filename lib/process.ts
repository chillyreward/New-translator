import { ttsChunk } from "./coqui";
import { toKikuyuSpeech, sanitizeKikuyu } from "./phonetic";
import { synthesizeWithHuggingFace } from "./huggingfaceTTS";

export async function generateSpeech(text: string): Promise<Buffer> {
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  // Use Meta MMS-TTS first — trained natively on Kikuyu
  if (hfKey) {
    try {
      const audioBuffer = await synthesizeWithHuggingFace(text, hfKey);
      return Buffer.from(audioBuffer);
    } catch (err: any) {
      console.warn('[generateSpeech] MMS TTS failed, falling back to Coqui:', err.message);
    }
  }

  // Fallback: Coqui with phonetic conversion
  const phonetic = sanitizeKikuyu(toKikuyuSpeech(text));
  const audioBuffer = await ttsChunk(phonetic);
  return Buffer.from(audioBuffer);
}
