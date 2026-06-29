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
