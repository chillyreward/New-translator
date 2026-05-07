export interface Phrase {
  english: string;
  swahili: string;
  kikuyu: string;
  category: string;
}

export interface Filler {
  word: string;
  use: "emphasis" | "explanation" | "pause" | "soft_ending";
}

export const fillers: Filler[] = [
  { word: "ni",     use: "emphasis"    },
  { word: "ati",    use: "explanation" },
  { word: "riria",  use: "pause"       },
  { word: "niwega", use: "soft_ending" },
];

export const phrases: Phrase[] = [
  // greetings
  { english: "hello",                          swahili: "habari",                                   kikuyu: "kohana atia",                        category: "greetings" },
  { english: "hi",                             swahili: "habari",                                   kikuyu: "kohana atia",                        category: "greetings" },
  { english: "how are you",                    swahili: "habari yako",                              kikuyu: "Uhoro waku",                         category: "greetings" },
  { english: "are you okay",                   swahili: "uko sawa",                                 kikuyu: "we wĩmwega",                         category: "greetings" },
  { english: "i am fine",                      swahili: "niko sawa",                                kikuyu: "ndi mwega",                          category: "greetings" },
  { english: "yes i am okay",                  swahili: "ndiyo niko sawa",                          kikuyu: "ĩĩ ndĩ mwega",                       category: "greetings" },
  { english: "i am well too",                  swahili: "mimi pia niko sawa",                       kikuyu: "O nanĩĩ ndĩ mwega",                  category: "greetings" },
  { english: "welcome",                        swahili: "karibu",                                   kikuyu: "niwega",                             category: "greetings" },
  { english: "good morning",                   swahili: "habari ya asubuhi",                        kikuyu: "wega wa ruciini",                    category: "greetings" },
  { english: "good evening",                   swahili: "habari ya jioni",                          kikuyu: "wega wa hwa-ini",                    category: "greetings" },
  { english: "goodbye",                        swahili: "kwaheri",                                  kikuyu: "tigwo na thayu",                     category: "greetings" },
  { english: "thank you",                      swahili: "asante",                                   kikuyu: "ni ngatho",                          category: "greetings" },
  { english: "thank you very much",            swahili: "asante sana",                              kikuyu: "ni ngatho muno",                     category: "greetings" },
  { english: "you are welcome",                swahili: "karibu sana",                              kikuyu: "niwega muno",                        category: "greetings" },
  { english: "please",                         swahili: "tafadhali",                                kikuyu: "tafadhali",                          category: "greetings" },
  { english: "sorry",                          swahili: "samahani",                                 kikuyu: "pole",                               category: "greetings" },

  // identity
  { english: "what is your name",              swahili: "jina lako nani",                           kikuyu: "wĩtagwo atĩa",                       category: "identity" },
  { english: "whats your name",                swahili: "jina lako nani",                           kikuyu: "wĩtagwo atĩa",                       category: "identity" },
  { english: "my name is",                     swahili: "jina langu ni",                            kikuyu: "njĩtagwo",                           category: "identity" },
  { english: "we are happy to have you",       swahili: "tunafurahi kuwa nawe",                     kikuyu: "nituri na gikeno kugukuona",         category: "identity" },

  // places
  { english: "where are you",                  swahili: "uko wapi",                                 kikuyu: "uri ku",                             category: "places" },
  { english: "come here",                      swahili: "njoo hapa",                                kikuyu: "uka haha",                           category: "places" },
  { english: "go there",                       swahili: "nenda pale",                               kikuyu: "thiI kuo",                           category: "places" },
  { english: "where are you going",            swahili: "unakwenda wapi",                           kikuyu: "uendaga ku",                         category: "places" },
  { english: "i am going home",                swahili: "ninaenda nyumbani",                        kikuyu: "ni nendaga nyumba",                  category: "places" },
  { english: "the market",                     swahili: "sokoni",                                   kikuyu: "mutuura",                            category: "places" },
  { english: "the hospital",                   swahili: "hospitali",                                kikuyu: "ndugu",                              category: "places" },

  // phone / IVR
  { english: "enter your phone number",        swahili: "ingiza nambari yako",                      kikuyu: "tuhu namba yaku ya thimu",           category: "phone" },
  { english: "please enter your phone number", swahili: "tafadhali ingiza nambari yako ya simu",    kikuyu: "tafadhali tuhu namba yaku ya thimu", category: "phone" },
  { english: "invalid number",                 swahili: "namba si sahihi",                          kikuyu: "namba ti njega",                     category: "phone" },
  { english: "try again",                      swahili: "jaribu tena",                              kikuyu: "geria ringi",                        category: "phone" },
  { english: "processing",                     swahili: "inachakata",                               kikuyu: "iraruta wira",                       category: "phone" },
  { english: "completed",                      swahili: "imekamilika",                              kikuyu: "niyathira",                          category: "phone" },
  { english: "failed",                         swahili: "imeshindikana",                            kikuyu: "niyarema",                           category: "phone" },
  { english: "please wait",                    swahili: "tafadhali subiri",                         kikuyu: "riria hanini",                       category: "phone" },
  { english: "your call is important",         swahili: "simu yako ni muhimu",                      kikuyu: "ita yaku ni ya bata",                category: "phone" },
  { english: "press one",                      swahili: "bonyeza moja",                             kikuyu: "kanda imwe",                         category: "phone" },
  { english: "press two",                      swahili: "bonyeza mbili",                            kikuyu: "kanda igiri",                        category: "phone" },
  { english: "your request is complete",       swahili: "ombi lako limekamilika",                   kikuyu: "wira waku niwathira",                category: "phone" },
  { english: "an error occurred",              swahili: "kosa limetokea",                           kikuyu: "hari na thina",                      category: "phone" },

  // instructions
  { english: "listen to me",                   swahili: "nisikilize",                               kikuyu: "ndugukire",                          category: "instructions" },
  { english: "help me",                        swahili: "nisaidie",                                 kikuyu: "ndeithia",                           category: "instructions" },
  { english: "wait a moment",                  swahili: "subiri kidogo",                            kikuyu: "riria hanini",                       category: "instructions" },
  { english: "hurry up",                       swahili: "harakisha",                                kikuyu: "niguthii na hinya",                  category: "instructions" },
  { english: "stop",                           swahili: "simama",                                   kikuyu: "tigira",                             category: "instructions" },
  { english: "sit down",                       swahili: "kaa chini",                                kikuyu: "ikara thi",                          category: "instructions" },
  { english: "stand up",                       swahili: "simama",                                   kikuyu: "tigira wiri",                        category: "instructions" },
  { english: "please repeat that",             swahili: "tafadhali rudia",                          kikuyu: "tafadhali ugie ringi",               category: "instructions" },
  { english: "speak slowly",                   swahili: "sema polepole",                            kikuyu: "ugie na nguru nini",                 category: "instructions" },

  // understanding
  { english: "i understand",                   swahili: "ninaelewa",                                kikuyu: "ndikumenya",                         category: "sentences" },
  { english: "i don't understand",             swahili: "sielewi",                                  kikuyu: "nditiumenya",                        category: "sentences" },
  { english: "i do not understand",            swahili: "sielewi",                                  kikuyu: "ndimenyaga",                         category: "sentences" },
  { english: "how can i help you",             swahili: "naweza kukusaidiaje",                      kikuyu: "ndingugunteithia atia",              category: "sentences" },

  // emotions
  { english: "i am happy",                     swahili: "nina furaha",                              kikuyu: "ndi na gikeno",                      category: "emotions" },
  { english: "don't worry",                    swahili: "usijali",                                  kikuyu: "ndugacooke na meciiria",             category: "emotions" },
  { english: "everything is okay",             swahili: "kila kitu sawa",                           kikuyu: "indo ciothe ni njega",               category: "emotions" },
  { english: "i am sorry",                     swahili: "samahani",                                 kikuyu: "ni uuru wakwa",                      category: "emotions" },
  { english: "i love you",                     swahili: "nakupenda",                                kikuyu: "ningwendete",                        category: "emotions" },

  // time
  { english: "what time is it",                swahili: "ni saa ngapi",                             kikuyu: "ni saa ngapi",                       category: "time" },
  { english: "it is morning",                  swahili: "ni asubuhi",                               kikuyu: "ni ruciini",                         category: "time" },
  { english: "see you tomorrow",               swahili: "tutaonana kesho",                          kikuyu: "tuguonana ruciu",                    category: "time" },

  // food
  { english: "i am hungry",                    swahili: "nina njaa",                                kikuyu: "ndi muhotu",                         category: "food" },
  { english: "i am thirsty",                   swahili: "nina kiu",                                 kikuyu: "ndi munyotu",                        category: "food" },
  { english: "give me water",                  swahili: "nipe maji",                                kikuyu: "he mae",                             category: "food" },
  { english: "let us eat",                     swahili: "tukule",                                   kikuyu: "turie",                              category: "food" },
  { english: "the food is ready",              swahili: "chakula kiko tayari",                      kikuyu: "irio ni iri",                        category: "food" },

  // nature
  { english: "it is raining",                  swahili: "inanyesha",                                kikuyu: "mbura iri",                          category: "nature" },
  { english: "the sun is shining",             swahili: "jua linawaka",                             kikuyu: "ruua ruri",                          category: "nature" },
  { english: "the mountain",                   swahili: "mlima",                                    kikuyu: "kirima",                             category: "nature" },

  // news / broadcast
  { english: "welcome to todays news",         swahili: "karibu kwenye habari za leo",              kikuyu: "niwega kuri uhoro wa umuthi",        category: "news" },
  { english: "welcome to todays program",      swahili: "karibu kwenye kipindi",                    kikuyu: "niwega kuri uhoro wa umuthi",        category: "news" },
  { english: "todays news",                    swahili: "habari za leo",                            kikuyu: "uhoro wa umuthi",                    category: "news" },
  { english: "breaking news",                  swahili: "habari za haraka",                         kikuyu: "uhoro wa haraka",                    category: "news" },
  { english: "good news",                      swahili: "habari njema",                             kikuyu: "uhoro mwega",                        category: "news" },
  { english: "thank you for listening",        swahili: "asante kwa kusikiliza",                    kikuyu: "ni ngatho muno kuigua",              category: "news" },

  // system / IVR responses
  { english: "is there a problem",             swahili: "kuna tatizo",                              kikuyu: "hari na thina",                      category: "system" },
  { english: "give me your number",            swahili: "nipe nambari yako",                        kikuyu: "hee namba yaku ya thimu",            category: "system" },
  { english: "i am okay",                      swahili: "niko sawa",                                kikuyu: "ndi mwega",                          category: "system" },
  { english: "i am good",                      swahili: "niko vizuri",                              kikuyu: "ndi mwega",                          category: "system" },
  { english: "thank you so much",              swahili: "asante sana sana",                         kikuyu: "ni ngatho muno",                     category: "system" },
  { english: "your work is done",              swahili: "kazi yako imekamilika",                    kikuyu: "wira waku niwathira",                category: "system" },
  { english: "your work is finished",          swahili: "kazi yako imeisha",                        kikuyu: "wira waku niwathira",                category: "system" },
  { english: "work is done",                   swahili: "kazi imekamilika",                         kikuyu: "wira urathira",                      category: "system" },
  { english: "finish",                         swahili: "maliza",                                   kikuyu: "rikia",                              category: "system" },
  { english: "where am i",                     swahili: "niko wapi",                                kikuyu: "ndi ku",                             category: "system" },
  { english: "i am here",                      swahili: "niko hapa",                                kikuyu: "ndi guku",                           category: "system" },
  { english: "i will come",                    swahili: "nitakuja",                                 kikuyu: "ninguuka",                           category: "system" },
  { english: "coming",                         swahili: "nakuja",                                   kikuyu: "ninguuka",                           category: "system" },
  { english: "go there",                       swahili: "nenda pale",                               kikuyu: "thii kuo",                           category: "system" },
  { english: "glad to hear",                   swahili: "furaha kusikia",                           kikuyu: "ni ngatho muno kuigua",              category: "system" },
  { english: "good to hear",                   swahili: "vizuri kusikia",                           kikuyu: "ni ngatho muno kuigua",              category: "system" },

  // vocabulary
  { english: "keep quiet",                     swahili: "nyamaza",                                  kikuyu: "kira",                               category: "vocabulary" },
  { english: "quiet",                          swahili: "nyamaza",                                  kikuyu: "Tũmia",                              category: "vocabulary" },
  { english: "shut up",                        swahili: "nyamaza",                                  kikuyu: "Kĩra",                               category: "vocabulary" },
  { english: "i will call you",                swahili: "nitakupigia simu",                         kikuyu: "ningukuhurira thimu",                category: "vocabulary" },
  { english: "i will phone you",               swahili: "nitakupigia simu",                         kikuyu: "ningukuhurira thimu",                category: "vocabulary" },
  { english: "beating",                        swahili: "kupiga",                                   kikuyu: "kuhura",                             category: "vocabulary" },
  { english: "stop laughing",                  swahili: "acha kucheka",                             kikuyu: "tiga gutheka",                       category: "vocabulary" },
  { english: "thank you",                      swahili: "asante",                                   kikuyu: "niwega",                             category: "vocabulary" },
  { english: "thank you so much",              swahili: "asante sana",                              kikuyu: "niwega muno",                        category: "vocabulary" },
  { english: "come in",                        swahili: "ingia",                                    kikuyu: "ingira",                             category: "vocabulary" },
  { english: "food",                           swahili: "chakula",                                  kikuyu: "irio",                               category: "vocabulary" },
  { english: "water",                          swahili: "maji",                                     kikuyu: "mae",                                category: "vocabulary" },
  { english: "home",                           swahili: "nyumba",                                   kikuyu: "mucii",                              category: "vocabulary" },
  { english: "come",                           swahili: "kuja",                                     kikuyu: "uka",                                category: "vocabulary" },
  { english: "go",                             swahili: "nenda",                                    kikuyu: "thii",                               category: "vocabulary" },
  { english: "father",                         swahili: "baba",                                     kikuyu: "fafa",                               category: "vocabulary" },
  { english: "mother",                         swahili: "mama",                                     kikuyu: "maitu",                              category: "vocabulary" },
  { english: "friend",                         swahili: "rafiki",                                   kikuyu: "murata",                             category: "vocabulary" },
  { english: "enemy",                          swahili: "adui",                                     kikuyu: "thu",                                category: "vocabulary" },
  { english: "mine",                           swahili: "yangu",                                    kikuyu: "yakwa",                              category: "vocabulary" },

  // language & culture
  { english: "learn to read",                  swahili: "jifunza kusoma",                           kikuyu: "wirute guthoma",                     category: "culture" },
  { english: "write",                          swahili: "andika",                                   kikuyu: "kwandika",                           category: "culture" },
  { english: "speak kikuyu",                   swahili: "sema kikuyu",                              kikuyu: "kuaria gikuyu",                      category: "culture" },
  { english: "people",                         swahili: "watu",                                     kikuyu: "andu",                               category: "culture" },
  { english: "kikuyu people",                  swahili: "watu wa kikuyu",                           kikuyu: "agikuyu",                            category: "culture" },
  { english: "language",                       swahili: "lugha",                                    kikuyu: "mwaririe",                           category: "culture" },
  { english: "kikuyu language",                swahili: "lugha ya kikuyu",                          kikuyu: "gigikuyu",                           category: "culture" },
  { english: "person",                         swahili: "mtu",                                      kikuyu: "mundu",                              category: "culture" },
  { english: "kikuyu person",                  swahili: "mtu wa kikuyu",                            kikuyu: "mugikuyu",                           category: "culture" },

  // animals & nature
  { english: "maize",                          swahili: "mahindi",                                  kikuyu: "mbembe",                             category: "nature" },
  { english: "goat",                           swahili: "mbuzi",                                    kikuyu: "mburi",                              category: "nature" },
  { english: "horse",                          swahili: "farasi",                                   kikuyu: "mbarathi",                           category: "nature" },
  { english: "mouse",                          swahili: "panya",                                    kikuyu: "mbia",                               category: "nature" },
  { english: "mice",                           swahili: "panya",                                    kikuyu: "mbia",                               category: "nature" },

  // body parts
  { english: "hand",                           swahili: "mkono",                                    kikuyu: "Guoko",                              category: "body" },
  { english: "face",                           swahili: "uso",                                      kikuyu: "ũthiũ",                              category: "body" },
  { english: "my face",                        swahili: "uso wangu",                                kikuyu: "ũthiũ wakwa",                        category: "body" },
  { english: "stomach",                        swahili: "tumbo",                                    kikuyu: "Nda",                                category: "body" },
  { english: "head",                           swahili: "kichwa",                                   kikuyu: "Mũtwe",                              category: "body" },
  { english: "shoulder",                       swahili: "bega",                                     kikuyu: "Kiande",                             category: "body" },
  { english: "chest",                          swahili: "kifua",                                    kikuyu: "Githũri",                            category: "body" },
  { english: "waist",                          swahili: "kiuno",                                    kikuyu: "Njohero",                            category: "body" },
  { english: "slim",                           swahili: "mwembamba",                                kikuyu: "Njeke",                              category: "body" },
  { english: "thigh",                          swahili: "paja",                                     kikuyu: "Kiero",                              category: "body" },
  { english: "thighs",                         swahili: "mapaja",                                   kikuyu: "Shiero",                             category: "body" },
  { english: "leg",                            swahili: "mguu",                                     kikuyu: "Kũgũrũ",                             category: "body" },
  { english: "legs",                           swahili: "miguu",                                    kikuyu: "Magũrũ",                             category: "body" },
  { english: "knee",                           swahili: "goti",                                     kikuyu: "Iru",                                category: "body" },
  { english: "ankle",                          swahili: "kifundo cha mguu",                         kikuyu: "Itede",                              category: "body" },
  { english: "ankles",                         swahili: "vifundo vya miguu",                        kikuyu: "Matede",                             category: "body" },
  { english: "heel",                           swahili: "kisigino",                                 kikuyu: "Ikinya",                             category: "body" },
  { english: "heels",                          swahili: "visigino",                                 kikuyu: "Makinya",                            category: "body" },
  { english: "eye",                            swahili: "jicho",                                    kikuyu: "Ritho",                              category: "body" },
  { english: "eyes",                           swahili: "macho",                                    kikuyu: "Maitho",                             category: "body" },
  { english: "mouth",                          swahili: "mdomo",                                    kikuyu: "Kanua",                              category: "body" },
  { english: "nose",                           swahili: "pua",                                      kikuyu: "Iniũrũ",                             category: "body" },
  { english: "ear",                            swahili: "sikio",                                    kikuyu: "Gũtũ",                               category: "body" },
  { english: "ears",                           swahili: "masikio",                                  kikuyu: "Matũ",                               category: "body" },
  { english: "finger",                         swahili: "kidole",                                   kikuyu: "Kĩara",                              category: "body" },
  { english: "fingers",                        swahili: "vidole",                                   kikuyu: "Ciara",                              category: "body" },
  { english: "elbow",                          swahili: "kiwiko",                                   kikuyu: "Kĩgokora",                           category: "body" },
  { english: "palm",                           swahili: "kiganja",                                  kikuyu: "Rũhĩ",                               category: "body" },
  { english: "neck",                           swahili: "shingo",                                   kikuyu: "Gigo",                               category: "body" },
  { english: "cheeks",                         swahili: "mashavu",                                  kikuyu: "Makaĩ",                              category: "body" },

  // spiritual / creation
  { english: "god",                            swahili: "mungu",                                    kikuyu: "Ngai",                               category: "spiritual" },
  { english: "earth",                          swahili: "dunia",                                    kikuyu: "Thi",                                category: "spiritual" },
  { english: "create",                         swahili: "umba",                                     kikuyu: "Oombire",                            category: "spiritual" },
  { english: "all",                            swahili: "yote",                                     kikuyu: "Guothe",                             category: "spiritual" },
  { english: "dark",                           swahili: "giza",                                     kikuyu: "Nduma",                              category: "spiritual" },
  { english: "darkness",                       swahili: "giza",                                     kikuyu: "Nduma",                              category: "spiritual" },

  // actions
  { english: "we see",                         swahili: "tunaona",                                  kikuyu: "Twonaga",                            category: "actions" },
  { english: "we eat",                         swahili: "tunakula",                                 kikuyu: "Tũriaga",                            category: "actions" },
  { english: "lets learn",                     swahili: "hebu tujifunze",                           kikuyu: "Tuthome",                            category: "actions" },
  { english: "let us learn",                   swahili: "hebu tujifunze",                           kikuyu: "Tuthome",                            category: "actions" },
];



export function phoneticConvert(text: string): string {
  return text
    .replace(/ũũ/g, "oo")        // double ũũ → long stretchy "oo"
    .replace(/ĩĩ/g, "ee")        // double ĩĩ → long "ee"
    .replace(/ĩ/g, "i")
    .replace(/ũ/g, "u")
    .replace(/th/g, "dh")
    .replace(/ng'/g, "ng")
    .replace(/mw/g, "mwe")
    .replace(/ny/g, "ni")
    .replace(/\binĩ\b/g, "o")    // locative -inĩ suffix → "o"
    .replace(/\s+/g, " ")
    .trim();
}

export function searchPhrases(query: string, category?: string): Phrase[] {
  const lower = query.toLowerCase();
  return phrases.filter(p => {
    const matchesQuery =
      p.english.toLowerCase().includes(lower) ||
      p.swahili.toLowerCase().includes(lower) ||
      p.kikuyu.toLowerCase().includes(lower);
    const matchesCategory = category ? p.category === category : true;
    return matchesQuery && matchesCategory;
  });
}

export function getCategories(): string[] {
  return [...new Set(phrases.map(p => p.category))];
}



