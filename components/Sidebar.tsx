"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Languages, Bookmark, Trash2, Volume2, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { name: "Translate", href: "/translate", icon: Languages },
  { name: "Speak",     href: "/speak",     icon: Volume2   },
  { name: "Dub Video", href: "/dub",       icon: Youtube   },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { savedPhrases, removeSavedPhrase } = useStore();

  const handlePhraseClick = (phrase: string) => {
    router.push(`/translate?q=${encodeURIComponent(phrase)}`);
  };

  const handleSpeak = async (text: string) => {
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        audio.play();
      }
    } catch { /* silent */ }
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden md:flex flex-col h-screen sticky top-0 transition-colors">
      {/* Logo */}
      <div className="p-6 shrink-0">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-sm">
            <Languages size={18} />
          </div>
          <span className="text-xl font-bold font-serif text-slate-900 dark:text-slate-50 tracking-tight">{APP_NAME}</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="px-4 py-2 space-y-1 shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-50"
              )}>
              <item.icon size={18} className={cn("transition-colors",
                isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Saved Phrases */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Saved Phrases</span>
          {savedPhrases.length > 0 && (
            <span className="w-4 h-4 text-[9px] font-bold bg-primary-500 text-white rounded-full flex items-center justify-center">
              {savedPhrases.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 min-h-0">
        <div className="pt-2 space-y-2">
          {savedPhrases.length === 0 ? (
            <div className="px-2 pt-4 text-center">
              <Bookmark size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-400 dark:text-slate-600 leading-relaxed">
                Tap the bookmark icon after translating to save phrases here.
              </p>
            </div>
          ) : (
            savedPhrases.map(phrase => (
              <div key={phrase.id}
                className="group px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all cursor-pointer"
                onClick={() => handlePhraseClick(phrase.sourceText)}
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-0.5">{phrase.sourceText}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white font-serif truncate">{phrase.translatedText}</p>
                <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); handleSpeak(phrase.translatedText); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    title="Play"
                  >
                    <Volume2 size={13} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); removeSavedPhrase(phrase.id); }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Theme toggle */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Appearance</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}


const navItems = [
  { name: "Translate", href: "/translate", icon: Languages },
  { name: "Speak",     href: "/speak",     icon: Volume2   },
  { name: "Dub Video", href: "/dub",       icon: Youtube   },
];

// Group audio library phrases by category label
const PHRASE_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Greetings", keys: ["hello", "hi", "how are you", "how are you today", "are you okay", "i am fine", "i am doing great", "good morning", "good afternoon", "good evening", "have a good day", "nice to meet you", "see you soon", "see you later", "see you tomorrow"] },
  { label: "Instructions", keys: ["come here", "come in", "come into the house", "come", "go away", "help me", "keep quiet", "quiet", "shut up", "stop laughing"] },
  { label: "Places & Location", keys: ["where are you", "where did you go", "where do you live", "where are you going", "where were you", "i went to the market for shopping", "i was in my room folding clothes"] },
  { label: "Food & Drink", keys: ["give me water", "water", "food", "i am hungry", "i am thirsty", "flour", "porridge", "milk", "oil", "how much"] },
  { label: "Family", keys: ["father", "mother", "friend", "enemy", "home"] },
  { label: "Love & Relationships", keys: ["i love you", "love you so much", "i love you with all my heart", "i love you too", "i like you", "you are beautiful", "you look beautiful", "my love", "my beautiful wife", "i miss you so much", "i need you", "i need your love", "i want to see you", "you will miss me", "you are mine", "i want some space", "goodbye my love", "i will marry you"] },
  { label: "Health & Feelings", keys: ["how are you feeling", "i am feeling dizzy", "i am happy", "i am hungry", "i am thirsty"] },
  { label: "Everyday Expressions", keys: ["happy birthday", "happy new year", "i am sorry", "you are welcome", "me too", "god bless you", "may god protect you", "please help me", "i don't know", "i don't understand", "i don't want", "it is okay", "no problem", "excuse me", "leave me alone", "be blessed", "feel at home", "rest in peace", "i am done", "i haven't seen you for ages", "great to see you again", "i really appreciate it", "you made my day", "god is good", "bad manners", "stop using your phone"] },
  { label: "Communication", keys: ["i will call you", "i will phone you", "thank you", "thank you so much"] },
  { label: "Body Parts", keys: ["hand", "face", "my face", "head", "eye", "eyes", "ear", "ears", "nose", "mouth", "my mouth", "neck", "shoulder", "shoulders", "chest", "stomach", "waist", "small waist", "palm", "elbow", "finger", "fingers", "leg", "legs", "thigh", "thighs", "knee", "ankle", "ankles", "heel", "cheeks", "forehead", "hair", "beards", "that girl has nice cheeks"] },
  { label: "Animals & Nature", keys: ["goat", "horse", "maize", "mouse", "mice"] },
  { label: "Culture", keys: ["kikuyu", "agikuyu"] },
  { label: "Actions", keys: ["reading", "writing", "speaking", "i will slap you", "i have come", "we have come", "you have come", "he has come", "they have come"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { savedPhrases, removeSavedPhrase } = useStore();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Greetings: true });
  const [activeTab, setActiveTab] = useState<"library" | "saved">("library");

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handlePhraseClick = (phrase: string) => {
    // Navigate to translate page with the phrase pre-filled via URL param
    router.push(`/translate?q=${encodeURIComponent(phrase)}`);
  };

  const handleSpeak = async (text: string) => {
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        audio.play();
      }
    } catch { /* silent */ }
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden md:flex flex-col h-screen sticky top-0 transition-colors">
      {/* Logo */}
      <div className="p-6 shrink-0">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-sm">
            <Languages size={18} />
          </div>
          <span className="text-xl font-bold font-serif text-slate-900 dark:text-slate-50 tracking-tight">{APP_NAME}</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="px-4 py-2 space-y-1 shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-50"
              )}>
              <item.icon size={18} className={cn("transition-colors",
                isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Tab switcher */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1">
          <button
            onClick={() => setActiveTab("library")}
            className={cn("flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all",
              activeTab === "library"
                ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            Phrase Library
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={cn("flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all relative",
              activeTab === "saved"
                ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            Saved
            {savedPhrases.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold bg-primary-500 text-white rounded-full flex items-center justify-center">
                {savedPhrases.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 min-h-0">

        {/* Phrase Library Tab */}
        {activeTab === "library" && (
          <div className="pt-2 space-y-1">
            {PHRASE_GROUPS.map(group => (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {group.label}
                  {openGroups[group.label]
                    ? <ChevronDown size={12} />
                    : <ChevronRight size={12} />
                  }
                </button>
                {openGroups[group.label] && (
                  <div className="space-y-0.5 mb-1">
                    {group.keys.map(phrase => (
                      <div key={phrase}
                        className="flex items-center px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                        onClick={() => handlePhraseClick(phrase)}
                      >
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 capitalize truncate">
                          {phrase}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Saved Phrases Tab */}
        {activeTab === "saved" && (
          <div className="pt-2 space-y-2">
            {savedPhrases.length === 0 ? (
              <div className="px-2 pt-4 text-center">
                <Bookmark size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-600 leading-relaxed">
                  Tap the bookmark icon after translating to save phrases here.
                </p>
              </div>
            ) : (
              savedPhrases.map(phrase => (
                <div key={phrase.id}
                  className="group px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all cursor-pointer"
                  onClick={() => handlePhraseClick(phrase.sourceText)}
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-0.5">{phrase.sourceText}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white font-serif truncate">{phrase.translatedText}</p>
                  <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); handleSpeak(phrase.translatedText); }}
                      className="p-1 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      title="Play"
                    >
                      <Volume2 size={13} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); removeSavedPhrase(phrase.id); }}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Theme toggle at bottom of sidebar */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Appearance</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
