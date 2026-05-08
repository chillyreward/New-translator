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
  // greetings
  "hello":               "/audio/chunks/hello.wav",
  "hi":                  "/audio/chunks/hello.wav",
  "how are you":         "/audio/chunks/how are you.wav",
  // instructions
  "come here":           "/audio/chunks/come here.wav",
  "come in":             "/audio/chunks/come in.wav",
  "come into the house": "/audio/chunks/come into the house.wav",
  "come":                "/audio/chunks/come.wav",
  "go away":             "/audio/chunks/go away.wav",
  "help me":             "/audio/chunks/help me.wav",
  "keep quiet":          "/audio/chunks/keep quiet.wav",
  "quiet":               "/audio/chunks/quiet.wav",
  "shut up":             "/audio/chunks/shut up.wav",
  "stop laughing":       "/audio/chunks/stop laughing.wav",
  // food & drink
  "give me water":       "/audio/chunks/Give me water.wav",
  "water":               "/audio/chunks/water.wav",
  "food":                "/audio/chunks/food.wav",
  "i am hungry":         "/audio/chunks/i am hungry.wav",
  "i am thirsty":        "/audio/chunks/i am thirsty.wav",
  // family & people
  "father":              "/audio/chunks/father.wav",
  "mother":              "/audio/chunks/mother.wav",
  "friend":              "/audio/chunks/friend.wav",
  "enemy":               "/audio/chunks/enemy.wav",
  "home":                "/audio/chunks/home.wav",
  // emotions
  "i love you":          "/audio/chunks/i love you.wav",
  // communication
  "i will call you":     "/audio/chunks/i will call you.wav",
  "i will phone you":    "/audio/chunks/i will phone you.wav",
  "thank you":           "/audio/chunks/thank you.wav",
  "thank you so much":   "/audio/chunks/thank you so much.wav",
  // body parts
  "hand":                "/audio/chunks/hand.wav",
  "face":                "/audio/chunks/face.wav",
  "my face":             "/audio/chunks/my face.wav",
  "head":                "/audio/chunks/head.wav",
  "eye":                 "/audio/chunks/eye.wav",
  "eyes":                "/audio/chunks/eyes.wav",
  "ear":                 "/audio/chunks/ear.wav",
  "ears":                "/audio/chunks/ears.wav",
  "nose":                "/audio/chunks/nose.wav",
  "mouth":               "/audio/chunks/mouth.wav",
  "my mouth":            "/audio/chunks/my mouth.wav",
  "neck":                "/audio/chunks/neck.wav",
  "shoulder":            "/audio/chunks/shoulder.wav",
  "shoulders":           "/audio/chunks/shoulders.wav",
  "chest":               "/audio/chunks/chest.wav",
  "stomach":             "/audio/chunks/stomach.wav",
  "waist":               "/audio/chunks/waist.wav",
  "small waist":         "/audio/chunks/small waist.wav",
  "palm":                "/audio/chunks/palm.wav",
  "elbow":               "/audio/chunks/elbow.wav",
  "finger":              "/audio/chunks/finger.wav",
  "fingers":             "/audio/chunks/fingers.wav",
  "leg":                 "/audio/chunks/leg.wav",
  "legs":                "/audio/chunks/legs.wav",
  "thigh":               "/audio/chunks/thigh.wav",
  "thighs":              "/audio/chunks/thighs.wav",
  "knee":                "/audio/chunks/knee.wav",
  "ankle":               "/audio/chunks/ankle.wav",
  "ankles":              "/audio/chunks/ankles.wav",
  "heel":                "/audio/chunks/heel.wav",
  "cheeks":              "/audio/chunks/cheeks.wav",
  "forehead":            "/audio/chunks/forehead.wav",
  "hair":                "/audio/chunks/hair.wav",
  "beards":              "/audio/chunks/beards.wav",
  "that girl has nice cheeks": "/audio/chunks/that girl has nice cheeks.wav",
  // nature & animals
  "goat":                "/audio/chunks/goat.wav",
  "horse":               "/audio/chunks/horse.wav",
  "maize":               "/audio/chunks/maize.wav",
  "mouse":               "/audio/chunks/mouse or mice.wav",
  "mice":                "/audio/chunks/mouse or mice.wav",
  // culture & language
  "kikuyu":              "/audio/chunks/kikuyu.wav",
  "agikuyu":             "/audio/chunks/agikuyu.wav",
  // actions
  "reading":             "/audio/chunks/reading.wav",
  "writing":             "/audio/chunks/writing.wav",
  "speaking":            "/audio/chunks/speaking.wav",
  "i will slap you":     "/audio/chunks/I will slap you.wav",
};

export function patternTranslate(text: string): string {
  return text
    .replace(/\benter\b/gi,  "tũhũ")
    .replace(/\bphone\b/gi,  "thimu")
    .replace(/\bnumber\b/gi, "namba")
    .replace(/\bplease\b/gi, "tafadhali");
}
