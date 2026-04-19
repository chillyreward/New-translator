"use client";

import { useState } from "react";
import { Mic, Copy, Share2, Bookmark, ArrowRightLeft, Volume2, History, ChevronDown } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TARGET_LANGUAGES = ["Gikuyu"];
const SOURCE_LANGUAGES = ["Auto-detect", "English", "Kiswahili"];

export function TranslationCard() {
  const { preferences, addSavedPhrase } = useStore();
  const [sourceLang, setSourceLang] = useState("Auto-detect");
  const targetLang = "Gikuyu"; // Locked Target Language
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
    // Cannot swap since target is locked to Gikuyu and source allowed are English/Kiswahili.
    // If the user wants to translate Gikuyu to English, it's not supported per the product spec.
    // We can swap if they type Gikuyu and want to translate to English, but product spec says:
    // "target language: Gikuyu only. This is not a multi-directional general translator."
    // So swapping should be disabled.
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
    <Card className="overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 relative">
        
        {/* Source Text Area */}
        <div className="flex-1 p-5 md:p-8 relative flex flex-col group transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="relative group/select">
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-slate-100/50 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-2 rounded-full outline-none cursor-pointer appearance-none border border-transparent focus:border-primary-500/50 transition-all uppercase tracking-widest"
              >
                {SOURCE_LANGUAGES.map(lang => (
                  <option key={lang} value={lang} className="bg-white dark:bg-slate-900">{lang}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-primary-500 transition-colors" />
            </div>
          </div>
          <textarea
            className="w-full flex-1 resize-none bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 text-xl md:text-2xl min-h-[180px] font-serif leading-relaxed selection:bg-primary-500/30 transition-colors"
            placeholder="Type or paste text here..."
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value);
              setIsSaved(false);
            }}
          />
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1 md:gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                <Mic size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                <Volume2 size={20} />
              </Button>
            </div>
            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {sourceText.length} / 5000 characters
            </p>
          </div>
        </div>

        {/* Swap Button - Disabled visually or removed since target is locked */}
        <div className="absolute left-1/2 top-[50%] md:top-14 -translate-x-1/2 -translate-y-1/2 z-20 md:flex">
          <button 
            disabled
            className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 shadow-sm rounded-full p-3 cursor-not-allowed"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* Translation Area */}
        <div className="flex-1 p-5 md:p-8 bg-slate-50/30 dark:bg-slate-950/30 relative flex flex-col group/result transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="relative inline-flex items-center">
              <div className="bg-primary-50/50 dark:bg-primary-900/20 text-xs font-bold text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full border border-primary-100 dark:border-primary-800/50 uppercase tracking-widest flex items-center gap-2">
                Translating into: {targetLang}
              </div>
            </div>
          </div>
          <div className="flex-1 text-xl md:text-2xl text-slate-900 dark:text-white min-h-[180px] font-serif leading-relaxed transition-colors">
            {translatedText ? (
              <p className="animate-in fade-in duration-500">{translatedText}</p>
            ) : (
              <div className="text-slate-300 dark:text-slate-700 transition-colors">
                <span className="font-medium text-slate-400 dark:text-slate-600">Wĩ mwega?</span>
                <span className="block text-sm mt-1">How are you?</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1 md:gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                <Volume2 size={20} />
              </Button>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all">
                <History size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSave}
                className={cn(
                  "rounded-xl h-10 w-10 transition-all",
                  isSaved ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shadow-none hover:shadow-sm"
                )}
              >
                <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all">
                <Share2 size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => translatedText && navigator.clipboard.writeText(translatedText)}
                className="rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="p-5 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-end gap-4 transition-colors">
        <Button onClick={handleTranslate} className="w-full sm:w-auto px-10 h-12 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary-500/20 dark:shadow-primary-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Translate
        </Button>
      </div>
    </Card>
  );
}

