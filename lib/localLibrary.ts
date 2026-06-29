/**
 * Local phrase library — maps English input to:
 *   - Kikuyu translation (shown in UI)
 *   - WAV file path in /public/audio/chunks/ (played on Speak click)
 *
 * Lookup is case-insensitive and trims whitespace.
 * WAV filename matches the phrase name exactly as stored in /public/audio/chunks/.
 */

export interface LocalPhrase {
  kikuyu: string;       // Kikuyu translation to display
  wav: string;          // URL path to WAV file, e.g. /audio/chunks/hello.wav
}

// Map: English phrase (lowercase) → LocalPhrase
const LIBRARY: Record<string, LocalPhrase> = {
  // Greetings
  "hello":                    { kikuyu: "Uhana atia",                       wav: "/audio/chunks/hello.wav" },
  "hi":                       { kikuyu: "Uhana atia",                       wav: "/audio/chunks/hello.wav" },
  "how are you":              { kikuyu: "Wĩ mwega?",                        wav: "/audio/chunks/how are you.wav" },
  "thank you":                { kikuyu: "Nĩ ngatho",                        wav: "/audio/chunks/thank you.wav" },
  "thank you so much":        { kikuyu: "Nĩ ngatho mũno",                   wav: "/audio/chunks/thank you so much.wav" },
  "i love you":               { kikuyu: "Nĩngwendete",                      wav: "/audio/chunks/i love you.wav" },

  // Instructions
  "come here":                { kikuyu: "Ũka haha",                         wav: "/audio/chunks/come here.wav" },
  "come in":                  { kikuyu: "Ingia",                            wav: "/audio/chunks/come in.wav" },
  "come into the house":      { kikuyu: "Ingia nyũmba",                     wav: "/audio/chunks/come into the house.wav" },
  "come":                     { kikuyu: "Ũka",                              wav: "/audio/chunks/come.wav" },
  "go away":                  { kikuyu: "Thiĩ",                             wav: "/audio/chunks/go away.wav" },
  "help me":                  { kikuyu: "Nĩndĩrĩa",                        wav: "/audio/chunks/help me.wav" },
  "keep quiet":               { kikuyu: "Kaa kimya",                        wav: "/audio/chunks/keep quiet.wav" },
  "quiet":                    { kikuyu: "Kimya",                            wav: "/audio/chunks/quiet.wav" },
  "shut up":                  { kikuyu: "Kimya",                            wav: "/audio/chunks/shut up.wav" },
  "stop laughing":            { kikuyu: "Acha kucheka",                     wav: "/audio/chunks/stop laughing.wav" },
  "i will slap you":          { kikuyu: "Nĩgũkũhinga",                     wav: "/audio/chunks/I will slap you.wav" },

  // Body parts
  "hand":                     { kikuyu: "Guoko",                            wav: "/audio/chunks/hand.wav" },
  "face":                     { kikuyu: "Ũthuri",                           wav: "/audio/chunks/face.wav" },
  "my face":                  { kikuyu: "Ũthuri wakwa",                     wav: "/audio/chunks/my face.wav" },
  "head":                     { kikuyu: "Mũtwe",                            wav: "/audio/chunks/head.wav" },
  "eye":                      { kikuyu: "Jĩcho",                            wav: "/audio/chunks/eye.wav" },
  "eyes":                     { kikuyu: "Mĩcho",                            wav: "/audio/chunks/eyes.wav" },
  "ear":                      { kikuyu: "Kĩhũ",                             wav: "/audio/chunks/ear.wav" },
  "ears":                     { kikuyu: "Ihũ",                              wav: "/audio/chunks/ears.wav" },
  "nose":                     { kikuyu: "Ĩno",                              wav: "/audio/chunks/nose.wav" },
  "mouth":                    { kikuyu: "Kanua",                            wav: "/audio/chunks/mouth.wav" },
  "my mouth":                 { kikuyu: "Kanua gakwa",                      wav: "/audio/chunks/my mouth.wav" },
  "neck":                     { kikuyu: "Mũgĩrĩro",                         wav: "/audio/chunks/neck.wav" },
  "shoulder":                 { kikuyu: "Bega",                             wav: "/audio/chunks/shoulder.wav" },
  "shoulders":                { kikuyu: "Mabega",                           wav: "/audio/chunks/shoulders.wav" },
  "chest":                    { kikuyu: "Gĩtĩ",                             wav: "/audio/chunks/chest.wav" },
  "stomach":                  { kikuyu: "Nda",                              wav: "/audio/chunks/stomach.wav" },
  "waist":                    { kikuyu: "Kiuno",                            wav: "/audio/chunks/waist.wav" },
  "small waist":              { kikuyu: "Kiuno kĩnini",                     wav: "/audio/chunks/small waist.wav" },
  "palm":                     { kikuyu: "Kiganja",                          wav: "/audio/chunks/palm.wav" },
  "elbow":                    { kikuyu: "Kĩkondo",                          wav: "/audio/chunks/elbow.wav" },
  "finger":                   { kikuyu: "Mwĩtĩ",                           wav: "/audio/chunks/finger.wav" },
  "fingers":                  { kikuyu: "Mĩtĩ",                            wav: "/audio/chunks/fingers.wav" },
  "leg":                      { kikuyu: "Kũgũrũ",                           wav: "/audio/chunks/leg.wav" },
  "legs":                     { kikuyu: "Magũrũ",                           wav: "/audio/chunks/legs.wav" },
  "thigh":                    { kikuyu: "Itherũ",                           wav: "/audio/chunks/thigh.wav" },
  "thighs":                   { kikuyu: "Matherũ",                          wav: "/audio/chunks/thighs.wav" },
  "knee":                     { kikuyu: "Gũtũ",                             wav: "/audio/chunks/knee.wav" },
  "ankle":                    { kikuyu: "Gĩkonyo",                          wav: "/audio/chunks/ankle.wav" },
  "ankles":                   { kikuyu: "Ikonyo",                           wav: "/audio/chunks/ankles.wav" },
  "heel":                     { kikuyu: "Kĩrĩrĩ",                           wav: "/audio/chunks/heel.wav" },
  "cheeks":                   { kikuyu: "Matama",                           wav: "/audio/chunks/cheeks.wav" },
  "forehead":                 { kikuyu: "Ĩthigi",                           wav: "/audio/chunks/forehead.wav" },
  "hair":                     { kikuyu: "Nywele",                           wav: "/audio/chunks/hair.wav" },
  "beards":                   { kikuyu: "Nderu",                            wav: "/audio/chunks/beards.wav" },

  // Food & drink
  "give me water":            { kikuyu: "Nĩpe maaĩ",                        wav: "/audio/chunks/Give me water.wav" },
  "water":                    { kikuyu: "Maaĩ",                             wav: "/audio/chunks/water.wav" },
  "food":                     { kikuyu: "Irio",                             wav: "/audio/chunks/food.wav" },
  "i am hungry":              { kikuyu: "Nĩnjĩĩ ngorĩ",                     wav: "/audio/chunks/i am hungry.wav" },
  "i am thirsty":             { kikuyu: "Nĩnjĩĩ nyĩũ",                      wav: "/audio/chunks/i am thirsty.wav" },

  // Family
  "father":                   { kikuyu: "Baba",                             wav: "/audio/chunks/father.wav" },
  "mother":                   { kikuyu: "Maitu",                            wav: "/audio/chunks/mother.wav" },
  "friend":                   { kikuyu: "Mũrata",                           wav: "/audio/chunks/friend.wav" },
  "enemy":                    { kikuyu: "Mũthamaki",                        wav: "/audio/chunks/enemy.wav" },
  "home":                     { kikuyu: "Nyũmba",                           wav: "/audio/chunks/home.wav" },

  // Communication
  "i will call you":          { kikuyu: "Nĩgũkũheana mũcemanio",            wav: "/audio/chunks/i will call you.wav" },
  "i will phone you":         { kikuyu: "Nĩgũkũhĩa simu",                   wav: "/audio/chunks/i will phone you.wav" },

  // Animals & nature
  "goat":                     { kikuyu: "Mbũri",                            wav: "/audio/chunks/goat.wav" },
  "horse":                    { kikuyu: "Farasi",                           wav: "/audio/chunks/horse.wav" },
  "maize":                    { kikuyu: "Mũgũnda",                          wav: "/audio/chunks/maize.wav" },
  "mouse":                    { kikuyu: "Mbũri ya gũthiĩ",                  wav: "/audio/chunks/mouse or mice.wav" },
  "mice":                     { kikuyu: "Mbũri cia gũthiĩ",                 wav: "/audio/chunks/mouse or mice.wav" },

  // Culture
  "kikuyu":                   { kikuyu: "Gĩkũyũ",                           wav: "/audio/chunks/kikuyu.wav" },
  "agikuyu":                  { kikuyu: "Agĩkũyũ",                          wav: "/audio/chunks/agikuyu.wav" },

  // Actions
  "reading":                  { kikuyu: "Gũthoma",                          wav: "/audio/chunks/reading.wav" },
  "writing":                  { kikuyu: "Gũandĩka",                         wav: "/audio/chunks/writing.wav" },
  "speaking":                 { kikuyu: "Gũcooka",                          wav: "/audio/chunks/speaking.wav" },
  "that girl has nice cheeks":{ kikuyu: "Mũirĩtu ũcio arĩ na matama maarĩ", wav: "/audio/chunks/that girl has nice cheeks.wav" },
};

/**
 * Look up a phrase in the local library.
 * Returns null if not found.
 */
export function lookupLocal(input: string): LocalPhrase | null {
  const key = input.trim().toLowerCase();
  return LIBRARY[key] ?? null;
}

/**
 * Check if a WAV exists for a given Kikuyu translation by matching
 * the WAV filename (without extension) to the translation key.
 */
export function getWavForPhrase(englishInput: string): string | null {
  const match = lookupLocal(englishInput);
  return match?.wav ?? null;
}
