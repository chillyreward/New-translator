"use client";

import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Search, Copy, Trash2, ArrowRight, Bookmark, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SavedPhrasesPage() {
  const { savedPhrases, removeSavedPhrase } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhrases = savedPhrases.filter(
    (p) =>
      p.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navbar */}
        <div className="md:hidden sticky top-0 z-50">
          <Navbar />
        </div>
        
        {/* Desktop Header */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-8 shrink-0 hidden md:flex transition-colors">
          <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Saved Phrases</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <Bookmark size={14} /> {savedPhrases.length} Items
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="md:animate-in md:fade-in md:slide-in-from-left-4 duration-500">
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">Your Phrasebook</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1">Your private collection of curated translations.</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search in phrases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {filteredPhrases.length === 0 ? (
              <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 md:p-20 text-center shadow-sm backdrop-blur-sm">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700 shadow-inner">
                  <Bookmark size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No phrases found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
                  {searchQuery 
                    ? "We couldn't find any phrases matching your search. Try different keywords."
                    : "You haven't saved any phrases to your phrasebook yet. Start by translating something!"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => window.location.href = '/translate'} className="px-8 h-12 font-bold uppercase tracking-widest text-xs">
                    Start Translating
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPhrases.map((phrase) => (
                  <div key={phrase.id} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex gap-2 z-10">
                      <button 
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 shadow-md border border-slate-100 dark:border-slate-700 transition-all"
                        title="Copy translation"
                        onClick={() => navigator.clipboard.writeText(phrase.translatedText)}
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-red-500 shadow-md border border-slate-100 dark:border-slate-700 transition-all"
                        title="Remove"
                        onClick={() => removeSavedPhrase(phrase.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4">
                      <span className="bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">{phrase.sourceLang}</span>
                      <ArrowRight size={12} />
                      <span className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-1 rounded-md">{phrase.targetLang}</span>
                    </div>
                    
                    <div className="space-y-4 mb-4">
                      <p className="text-sm text-slate-500 dark:text-slate-500 italic line-clamp-2">"{phrase.sourceText}"</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white font-serif line-clamp-3 leading-relaxed">{phrase.translatedText}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                       <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                        {new Date(phrase.dateSaved).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <LayoutGrid size={14} className="text-slate-100 dark:text-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

