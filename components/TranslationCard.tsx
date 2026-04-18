"use client";

import { useState } from "react";
import { Mic, Copy, Share2, Bookmark, ArrowRightLeft, Volume2, History } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";

export function TranslationCard() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const handleTranslate = () => {
    // Mock translation
    if (sourceText) {
      setTranslatedText("This is a mock translation demonstrating the UI functionality. It looks premium and production-ready.");
    } else {
      setTranslatedText("");
    }
  };

  return (
    <Card className="overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Source Text Area */}
        <div className="flex-1 p-6 relative flex flex-col group">
          <div className="flex items-center justify-between mb-4">
            <select className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-0">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <textarea
            className="w-full flex-1 resize-none bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-lg md:text-xl min-h-[160px]"
            placeholder="Type or paste text here..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                <Mic size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                <Volume2 size={20} />
              </Button>
            </div>
            <p className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {sourceText.length} / 5000
            </p>
          </div>
        </div>

        {/* Center Switch Button (desktop only) */}
        <div className="hidden md:flex absolute left-1/2 top-14 -translate-x-1/2 -translate-y-1/2 z-10">
          <button className="bg-white border border-slate-200 text-slate-400 hover:text-primary-600 shadow-sm rounded-full p-2 transition-all hover:scale-110 hover:shadow-md">
            <ArrowRightLeft size={16} />
          </button>
        </div>

        {/* Translation Area */}
        <div className="flex-1 p-6 bg-slate-50/50 relative flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <select className="bg-transparent text-sm font-medium text-primary-600 outline-none cursor-pointer focus:ring-0">
              <option>Spanish</option>
              <option>English</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div className="flex-1 text-lg md:text-xl text-slate-800 min-h-[160px]">
            {translatedText ? (
              <p>{translatedText}</p>
            ) : (
              <p className="text-slate-400 italic">Translation will appear here...</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                <Volume2 size={20} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600">
                <History size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600">
                <Bookmark size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600">
                <Share2 size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600">
                <Copy size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="p-4 border-t border-slate-100 bg-white/50 flex justify-end">
        <Button onClick={handleTranslate} className="px-8 shadow-lg shadow-primary-500/20">
          Translate
        </Button>
      </div>
    </Card>
  );
}
