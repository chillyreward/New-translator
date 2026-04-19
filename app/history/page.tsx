"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Clock, Check, Search, Filter, ArrowRight, Copy, Bookmark, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const historyData = [
    { id: 1, sourceLang: "English", targetLang: "Gikuyu", sourceText: "The package will arrive tomorrow morning.", targetText: "Mûtîgo nîûgoka rûciû rûciinî.", date: "Today, 10:45 AM", type: "Text" },
    { id: 2, sourceLang: "Gikuyu", targetLang: "English", sourceText: "Nî wega mûno nî kûng'ethera.", targetText: "Thank you very much for waiting for me.", date: "Yesterday", type: "Speech" },
    { id: 3, sourceLang: "English", targetLang: "Gikuyu", sourceText: "Please sign the contract and send it back.", targetText: "Thaitî tîîrīna mbūri îno na ûmîcookie.", date: "Oct 12, 2025", type: "Text" },
    { id: 4, sourceLang: "Gikuyu", targetLang: "English", sourceText: "Nyumba ya mûthigari îrî kû?", targetText: "Where is the chief's house?", date: "Oct 10, 2025", type: "Text" },
    { id: 5, sourceLang: "English", targetLang: "Gikuyu", sourceText: "Thank you for your hard work.", targetText: "Wîra mwega nî ûthaka.", date: "Oct 08, 2025", type: "Speech" },
  ];

  const filteredHistory = historyData.filter(item => 
    item.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.targetText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navbar */}
        <div className="md:hidden sticky top-0 z-50">
          <Navbar />
        </div>
        
        {/* Desktop Header */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-8 shrink-0 hidden md:flex transition-colors">
          <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">History</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <Clock size={14} /> 248 Total Translations
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Filters Area */}
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 shrink-0 transition-colors">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                className="pl-10 h-11 w-full dark:bg-slate-900 dark:border-slate-800" 
                placeholder="Search in history..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <select className="flex-1 lg:flex-initial h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer transition-all uppercase tracking-widest">
                <option>All Languages</option>
                <option>English to Gikuyu</option>
                <option>Kiswahili to Gikuyu</option>
              </select>
              <select className="flex-1 lg:flex-initial h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer transition-all uppercase tracking-widest">
                <option>Any Type</option>
                <option>Text</option>
                <option>Speech</option>
              </select>
              <Button variant="outline" className="h-11 gap-2 font-bold text-xs uppercase tracking-widest px-6 border-slate-200 dark:border-slate-800">
                <Filter size={16} /> Filters
              </Button>
            </div>
            
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-4">
            
            {filteredHistory.map((item) => (
              <Card key={item.id} className="p-6 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all group bg-white dark:bg-slate-900/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Meta details */}
                <div className="md:w-44 shrink-0 flex flex-col justify-between border-slate-100 dark:border-slate-800 pr-0 md:pr-6 md:border-r transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-2 py-1 rounded-md">{item.type}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2 flex-wrap">
                      {item.sourceLang} <ArrowRight size={12} className="text-slate-400" /> {item.targetLang}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-4 md:mt-0 uppercase tracking-widest">
                    {item.date}
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Source</p>
                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed font-serif">{item.sourceText}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-primary-500/70 dark:text-primary-400/70 uppercase tracking-widest">Translation</p>
                    <p className="text-slate-900 dark:text-white text-base leading-relaxed font-serif font-medium">{item.targetText}</p>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleCopy(item.id, item.targetText)}
                    className="h-9 w-9 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 border-slate-100 dark:border-slate-800 shadow-sm rounded-xl transition-colors"
                    title="Copy translation"
                  >
                    {copiedId === item.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-amber-500 border-slate-100 dark:border-slate-800 shadow-sm rounded-xl">
                    <Bookmark size={16} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border-slate-100 dark:border-slate-800 shadow-sm rounded-xl">
                     <MoreHorizontal size={16} />
                  </Button>
                </div>

              </Card>
            ))}

            {/* Pagination Mock */}
            <div className="flex justify-center pt-12 pb-6">
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest" disabled>Prev</Button>
                <Button size="sm" className="h-9 w-9 bg-white dark:bg-slate-800 text-primary-600 dark:text-white shadow-md border-none rounded-xl text-xs font-bold">1</Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold">2</Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold">3</Button>
                <span className="px-2 text-slate-300 dark:text-slate-700">•••</span>
                <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest">Next</Button>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

