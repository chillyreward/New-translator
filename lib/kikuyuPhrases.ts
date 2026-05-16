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
  { english: "i am fine",                      swahili: "niko sawa",                                kikuyu: "ndí mwega",                          category: "greetings" },
  { english: "yes i am okay",                  swahili: "ndiyo niko sawa",                          kikuyu: "ĩĩ ndĩ mwega",                       category: "greetings" },
  { english: "i am well too",                  swahili: "mimi pia niko sawa",                       kikuyu: "O nanĩĩ ndĩ mwega",                  category: "greetings" },
  { english: "i am doing great",               swahili: "niko vizuri sana",                         kikuyu: "Ndímwega",                           category: "greetings" },
  { english: "welcome",                        swahili: "karibu",                                   kikuyu: "niwega",                             category: "greetings" },
  { english: "good morning",                   swahili: "habari ya asubuhi",                        kikuyu: "Úhoro wa rúciní",                    category: "greetings" },
  { english: "good afternoon",                 swahili: "habari ya mchana",                         kikuyu: "Úhoro wa míaraho",                   category: "greetings" },
  { english: "good evening",                   swahili: "habari ya jioni",                          kikuyu: "Úhoro wa húainí",                    category: "greetings" },
  { english: "goodbye",                        swahili: "kwaheri",                                  kikuyu: "tigwo na thayu",                     category: "greetings" },
  { english: "have a good day",                swahili: "uwe na siku njema",                        kikuyu: "Gía na múthenya mwega",              category: "greetings" },
  { english: "how are you today",              swahili: "habari yako leo",                          kikuyu: "Úhana atía úmuthí",                  category: "greetings" },
  { english: "nice to meet you",               swahili: "nafurahi kukujua",                         kikuyu: "Níndakena ní gúkuona",               category: "greetings" },
  { english: "see you soon",                   swahili: "tutaonana hivi karibuni",                  kikuyu: "Tuonane ica ikuhí",                  category: "greetings" },
  { english: "see you later",                  swahili: "tutaonana baadaye",                        kikuyu: "Tuonane mahinda mangí",              category: "greetings" },
  { english: "see you tomorrow",               swahili: "tutaonana kesho",                          kikuyu: "Tuonane rúciú",                      category: "greetings" },
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

  // places & location
  { english: "where are you",                  swahili: "uko wapi",                                 kikuyu: "Wí kú",                              category: "places" },
  { english: "where did you go",               swahili: "ulienda wapi",                             kikuyu: "Úthire kú",                          category: "places" },
  { english: "where do you live",              swahili: "unaishi wapi",                             kikuyu: "Úikaraga kú",                        category: "places" },
  { english: "where are you going",            swahili: "unakwenda wapi",                           kikuyu: "Wathií kú",                          category: "places" },
  { english: "where were you",                 swahili: "ulikuwa wapi",                             kikuyu: "Warí kú",                            category: "places" },
  { english: "i went to the market for shopping", swahili: "nilikwenda sokoni kununua vitu",        kikuyu: "Nií thiire thoko kúgúra indo",        category: "places" },
  { english: "i was in my room folding clothes", swahili: "nilikuwa chumbani nikipiga nguo",        kikuyu: "Nií ndarí rumu yakwa ngíkúnja nguo",  category: "places" },
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

  // emotions & health
  { english: "i am happy",                     swahili: "nina furaha",                              kikuyu: "ndi na gikeno",                      category: "emotions" },
  { english: "don't worry",                    swahili: "usijali",                                  kikuyu: "ndugacooke na meciiria",             category: "emotions" },
  { english: "everything is okay",             swahili: "kila kitu sawa",                           kikuyu: "indo ciothe ni njega",               category: "emotions" },
  { english: "i am sorry",                     swahili: "samahani",                                 kikuyu: "ni uuru wakwa",                      category: "emotions" },
  { english: "i love you",                     swahili: "nakupenda",                                kikuyu: "ningwendete",                        category: "emotions" },
  { english: "how are you feeling",            swahili: "unajisikiaje",                             kikuyu: "Úraigua atía",                       category: "emotions" },
  { english: "i am feeling dizzy",             swahili: "ninahisi kizunguzungu",                    kikuyu: "ndíraigua toro",                     category: "emotions" },
  { english: "pain",                           swahili: "maumivu",                                  kikuyu: "ruo",                                category: "emotions" },

  // time
  { english: "what time is it",                swahili: "ni saa ngapi",                             kikuyu: "ni saa ngapi",                       category: "time" },
  { english: "it is morning",                  swahili: "ni asubuhi",                               kikuyu: "ni ruciini",                         category: "time" },
  { english: "see you tomorrow",               swahili: "tutaonana kesho",                          kikuyu: "tuguonana ruciu",                    category: "time" },

  // food & drink
  { english: "i am hungry",                    swahili: "nina njaa",                                kikuyu: "ndi muhotu",                         category: "food" },
  { english: "i am thirsty",                   swahili: "nina kiu",                                 kikuyu: "ndi munyotu",                        category: "food" },
  { english: "give me water",                  swahili: "nipe maji",                                kikuyu: "he mae",                             category: "food" },
  { english: "let us eat",                     swahili: "tukule",                                   kikuyu: "turie",                              category: "food" },
  { english: "the food is ready",              swahili: "chakula kiko tayari",                      kikuyu: "irio ni iri",                        category: "food" },
  { english: "flour",                          swahili: "unga",                                     kikuyu: "mútu",                               category: "food" },
  { english: "porridge",                       swahili: "uji",                                      kikuyu: "ucúrú",                              category: "food" },
  { english: "water",                          swahili: "maji",                                     kikuyu: "maí",                                category: "food" },
  { english: "saliva",                         swahili: "mate",                                     kikuyu: "mata",                               category: "food" },
  { english: "oil",                            swahili: "mafuta",                                   kikuyu: "maguta",                             category: "food" },
  { english: "milk",                           swahili: "maziwa",                                   kikuyu: "iria",                               category: "food" },
  { english: "air",                            swahili: "hewa",                                     kikuyu: "ríera",                              category: "food" },
  { english: "how much",                       swahili: "bei gani",                                 kikuyu: "Úigana atía",                        category: "food" },

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
  { english: "teeth",                          swahili: "meno",                                     kikuyu: "Magego",                             category: "body" },
  { english: "that girl has nice cheeks",      swahili: "msichana huyo ana mashavu mazuri",          kikuyu: "Moiretu uria ena makai mega",         category: "body" },
  { english: "forehead",                       swahili: "paji la uso",                              kikuyu: "Gĩthĩ",                              category: "body" },
  { english: "hair",                           swahili: "nywele",                                   kikuyu: "Juere",                              category: "body" },
  { english: "beards",                         swahili: "ndevu",                                    kikuyu: "Nderu",                              category: "body" },
  { english: "shoulders",                      swahili: "mabega",                                   kikuyu: "Iande",                              category: "body" },
  { english: "small waist",                    swahili: "kiuno kidogo",                             kikuyu: "Njohero njeke",                      category: "body" },
  { english: "my mouth",                       swahili: "mdomo wangu",                              kikuyu: "Kanua gakwa",                        category: "body" },

  // spiritual / creation
  { english: "god",                            swahili: "mungu",                                    kikuyu: "Ngai",                               category: "spiritual" },
  { english: "earth",                          swahili: "dunia",                                    kikuyu: "Thi",                                category: "spiritual" },
  { english: "create",                         swahili: "umba",                                     kikuyu: "Oombire",                            category: "spiritual" },
  { english: "created",                        swahili: "aliumba",                                  kikuyu: "nĩombire",                           category: "spiritual" },
  { english: "all",                            swahili: "yote",                                     kikuyu: "Guothe",                             category: "spiritual" },
  { english: "dark",                           swahili: "giza",                                     kikuyu: "Nduma",                              category: "spiritual" },
  { english: "darkness",                       swahili: "giza",                                     kikuyu: "Nduma",                              category: "spiritual" },
  { english: "in the beginning",               swahili: "mwanzo",                                   kikuyu: "Kĩambĩrĩria-inĩ",                   category: "spiritual" },
  { english: "things",                         swahili: "vitu",                                     kikuyu: "maũndũ",                             category: "spiritual" },
  { english: "heaven",                         swahili: "mbinguni",                                 kikuyu: "igũrũ",                              category: "spiritual" },
  { english: "that time",                      swahili: "wakati huo",                               kikuyu: "Hĩndĩ ĩyo",                          category: "spiritual" },
  { english: "there was no",                   swahili: "haikuwepo",                                kikuyu: "ndĩarĩ",                             category: "spiritual" },
  { english: "spirit",                         swahili: "roho",                                     kikuyu: "Roho",                               category: "spiritual" },
  { english: "of",                             swahili: "ya",                                       kikuyu: "wa",                                 category: "spiritual" },
  { english: "water",                          swahili: "maji",                                     kikuyu: "maaĩ",                               category: "spiritual" },
  { english: "hovering",                       swahili: "ikielea",                                  kikuyu: "aareerete",                          category: "spiritual" },
  { english: "light",                          swahili: "nuru",                                     kikuyu: "ũtheri",                             category: "spiritual" },
  { english: "day",                            swahili: "siku",                                     kikuyu: "mũthenya",                           category: "spiritual" },
  { english: "night",                          swahili: "usiku",                                    kikuyu: "ũtukũ",                              category: "spiritual" },
  { english: "first",                          swahili: "kwanza",                                   kikuyu: "mbere",                              category: "spiritual" },
  { english: "middle",                         swahili: "katikati",                                 kikuyu: "gatagatĩ",                           category: "spiritual" },
  { english: "between",                        swahili: "kati",                                     kikuyu: "gatagatĩ",                           category: "spiritual" },

  // actions
  { english: "we see",                         swahili: "tunaona",                                  kikuyu: "Twonaga",                            category: "actions" },
  { english: "we eat",                         swahili: "tunakula",                                 kikuyu: "Tũriaga",                            category: "actions" },
  { english: "lets learn",                     swahili: "hebu tujifunze",                           kikuyu: "Tuthome",                            category: "actions" },
  { english: "let us learn",                   swahili: "hebu tujifunze",                           kikuyu: "Tuthome",                            category: "actions" },
  { english: "reading",                        swahili: "kusoma",                                   kikuyu: "Gũthoma",                            category: "actions" },
  { english: "writing",                        swahili: "kuandika",                                 kikuyu: "Kwandika",                           category: "actions" },
  { english: "speaking",                       swahili: "kusema",                                   kikuyu: "Gũaria",                             category: "actions" },
  { english: "i will slap you",                swahili: "nitakupiga kofi",                          kikuyu: "Nĩngũkũhura",                        category: "actions" },

  // love & relationships
  { english: "i love you",                     swahili: "nakupenda",                                kikuyu: "ningwendete",                        category: "love" },
  { english: "love you so much",               swahili: "nakupenda sana",                           kikuyu: "Ngwendete múno",                     category: "love" },
  { english: "i love you with all my heart",   swahili: "nakupenda kwa moyo wangu wote",            kikuyu: "Nwendete na ngoro yakwa yothe",      category: "love" },
  { english: "i love you too",                 swahili: "nakupenda pia",                            kikuyu: "Onanií níngwendete",                 category: "love" },
  { english: "i like you",                     swahili: "unapendeza",                               kikuyu: "Níndakwenda",                        category: "love" },
  { english: "you are beautiful",              swahili: "wewe ni mzuri",                            kikuyu: "Wí múthaka",                         category: "love" },
  { english: "you look beautiful",             swahili: "unaonekana mzuri",                         kikuyu: "Úthakaríte",                         category: "love" },
  { english: "my love",                        swahili: "mpenzi wangu",                             kikuyu: "Mwendwa wakwa",                      category: "love" },
  { english: "my beautiful wife",              swahili: "mke wangu mzuri",                          kikuyu: "Mútumia wakwa kírorerwa",            category: "love" },
  { english: "i miss you so much darling",     swahili: "nakukosa sana mpenzi",                     kikuyu: "Ndírirírie gúkuona mwendwa",         category: "love" },
  { english: "i miss you so much",             swahili: "nakukosa sana",                            kikuyu: "Ndírirírie gúkuona mwendwa",         category: "love" },
  { english: "i need you",                     swahili: "nahitaji wewe",                            kikuyu: "Níngúbataire",                       category: "love" },
  { english: "i need your love",               swahili: "nahitaji upendo wako",                     kikuyu: "Níbatairio ní wendo waku",           category: "love" },
  { english: "i want to see you",              swahili: "nataka kukuona",                           kikuyu: "Níndírenda gúkuona",                 category: "love" },
  { english: "you will miss me",               swahili: "utanikosa",                                kikuyu: "Níúkeriríria kúnyona",               category: "love" },
  { english: "you are mine",                   swahili: "wewe ni wangu",                            kikuyu: "Wí wakwa",                           category: "love" },
  { english: "i want some space",              swahili: "nataka nafasi",                            kikuyu: "Amba úhe kahinda",                   category: "love" },
  { english: "goodbye my love",                swahili: "kwaheri mpenzi wangu",                     kikuyu: "Mahinda mega mwendwa wakwa",         category: "love" },
  { english: "i will marry you",               swahili: "nitakuoa",                                 kikuyu: "Níngúkúhikia",                       category: "love" },

  // everyday expressions
  { english: "happy birthday",                 swahili: "hongera siku ya kuzaliwa",                 kikuyu: "múthenya mwega wa gúciarúo",          category: "everyday" },
  { english: "i am sorry",                     swahili: "samahani",                                 kikuyu: "níndahera",                          category: "everyday" },
  { english: "you are welcome",                swahili: "karibu",                                   kikuyu: "Wí múnyite úgeni",                   category: "everyday" },
  { english: "me too",                         swahili: "mimi pia",                                 kikuyu: "onanií",                             category: "everyday" },
  { english: "god bless you",                  swahili: "mungu akubariki",                          kikuyu: "Ngai akúrathime",                    category: "everyday" },
  { english: "may god protect you",            swahili: "mungu akulinde",                           kikuyu: "Ngai arokúgitíra",                   category: "everyday" },
  { english: "she is happy",                   swahili: "yeye ana furaha",                          kikuyu: "Ní múkenu",                          category: "everyday" },
  { english: "please help me",                 swahili: "tafadhali nisaidie",                       kikuyu: "Ndagúthaitha ndeithia",              category: "everyday" },
  { english: "i don't know",                   swahili: "sijui",                                    kikuyu: "Ndiúí",                              category: "everyday" },
  { english: "i will come tomorrow",           swahili: "nitakuja kesho",                           kikuyu: "Níngoka rúciú",                      category: "everyday" },
  { english: "come here",                      swahili: "njoo hapa",                                kikuyu: "Úka haha",                           category: "everyday" },
  { english: "feel at home",                   swahili: "jisikie nyumbani",                         kikuyu: "Wíigue wí múcií",                    category: "everyday" },
  { english: "be blessed",                     swahili: "ubarikiwe",                                kikuyu: "Rathimwo",                           category: "everyday" },
  { english: "i am coming soon",               swahili: "ninakuja hivi karibuni",                   kikuyu: "Níndíroka o naihenya",               category: "everyday" },
  { english: "excuse me",                      swahili: "nisamehe",                                 kikuyu: "Tebu",                               category: "everyday" },
  { english: "leave me alone",                 swahili: "niacha peke yangu",                        kikuyu: "Tigana nanií",                       category: "everyday" },
  { english: "it is okay",                     swahili: "sawa",                                     kikuyu: "Nowega",                             category: "everyday" },
  { english: "no problem",                     swahili: "hakuna shida",                             kikuyu: "Hatírí na thína",                    category: "everyday" },
  { english: "i am going home",                swahili: "ninaenda nyumbani",                        kikuyu: "Níkúinúka ndírainúka",               category: "everyday" },
  { english: "i don't want",                   swahili: "sitaki",                                   kikuyu: "Ndirenda",                           category: "everyday" },
  { english: "love is a beautiful thing",      swahili: "upendo ni kitu kizuri",                    kikuyu: "Nínyendete kíndu gíthaka",           category: "everyday" },
  { english: "let me try",                     swahili: "niache nijaribu",                          kikuyu: "Amba ngerie",                        category: "everyday" },
  { english: "welcome home",                   swahili: "karibu nyumbani",                          kikuyu: "Karibu múcií",                       category: "everyday" },
  { english: "i reached home safely",          swahili: "nilifika nyumbani salama",                 kikuyu: "Ndakinyire múcií owega",             category: "everyday" },
  { english: "god is good",                    swahili: "mungu ni mwema",                           kikuyu: "Ngai ní mwega",                      category: "everyday" },
  { english: "i don't understand",             swahili: "sielewi",                                  kikuyu: "Ndiranyita",                         category: "everyday" },
  { english: "we are happy to see you",        swahili: "tunafurahi kukuona",                       kikuyu: "Nítwakena ní gúkuona",               category: "everyday" },
  { english: "i have it",                      swahili: "niko nacho",                               kikuyu: "Níndakíenda",                        category: "everyday" },
  { english: "rest in peace",                  swahili: "pumzika kwa amani",                        kikuyu: "Koma thayú",                         category: "everyday" },
  { english: "i don't have money",             swahili: "sina pesa",                                kikuyu: "Ndirí na mbia",                      category: "everyday" },
  { english: "i am done",                      swahili: "nimemaliza",                               kikuyu: "Nindaríkia",                         category: "everyday" },
  { english: "i am going to the shop",         swahili: "ninaenda dukani",                          kikuyu: "Ndathií nduka",                      category: "everyday" },
  { english: "happy new year",                 swahili: "heri ya mwaka mpya",                       kikuyu: "Mwaka mwerú mwega",                  category: "everyday" },
  { english: "bad manners",                    swahili: "tabia mbaya",                              kikuyu: "Mítugo míúru",                       category: "everyday" },
  { english: "stop using your phone",          swahili: "acha kutumia simu yako",                   kikuyu: "Tiga kúhúthíra thimú yaku",          category: "everyday" },
  { english: "i need a favour please",         swahili: "nahitaji msaada tafadhali",                kikuyu: "Ndírenda undeithie",                 category: "everyday" },
  { english: "i haven't seen you for ages",    swahili: "sijakuona kwa muda mrefu",                 kikuyu: "Ngwíriga tene",                      category: "everyday" },
  { english: "great to see you again",         swahili: "vizuri kukuona tena",                      kikuyu: "Níúndú múnene gúkuona ríngí",        category: "everyday" },
  { english: "i really appreciate it",         swahili: "ninashukuru sana",                         kikuyu: "Níndakenio níkío",                   category: "everyday" },
  { english: "you made my day",                swahili: "umefanya siku yangu",                      kikuyu: "Niwanjaka úmúthí",                   category: "everyday" },

  // clothing
  { english: "sweater",                        swahili: "sweta",                                    kikuyu: "furana",                             category: "clothing" },
  { english: "shorts",                         swahili: "suruali fupi",                             kikuyu: "Kinyatha",                           category: "clothing" },
  { english: "shirt",                          swahili: "shati",                                    kikuyu: "chati",                              category: "clothing" },
  { english: "blouse",                         swahili: "blauzi",                                   kikuyu: "mburauthi",                          category: "clothing" },
  { english: "socks",                          swahili: "soksi",                                    kikuyu: "thogithi",                           category: "clothing" },
  { english: "shoe",                           swahili: "kiatu",                                    kikuyu: "iratu",                              category: "clothing" },
  { english: "tie",                            swahili: "tai",                                      kikuyu: "tai",                                category: "clothing" },
  { english: "trouser",                        swahili: "suruali",                                  kikuyu: "mofuto",                             category: "clothing" },
  { english: "trousers",                       swahili: "suruali",                                  kikuyu: "mofuto",                             category: "clothing" },

  // health & medical
  { english: "blood",                          swahili: "damu",                                     kikuyu: "thakame",                            category: "health" },
  { english: "urine",                          swahili: "mkojo",                                    kikuyu: "mathugumo",                          category: "health" },
  { english: "feces",                          swahili: "kinyesi",                                  kikuyu: "mai",                                category: "health" },
  { english: "muscle pull",                    swahili: "mshtuko wa misuli",                        kikuyu: "Kifunga",                            category: "health" },
  { english: "sick person",                    swahili: "mgonjwa",                                  kikuyu: "muruaru",                            category: "health" },
  { english: "tiredness",                      swahili: "uchovu",                                   kikuyu: "minoga",                             category: "health" },
  { english: "pregnancy",                      swahili: "ujauzito",                                 kikuyu: "ihu",                                category: "health" },
  { english: "coughing",                       swahili: "kukohoa",                                  kikuyu: "Gukorora",                           category: "health" },
  { english: "needle",                         swahili: "sindano",                                  kikuyu: "shidano",                            category: "health" },
  { english: "hospital",                       swahili: "hospitali",                                kikuyu: "thifitari",                          category: "health" },
  { english: "doctor",                         swahili: "daktari",                                  kikuyu: "ndagitari",                          category: "health" },
  { english: "ward",                           swahili: "wodi",                                     kikuyu: "wondi",                              category: "health" },
  { english: "stomach ache",                   swahili: "maumivu ya tumbo",                         kikuyu: "kurio ni nda",                       category: "health" },
  { english: "constipation",                   swahili: "choo kigumu",                              kikuyu: "Kuhuhita",                           category: "health" },
  { english: "shivering",                      swahili: "kutetemeka",                               kikuyu: "Kuinaina",                           category: "health" },
  { english: "temperature",                    swahili: "joto la mwili",                            kikuyu: "Urugari",                            category: "health" },
  { english: "medicine",                       swahili: "dawa",                                     kikuyu: "dawa",                               category: "health" },
  { english: "physician",                      swahili: "daktari",                                  kikuyu: "murigiti",                           category: "health" },
  { english: "smelling",                       swahili: "kunusa",                                   kikuyu: "kununga",                            category: "health" },
  { english: "i am sick",                      swahili: "mimi ni mgonjwa",                          kikuyu: "ndi muruaru",                        category: "health" },
  { english: "i have a headache",              swahili: "nina maumivu ya kichwa",                   kikuyu: "ndirario ni mutwe",                  category: "health" },
  { english: "i have a stomachache",           swahili: "nina maumivu ya tumbo",                    kikuyu: "ndirario ni nda",                    category: "health" },
  { english: "i am going to the hospital",     swahili: "ninaenda hospitali",                       kikuyu: "Ndathii thibitari",                  category: "health" },
  { english: "a good doctor",                  swahili: "daktari mzuri",                            kikuyu: "ndagitari mwega",                    category: "health" },
  { english: "i am pregnant",                  swahili: "mimi ni mjamzito",                         kikuyu: "ndi na ndaa",                        category: "health" },
  { english: "i have recovered",               swahili: "nimepona",                                 kikuyu: "ni ndirahonire",                     category: "health" },
  { english: "i am taking medicine",           swahili: "ninakula dawa",                            kikuyu: "ni ndiranyua ndawa",                 category: "health" },
  { english: "i am going to the washroom",     swahili: "ninaenda chooni",                          kikuyu: "ndathii bata",                       category: "health" },
  { english: "i am going to washrooms",        swahili: "ninaenda chooni",                          kikuyu: "ndathii bata",                       category: "health" },

  { english: "vest",                           swahili: "fulana",                                   kikuyu: "Nguo ya ndani",                      category: "clothing" },
  { english: "gumboot",                        swahili: "buti",                                     kikuyu: "Gumubuti",                           category: "clothing" },
  { english: "types of clothes",               swahili: "aina za nguo",                             kikuyu: "Mithemba ya nguo",                   category: "clothing" },
  { english: "shoes",                          swahili: "viatu",                                    kikuyu: "iratu",                              category: "clothing" },
  { english: "fever",                          swahili: "homa",                                     kikuyu: "Urugari",                            category: "health" },
  { english: "patient",                        swahili: "mgonjwa",                                  kikuyu: "muruaru",                            category: "health" },
  { english: "stomachache",                    swahili: "maumivu ya tumbo",                         kikuyu: "ndirario ni nda",                    category: "health" },
  { english: "shivering or shaking",           swahili: "kutetemeka",                               kikuyu: "Kuinaina",                           category: "health" },
  { english: "id",                             swahili: "kitambulisho",                             kikuyu: "kifade",                             category: "everyday" },
  { english: "identity card",                  swahili: "kitambulisho",                             kikuyu: "kifade",                             category: "everyday" },

  // verb conjugation — root: oka (to come/arrive)
  // Nĩ = emphasis prefix | person prefixes: nd(i)=I, tu=we, w=you, (none)=he/she, m=they
  { english: "i have come",                    swahili: "nimefika",                                 kikuyu: "Nĩndoka",                            category: "actions" },
  { english: "we have come",                   swahili: "tumefika",                                 kikuyu: "Nĩtuoka",                            category: "actions" },
  { english: "you have come",                  swahili: "umefika",                                  kikuyu: "Nĩwoka",                             category: "actions" },
  { english: "he has come",                    swahili: "amefika",                                  kikuyu: "Nĩoka",                              category: "actions" },
  { english: "she has come",                   swahili: "amefika",                                  kikuyu: "Nĩoka",                              category: "actions" },
  { english: "they have come",                 swahili: "wamefika",                                 kikuyu: "Nĩmoka",                             category: "actions" },
];



