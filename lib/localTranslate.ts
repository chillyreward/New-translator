import { dictionary } from './kikuyuDictionary';
import { phrases, phoneticConvert } from './kikuyuPhrases';

const fillers = [
  { word: "ni",     use: "emphasis"    },
  { word: "ati",    use: "explanation" },
  { word: "riria",  use: "pause"       },
  { word: "niwega", use: "soft_ending" },
] as const;

type FillerUse = typeof fillers[number]["use"];

// Single source of truth — built from the phrases array
const phraseMap: Record<string, string> = phrases.reduce((acc, p) => {
  acc[p.english.toLowerCase()] = p.kikuyu;
  return acc;
}, {} as Record<string, string>);

/**
 * Smart local translator
 * Priority:
 * 1. Phrase map exact match
 * 2. Partial phrase match — only whole-phrase containment, longest wins
 * 3. Word-by-word dictionary fallback
 */
export function localTranslate(text: string): string {
  const lower = text.toLowerCase().trim();

  // 1. Exact match
  if (phraseMap[lower]) return phoneticConvert(phraseMap[lower]);

  // 2. Partial match — the stored key must be a complete phrase contained in
  //    the input, not just any substring (avoids "go" matching "good morning")
  let bestMatch: string | null = null;
  let bestLength = 0;

  for (const [key, value] of Object.entries(phraseMap)) {
    // Only match if the key is at a word boundary within the input
    const pattern = new RegExp(`(?:^|\\s)${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`);
    if (pattern.test(lower) && key.length > bestLength) {
      bestMatch = value;
      bestLength = key.length;
    }
  }

  if (bestMatch) return phoneticConvert(bestMatch);

  // 3. Word-by-word dictionary fallback — only replace whole words
  const words = lower.split(/\s+/);
  const translated = words.map(word => dictionary[word] ?? word);
  return phoneticConvert(translated.join(' '));
}

export function hasLocalTranslation(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return !!phraseMap[lower];
}

/**
 * Injects Kikuyu fillers into a translated sentence.
 * - emphasis:    prepends "ni" before the sentence
 * - explanation: inserts "ati" after the first word
 * - pause:       inserts "riria" at the midpoint
 * - soft_ending: appends "niwega" at the end
 */
export function addFillers(text: string): string {
  let words = text.trim().split(" ");

  for (const filler of fillers) {
    switch (filler.use as FillerUse) {
      case "emphasis":
        words = [filler.word, ...words];
        break;
      case "explanation":
        words.splice(1, 0, filler.word);
        break;
      case "pause": {
        const mid = Math.floor(words.length / 2);
        words.splice(mid, 0, filler.word);
        break;
      }
      case "soft_ending":
        words = [...words, filler.word];
        break;
    }
  }

  return words.join(" ").replace(/\s+/g, " ").trim();
}
