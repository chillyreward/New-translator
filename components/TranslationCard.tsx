"use client";

import { useState } from "react";
import { Mic, Copy, Share2, Bookmark, ArrowRightLeft, Volume2, History } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TARGET_LANGUAGES = ["Gikuyu", "English", "Kiswahili"];

export function TranslationCard() {
  const { preferences, addSavedPhrase } = useStore();
  const [sourceLang, setSourceLang] = useState("Auto-detect");
  const [targetLang, setTargetLang] = useState(preferences.defaultTargetLanguage || "Gikuyu");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleTranslate = () => {
    if (sourceText) {
      setTranslatedText("This is a mock translation demonstrating the UI functionality. It looks premium and production-ready.");
      setIsSaved(false);
    } else {
      setTranslatedText("");
    }
  };

  const handleSwap = () => {
    // Only swap if source is one of the allowed targets
    if (TARGET_LANGUAGES.includes(sourceLang)) {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    if (!translatedText || isSaved) return;
    addSavedPhrase({
      sourceText,
      translatedText,
      sourceLang,
      targetLang
    });
    setIsSaved(true);
  };

  return (
    <Card className="overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/40 dark:border-slate-800/60 shadow-xl transition-colors">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        
        {/* Source Text Area */}
        <div className="flex-1 p-6 relative flex flex-col group">
          <div className="flex items-center justify-between mb-4">
            <select 
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:ring-0 appearance-none"
            >
              <option>Auto-detect</option>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Kiswahili</option>
              <option>Gikuyu</option>
            </select>
          </div>
          <textarea
            className="w-full flex-1 resize-none bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-lg md:text-xl min-h-[160px]"
            placeholder="Type or paste text here..."
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value);
              setIsSaved(false);
            }}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                <Mic size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                <Volume2 size={20} />
              </Button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {sourceText.length} / 5000
            </p>
          </div>
        </div>

        {/* Center Switch Button */}
        {TARGET_LANGUAGES.includes(sourceLang) && (
          <div className="hidden md:flex absolute left-1/2 top-14 -translate-x-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={handleSwap}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm rounded-full p-2 transition-all hover:scale-110 hover:shadow-md"
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>
        )}

        {/* Translation Area */}
        <div className="flex-1 p-6 bg-slate-50/50 dark:bg-slate-950/50 relative flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-sm font-medium text-primary-600 dark:text-primary-400 outline-none cursor-pointer focus:ring-0 appearance-none"
            >
              {TARGET_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 text-lg md:text-xl text-slate-800 dark:text-slate-100 min-h-[160px]">
            {translatedText ? (
              <p>{translatedText}</p>
            ) : (
              <p className="text-slate-400 dark:text-slate-600 italic">Translation will appear here...</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                <Volume2 size={20} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <History size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSave}
                className={cn(
                  "rounded-full transition-colors",
                  isSaved ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <Share2 size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigator.clipboard.writeText(translatedText)}
                className="rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex justify-end">
        <Button onClick={handleTranslate} className="px-8 shadow-lg shadow-primary-500/20 dark:shadow-primary-900/20 transition-all">
          Translate to {targetLang}
        </Button>
      </div>
    </Card>
  );
}