/**
 * Kikuyu vowel guide:
 *   a  = like "arm"        (open back a)
 *   e  = like "egg"        (short e)
 *   i  = like "in"         (short i)
 *   o  = like "opposite"   (short o)
 *   u  = like "ululation"  (short u)
 *   í  = like "it"         (high tone i)
 *   ú  = like "own/oat"    (high tone rounded o — like 'o' in "own")
 *
 * Other rules:
 *   ũũ  → long stretchy "oo"
 *   ĩĩ  → long "ee"
 *   ci/ce → sh  (e.g. ciara → shiara)
 *   c + vowel → sh + vowel
 *   Rũ  → RO
 *   Nĩ  → emphasis prefix (kept as-is)
 *   -inĩ suffix → "o" (locative)
 */
export function phoneticConvert(text: string): string {
  return text
    .replace(/ũũ/g, "oo")              // double ũũ → long stretchy "oo"
    .replace(/ĩĩ/g, "ee")              // double ĩĩ → long "ee"
    .replace(/ĩ/g, "i")
    .replace(/ũ/g, "u")
    .replace(/ú/g, "o")                // ú = "own/oat" → render as o
    .replace(/í/g, "i")                // í = "it" → short i
    .replace(/th/g, "dh")
    .replace(/ng'/g, "ng")
    .replace(/\bci/g, "shi")           // ci at word start → shi
    .replace(/ci/g, "shi")             // ci anywhere → shi
    .replace(/\bc([aeiou])/g, "sh$1")  // c + vowel → sh + vowel
    .replace(/mw/g, "mwe")
    .replace(/ny/g, "ni")
    .replace(/\binĩ\b/g, "o")          // locative -inĩ suffix → "o"
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



