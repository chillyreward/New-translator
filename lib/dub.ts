import { translate } from "./translate";
import { toKikuyuSpeech } from "./phonetic";
import { generateSpeech } from "./process";

/**
 * Full dubbing pipeline:
 * 1. Translate English/Swahili → Kikuyu
 * 2. Convert to Kikuyu phonetics
 * 3. Generate speech via Coqui XTTS v2
 */
export async function dub(text: string): Promise<Buffer> {
  const kikuyu   = await translate(text);
  const phonetic = toKikuyuSpeech(kikuyu);
  const audio    = await generateSpeech(phonetic);
  return audio;
}
