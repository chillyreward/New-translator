export function toKikuyuSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/ĩ/g, "i")
    .replace(/ũ/g, "u")
    .replace(/th/g, "dh")
    .replace(/ny/g, "ni")
    .replace(/ng'/g, "ng")
    .replace(/wĩ/g, "wee")
    .replace(/nĩ/g, "nee")
    .replace(/mũno/g, "moono")
    // Single b → f, but mb stays as mb (nasal b is a real b)
    .replace(/(?<!m)b/g, "f");
}

// Kikuyu valid alphabet: a b c d e g h i ĩ j k m n o r t u ũ w y
// Does NOT use: l f p q s v x z
const KIKUYU_ALPHABET = new Set([
  'a','b','c','d','e','g','h','i','ĩ',
  'j','k','m','n','o','r','t','u','ũ',
  'w','y',' ','-',"'",',',".",'?','!'
]);

/**
 * Removes characters not in the Kikuyu alphabet.
 * Keeps spaces, hyphens, apostrophes and punctuation.
 */
export function sanitizeKikuyu(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .filter(c => KIKUYU_ALPHABET.has(c))
    .join('');
}

/**
 * Returns true if the text only uses valid Kikuyu characters.
 */
export function isValidKikuyu(text: string): boolean {
  return text.toLowerCase().split('').every(c => KIKUYU_ALPHABET.has(c));
}
