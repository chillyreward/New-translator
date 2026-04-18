import { Sidebar } from "@/components/Sidebar";
import { TranslationCard } from "@/components/TranslationCard";
import { Zap } from "lucide-react";

export default function TranslatePage() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 border-b border-white/20 bg-transparent flex items-center justify-between px-4 md:px-8 shrink-0 relative z-10 z-20">
          <h1 className="text-xl font-semibold font-serif text-slate-800">Studio</h1>
          <div className="inline-flex items-center gap-2 bg-white/60 border border-slate-200/50 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
             <Zap size={14} className="text-amber-500" />
             <span className="text-xs font-medium text-slate-600">Pro Engine Active</span>
          </div>
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
