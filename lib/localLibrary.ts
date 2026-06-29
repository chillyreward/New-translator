/**
 * Local phrase library
 *
 * Strategy: match English input directly to WAV filename.
 * The WAV IS the translation — it contains the recorded Kikuyu audio.
 * The kikuyu field is used only for display in the UI.
 *
 * WAV files live in /public/audio/chunks/
 */

export interface LocalPhrase {
  kikuyu: string;   // display text (from WAV content — update if wrong)
  wav: string;      // path to WAV file
}

const W = (file: string) => `/audio/chunks/${file}`;

/**
 * Auto-match: try the English input directly as a WAV filename.
 * e.g. "how are you" → /audio/chunks/how are you.wav
 * Falls back to the manual map for exceptions (case differences, aliases).
 */
const MANUAL_MAP: Record<string, string> = {
  // Aliases — English key differs from WAV filename
  "hi":                             "hello.wav",
  "give me water":                  "Give me water.wav",
  "i will slap you":                "I will slap you.wav",
  "mouse":                          "mouse or mice.wav",
  "mice":                           "mouse or mice.wav",
  "fever":                          "fever or temparature.wav",
  "fever or temperature":           "fever or temparature.wav",
  "shivering":                      "shivering or shaking.wav",
  "i am taking medicine":           "i an taking medicine.wav",
  "types of clothes":               "typesof clothes.wav",
  "type of clothes":                "typesof clothes.wav",
};

/**
 * All known WAV filenames (without extension), lowercased for matching.
 * Generated from /public/audio/chunks/ directory listing.
 */
const WAV_FILES = new Set([
  "a good doctor", "agikuyu", "ankle", "ankles", "beards", "blood",
  "blouse", "cheeks", "chest", "come here", "come in",
  "come into the house", "come", "constipation", "coughing", "doctor",
  "ear", "ears", "elbow", "enemy", "eye", "eyes", "face", "father",
  "finger", "fingers", "food", "forehead", "friend",
  "go away", "goat", "gumboot", "hair", "hand", "head", "heel", "hello",
  "help me", "home", "horse", "hospital",
  "how are you",
  "i am going to the hospital", "i am having a stomach ache",
  "i am hungry", "i am pregnant", "i am sick", "i am thirsty",
  "i an taking medicine", "i have a headache",
  "i have gone to the washroom", "i have recovered",
  "i love you", "i will call you", "i will phone you",
  "keep quiet", "kikuyu", "knee", "leg", "legs", "maize",
  "medicine", "mother", "mouth", "muscle pull", "my face",
  "my mouth", "neck", "needle", "nose", "pain", "palm", "patient",
  "physician", "pregnancy", "quiet", "reading", "shirt",
  "shoe", "shoes", "shorts", "shoulder", "shoulders",
  "shut up", "small waist", "smelling", "socks", "speaking",
  "stomach", "stomachache", "stop laughing", "sweater",
  "thank you so much", "thank you",
  "that girl has nice cheeks", "thigh", "thighs", "tie", "tiredness",
  "trouser", "urine", "vest", "waist", "ward", "water", "writing",
  "fever or temparature", "shivering or shaking",
  "give me water", "i will slap you", "mouse or mice",
  "typesof clothes", "id",
]);

export function lookupLocal(input: string): LocalPhrase | null {
  const key = input.trim().toLowerCase();

  // 1. Check manual map (aliases / case exceptions)
  if (MANUAL_MAP[key]) {
    return { kikuyu: input, wav: W(MANUAL_MAP[key]) };
  }

  // 2. Direct match — English phrase == WAV filename (case-insensitive)
  if (WAV_FILES.has(key)) {
    // Find the actual filename with original casing
    const actualFile = [...WAV_FILES].find(f => f.toLowerCase() === key);
    if (actualFile) {
      // Reconstruct original-cased filename
      // Most files are lowercase; exceptions handled in MANUAL_MAP
      return { kikuyu: input, wav: W(`${actualFile}.wav`) };
    }
  }

  return null;
}

export function getWavForPhrase(englishInput: string): string | null {
  return lookupLocal(englishInput)?.wav ?? null;
}
