"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { TranslationCard } from "@/components/TranslationCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function TranslatePage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Desktop top nav (rendered inside <nav> which is already hidden on mobile) */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors" />
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none transition-colors" />

        {/* Desktop page header */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 relative z-20 hidden md:flex transition-colors">
          <h1 className="text-lg font-semibold font-serif text-slate-800 dark:text-white">Translate</h1>
          <ThemeToggle />
        </header>

        {/* Translation Studio */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col justify-center relative z-10 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto w-full">
            <TranslationCard />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
