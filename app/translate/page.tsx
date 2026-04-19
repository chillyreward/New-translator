"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { TranslationCard } from "@/components/TranslationCard";
import { Zap } from "lucide-react";

export default function TranslatePage() {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Navbar */}
        <div className="md:hidden sticky top-0 z-50">
          <Navbar />
        </div>

        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none transition-colors"></div>

        {/* Desktop Header */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20 hidden md:flex transition-colors">
          <h1 className="text-lg font-semibold font-serif text-slate-800 dark:text-white">Translate</h1>
        </header>

        {/* Translation Studio Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col justify-center relative z-10">
          <div className="max-w-5xl mx-auto w-full">
            <TranslationCard />
          </div>
        </div>

      </main>
    </div>
  );
}

