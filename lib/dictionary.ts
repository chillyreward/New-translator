export const phraseDictionary: Record<string, string> = {
  "please enter your phone number":                  "Tuhu namba yaku ya thimu, ni, tafadhali",
  "how are you":                                     "Uhoro waku",
  "how many varieties of coffee are grown in kenya": "ni midhemba irikuu ya kahuu ikuragio kenya",
  "thank you very much":                             "Ni ngatho muno",
};

/**
 * Maps phrases to pre-recorded audio file paths in /public/audio/.
 * When a match is found, the exact audio is played — no TTS needed.
 */
export const audioLibrary: Record<string, string> = {
  "how many varieties of coffee are grown in kenya": "/audio/coffee-varieties.wav",
  "give me water":        "/audio/chunks/Give me water.wav",
  "come here":            "/audio/chunks/come here.wav",
  "come in":              "/audio/chunks/come in.wav",
  "come into the house":  "/audio/chunks/come into the house.wav",
  "come":                 "/audio/chunks/come.wav",
  "enemy":                "/audio/chunks/enemy.wav",
  "father":               "/audio/chunks/father.wav",
  "food":                 "/audio/chunks/food.wav",
  "friend":               "/audio/chunks/friend.wav",
  "go away":              "/audio/chunks/go away.wav",
  "help me":              "/audio/chunks/help me.wav",
  "home":                 "/audio/chunks/home.wav",
  "how are you":          "/audio/chunks/how are you.wav",
  "hello":               "/audio/chunks/hello.wav",
  "hi":                  "/audio/chunks/hello.wav",
  "i am hungry":          "/audio/chunks/i am hungry.wav",
  "i am thirsty":         "/audio/chunks/i am thirsty.wav",
  "i love you":           "/audio/chunks/i love you.wav",
  "i will call you":      "/audio/chunks/i will call you.wav",
  "i will phone you":     "/audio/chunks/i will phone you.wav",
  "keep quiet":           "/audio/chunks/keep quiet.wav",
  "mother":               "/audio/chunks/mother.wav",
  "stop laughing":        "/audio/chunks/stop laughing.wav",
  "thank you so much":    "/audio/chunks/thank you so much.wav",
  "thank you":            "/audio/chunks/thank you.wav",
  "water":                "/audio/chunks/water.wav",
};

export function patternTranslate(text: string): string {
  return text
    .replace(/\benter\b/gi,  "tũhũ")
    .replace(/\bphone\b/gi,  "thimu")
    .replace(/\bnumber\b/gi, "namba")
    .replace(/\bplease\b/gi, "tafadhali");
}
