"use client";

import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Search, Copy, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function SavedPhrasesPage() {
  const { savedPhrases, removeSavedPhrase } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhrases = savedPhrases.filter(
    (p) =>
      p.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-slate-50 tracking-tight">Saved Phrases</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your personal collection of important translations.</p>
              </div>
              
              <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search phrases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-primary-500 disabled:opacity-50 transition-colors"
                />
              </div>
            </div>

            {filteredPhrases.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Bookmark size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-2">No saved phrases found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  {searchQuery 
                    ? "We couldn't find any phrases matching your search. Try different keywords."
                    : "You haven't saved any phrases yet. Star translations to save them for later."}
                </p>
                {!searchQuery && (
                  <Button onClick={() => window.location.href = '/translate'}>
                    Translate something now
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPhrases.map((phrase) => (
                  <div key={phrase.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{phrase.sourceLang}</span>
                      <ArrowRight size={12} />
                      <span className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-1 rounded-md">{phrase.targetLang}</span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">"{phrase.sourceText}"</p>
                      <p className="text-lg font-medium text-slate-900 dark:text-slate-50 line-clamp-3">{phrase.translatedText}</p>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                        title="Copy translation"
                        onClick={() => navigator.clipboard.writeText(phrase.translatedText)}
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                        title="Remove"
                        onClick={() => removeSavedPhrase(phrase.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-400 absolute bottom-5 left-5">
                      {new Date(phrase.dateSaved).toLocaleDateString()}
                    </p>
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

// Missing icon import for empty state
import { Bookmark } from "lucide-react";
