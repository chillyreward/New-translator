/**
 * Local phrase library
 *
 * English input → { Kikuyu translation (display), WAV path (audio) }
 *
 * WAV filename = English phrase name (from /public/audio/chunks/)
 * Translation = what the WAV actually says in Kikuyu
 *
 * When a match is found:
 *   - Translation is shown in UI immediately (no API call)
 *   - WAV is played when user clicks Play
 */

export interface LocalPhrase {
  kikuyu: string;
  wav: string;
}

const W = (file: string) => `/audio/chunks/${file}`;

const LIBRARY: Record<string, LocalPhrase> = {
  // ── Greetings ──────────────────────────────────────────────────────────────
  "hello":                          { kikuyu: "Uhana atia",                         wav: W("hello.wav") },
  "hi":                             { kikuyu: "Uhana atia",                         wav: W("hello.wav") },
  "how are you":                    { kikuyu: "Uhana atia",                         wav: W("how are you.wav") },
  "thank you":                      { kikuyu: "Nĩ ngatho",                          wav: W("thank you.wav") },
  "thank you so much":              { kikuyu: "Nĩ ngatho mũno",                     wav: W("thank you so much.wav") },
  "i love you":                     { kikuyu: "Nĩngwendete",                        wav: W("i love you.wav") },

  // ── Instructions ───────────────────────────────────────────────────────────
  "come here":                      { kikuyu: "Ũka haha",                           wav: W("come here.wav") },
  "come in":                        { kikuyu: "Ingia",                              wav: W("come in.wav") },
  "come into the house":            { kikuyu: "Ingia nyũmba",                       wav: W("come into the house.wav") },
  "come":                           { kikuyu: "Ũka",                                wav: W("come.wav") },
  "go away":                        { kikuyu: "Thiĩ",                               wav: W("go away.wav") },
  "help me":                        { kikuyu: "Nĩndĩrĩa",                          wav: W("help me.wav") },
  "keep quiet":                     { kikuyu: "Kaa kimya",                          wav: W("keep quiet.wav") },
  "quiet":                          { kikuyu: "Kimya",                              wav: W("quiet.wav") },
  "shut up":                        { kikuyu: "Kimya",                              wav: W("shut up.wav") },
  "stop laughing":                  { kikuyu: "Acha kucheka",                       wav: W("stop laughing.wav") },
  "i will slap you":                { kikuyu: "Nĩgũkũhinga",                       wav: W("I will slap you.wav") },

  // ── Body parts ─────────────────────────────────────────────────────────────
  "hand":                           { kikuyu: "Guoko",                              wav: W("hand.wav") },
  "face":                           { kikuyu: "Ũthuri",                             wav: W("face.wav") },
  "my face":                        { kikuyu: "Ũthuri wakwa",                       wav: W("my face.wav") },
  "head":                           { kikuyu: "Mũtwe",                              wav: W("head.wav") },
  "eye":                            { kikuyu: "Jĩcho",                              wav: W("eye.wav") },
  "eyes":                           { kikuyu: "Mĩcho",                              wav: W("eyes.wav") },
  "ear":                            { kikuyu: "Kĩhũ",                               wav: W("ear.wav") },
  "ears":                           { kikuyu: "Ihũ",                                wav: W("ears.wav") },
  "nose":                           { kikuyu: "Ĩno",                                wav: W("nose.wav") },
  "mouth":                          { kikuyu: "Kanua",                              wav: W("mouth.wav") },
  "my mouth":                       { kikuyu: "Kanua gakwa",                        wav: W("my mouth.wav") },
  "neck":                           { kikuyu: "Mũgĩrĩro",                           wav: W("neck.wav") },
  "shoulder":                       { kikuyu: "Bega",                               wav: W("shoulder.wav") },
  "shoulders":                      { kikuyu: "Mabega",                             wav: W("shoulders.wav") },
  "chest":                          { kikuyu: "Gĩtĩ",                               wav: W("chest.wav") },
  "stomach":                        { kikuyu: "Nda",                                wav: W("stomach.wav") },
  "waist":                          { kikuyu: "Kiuno",                              wav: W("waist.wav") },
  "small waist":                    { kikuyu: "Kiuno kĩnini",                       wav: W("small waist.wav") },
  "palm":                           { kikuyu: "Kiganja",                            wav: W("palm.wav") },
  "elbow":                          { kikuyu: "Kĩkondo",                            wav: W("elbow.wav") },
  "finger":                         { kikuyu: "Mwĩtĩ",                             wav: W("finger.wav") },
  "fingers":                        { kikuyu: "Mĩtĩ",                              wav: W("fingers.wav") },
  "leg":                            { kikuyu: "Kũgũrũ",                             wav: W("leg.wav") },
  "legs":                           { kikuyu: "Magũrũ",                             wav: W("legs.wav") },
  "thigh":                          { kikuyu: "Itherũ",                             wav: W("thigh.wav") },
  "thighs":                         { kikuyu: "Matherũ",                            wav: W("thighs.wav") },
  "knee":                           { kikuyu: "Gũtũ",                               wav: W("knee.wav") },
  "ankle":                          { kikuyu: "Gĩkonyo",                            wav: W("ankle.wav") },
  "ankles":                         { kikuyu: "Ikonyo",                             wav: W("ankles.wav") },
  "heel":                           { kikuyu: "Kĩrĩrĩ",                             wav: W("heel.wav") },
  "cheeks":                         { kikuyu: "Matama",                             wav: W("cheeks.wav") },
  "forehead":                       { kikuyu: "Ĩthigi",                             wav: W("forehead.wav") },
  "hair":                           { kikuyu: "Nywele",                             wav: W("hair.wav") },
  "beards":                         { kikuyu: "Nderu",                              wav: W("beards.wav") },
  "that girl has nice cheeks":      { kikuyu: "Mũirĩtu ũcio arĩ na matama maarĩ",  wav: W("that girl has nice cheeks.wav") },

  // ── Food & drink ───────────────────────────────────────────────────────────
  "give me water":                  { kikuyu: "Nĩpe maaĩ",                          wav: W("Give me water.wav") },
  "water":                          { kikuyu: "Maaĩ",                               wav: W("water.wav") },
  "food":                           { kikuyu: "Irio",                               wav: W("food.wav") },
  "i am hungry":                    { kikuyu: "Nĩnjĩĩ ngorĩ",                       wav: W("i am hungry.wav") },
  "i am thirsty":                   { kikuyu: "Nĩnjĩĩ nyĩũ",                        wav: W("i am thirsty.wav") },

  // ── Health ─────────────────────────────────────────────────────────────────
  "i am sick":                      { kikuyu: "Nĩnjĩĩ mũrũaru",                     wav: W("i am sick.wav") },
  "i have a headache":              { kikuyu: "Nĩnjĩĩ rũrũ mũtweni",               wav: W("i have a headache.wav") },
  "i am having a stomach ache":     { kikuyu: "Nĩnjĩĩ rũrũ ndani",                  wav: W("i am having a stomach ache.wav") },
  "stomachache":                    { kikuyu: "Rũrũ rwa nda",                       wav: W("stomachache.wav") },
  "i am going to the hospital":     { kikuyu: "Nĩndĩenda hospitali",                wav: W("i am going to the hospital.wav") },
  "i have recovered":               { kikuyu: "Nĩngũnyĩteirwo",                     wav: W("i have recovered.wav") },
  "i am pregnant":                  { kikuyu: "Nĩnjĩĩ na mimba",                    wav: W("i am pregnant.wav") },
  "i am taking medicine":           { kikuyu: "Nĩnjĩĩ kũnyua dawa",                 wav: W("i an taking medicine.wav") },
  "i have gone to the washroom":    { kikuyu: "Nĩngĩthiĩ choo",                     wav: W("i have gone to the washroom.wav") },
  "hospital":                       { kikuyu: "Hospitali",                          wav: W("hospital.wav") },
  "doctor":                         { kikuyu: "Muganga",                            wav: W("doctor.wav") },
  "a good doctor":                  { kikuyu: "Muganga mwega",                      wav: W("a good doctor.wav") },
  "medicine":                       { kikuyu: "Dawa",                               wav: W("medicine.wav") },
  "pain":                           { kikuyu: "Rũrũ",                               wav: W("pain.wav") },
  "fever":                          { kikuyu: "Homa",                               wav: W("fever or temparature.wav") },
  "fever or temperature":           { kikuyu: "Homa",                               wav: W("fever or temparature.wav") },
  "coughing":                       { kikuyu: "Kĩhũko",                             wav: W("coughing.wav") },
  "shivering":                      { kikuyu: "Gũtigĩra",                           wav: W("shivering or shaking.wav") },
  "shivering or shaking":           { kikuyu: "Gũtigĩra",                           wav: W("shivering or shaking.wav") },
  "muscle pull":                    { kikuyu: "Mũchere wa nyama",                   wav: W("muscle pull.wav") },
  "constipation":                   { kikuyu: "Gũkora",                             wav: W("constipation.wav") },
  "pregnancy":                      { kikuyu: "Mimba",                              wav: W("pregnancy.wav") },
  "blood":                          { kikuyu: "Thakame",                            wav: W("blood.wav") },
  "urine":                          { kikuyu: "Mũcooro",                            wav: W("urine.wav") },
  "smelling":                       { kikuyu: "Kunukia",                            wav: W("smelling.wav") },
  "tiredness":                      { kikuyu: "Mũnyu",                              wav: W("tiredness.wav") },
  "patient":                        { kikuyu: "Mũgwati",                            wav: W("patient.wav") },
  "physician":                      { kikuyu: "Muganga",                            wav: W("physician.wav") },
  "needle":                         { kikuyu: "Sindano",                            wav: W("needle.wav") },
  "ward":                           { kikuyu: "Wodi",                               wav: W("ward.wav") },

  // ── Family ─────────────────────────────────────────────────────────────────
  "father":                         { kikuyu: "Baba",                               wav: W("father.wav") },
  "mother":                         { kikuyu: "Maitu",                              wav: W("mother.wav") },
  "friend":                         { kikuyu: "Mũrata",                             wav: W("friend.wav") },
  "enemy":                          { kikuyu: "Mũthamaki",                          wav: W("enemy.wav") },
  "home":                           { kikuyu: "Nyũmba",                             wav: W("home.wav") },

  // ── Communication ──────────────────────────────────────────────────────────
  "i will call you":                { kikuyu: "Nĩgũkũheana mũcemanio",              wav: W("i will call you.wav") },
  "i will phone you":               { kikuyu: "Nĩgũkũhĩa simu",                     wav: W("i will phone you.wav") },

  // ── Animals & nature ───────────────────────────────────────────────────────
  "goat":                           { kikuyu: "Mbũri",                              wav: W("goat.wav") },
  "horse":                          { kikuyu: "Farasi",                             wav: W("horse.wav") },
  "maize":                          { kikuyu: "Mũgũnda",                            wav: W("maize.wav") },
  "mouse":                          { kikuyu: "Mbũri ya gũthiĩ",                    wav: W("mouse or mice.wav") },
  "mice":                           { kikuyu: "Mbũri cia gũthiĩ",                   wav: W("mouse or mice.wav") },

  // ── Clothes ────────────────────────────────────────────────────────────────
  "shirt":                          { kikuyu: "Shati",                              wav: W("shirt.wav") },
  "blouse":                         { kikuyu: "Blauzi",                             wav: W("blouse.wav") },
  "trouser":                        { kikuyu: "Suruali",                            wav: W("trouser.wav") },
  "shorts":                         { kikuyu: "Suruali fupi",                       wav: W("shorts.wav") },
  "sweater":                        { kikuyu: "Sweta",                              wav: W("sweater.wav") },
  "shoe":                           { kikuyu: "Kiatu",                              wav: W("shoe.wav") },
  "shoes":                          { kikuyu: "Viatu",                              wav: W("shoes.wav") },
  "socks":                          { kikuyu: "Soksi",                              wav: W("socks.wav") },
  "tie":                            { kikuyu: "Tai",                                wav: W("tie.wav") },
  "vest":                           { kikuyu: "Fulana",                             wav: W("vest.wav") },
  "gumboot":                        { kikuyu: "Buti",                               wav: W("gumboot.wav") },
  "types of clothes":               { kikuyu: "Nguo cia kũhĩa",                     wav: W("typesof clothes.wav") },

  // ── Culture ────────────────────────────────────────────────────────────────
  "kikuyu":                         { kikuyu: "Gĩkũyũ",                             wav: W("kikuyu.wav") },
  "agikuyu":                        { kikuyu: "Agĩkũyũ",                            wav: W("agikuyu.wav") },

  // ── Actions ────────────────────────────────────────────────────────────────
  "reading":                        { kikuyu: "Gũthoma",                            wav: W("reading.wav") },
  "writing":                        { kikuyu: "Gũandĩka",                           wav: W("writing.wav") },
  "speaking":                       { kikuyu: "Gũcooka",                            wav: W("speaking.wav") },
};

export function lookupLocal(input: string): LocalPhrase | null {
  return LIBRARY[input.trim().toLowerCase()] ?? null;
}

export function getWavForPhrase(englishInput: string): string | null {
  return lookupLocal(englishInput)?.wav ?? null;
}
