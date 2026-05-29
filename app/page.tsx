import Link from "next/link";
import { ArrowRight, Globe2, Sparkles, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { APP_NAME } from "@/lib/constants";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VoiceBubble } from "@/components/VoiceBubble";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors selection:bg-primary-500 selection:text-white">
      {/* Desktop nav */}
      <Navbar />
      {/* Mobile header */}
      <MobileHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-36 md:pb-48 overflow-hidden px-4">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light dark:mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl opacity-20 transition-colors"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary-300 dark:bg-blue-900 rounded-full blur-3xl opacity-20 transition-colors"></div>
          
          <div className="container mx-auto text-center relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-sm mb-8 text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors">
              <Sparkles size={16} className="text-primary-500" />
              <span>Next generation translation engine is here</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold font-serif text-slate-900 dark:text-white tracking-tight leading-tight mb-6 transition-colors">
              The first AI translator <br className="hidden md:block"/>
              <span className="text-gradient">built for Gikuyu.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed transition-colors">
              Translate English and Kiswahili into Gikuyu instantly. Designed for learners, families, and communities preserving our language.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/translate" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 group shadow-xl shadow-primary-500/20">
                  Start Translating
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Learn how it works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Translation Preview Mock */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50 relative border-y border-slate-100 dark:border-slate-800 transition-colors">
          <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-20">
            <div className="max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-800/40 dark:to-slate-900/10 backdrop-blur-3xl border border-white/40 dark:border-slate-700/40 shadow-2xl overflow-hidden transition-colors">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-inner transition-colors">
                {/* Mock UI Header */}
                <div className="h-12 bg-slate-50 dark:bg-slate-950 flex items-center px-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/20"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/20"></div>
                  </div>
                </div>
                {/* Mock UI Content */}
                <div className="p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
                  <div className="hidden md:block w-px bg-slate-100 dark:bg-slate-800 absolute left-1/2 top-12 bottom-12 transition-colors"></div>
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 transition-colors uppercase tracking-wider">English</div>
                    <p className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 font-serif leading-relaxed transition-colors">"The limits of my language mean the limits of my world."</p>
                  </div>
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary-100 dark:bg-primary-900/40 text-[10px] font-bold text-primary-600 dark:text-primary-400 transition-colors uppercase tracking-wider">Gikuyu</div>
                    <p className="text-xl md:text-2xl text-primary-600 dark:text-primary-400 font-serif leading-relaxed transition-colors">"Mîhaka ya rûthiomi rûakwa nîyo mîhaka ya thî îno yakwa."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 mt-16 text-center">
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Built to make Gikuyu more accessible</p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white dark:bg-slate-950 transition-colors">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white mb-4 transition-colors">How {APP_NAME} works</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto transition-colors">Three simple steps to break down language barriers instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
              <div className="text-center group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-6 text-primary-600 dark:text-primary-400 group-hover:-translate-y-2 transition-all duration-300 shadow-sm">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 transition-colors">1. Input Text</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">Type, paste or speak your text into our incredibly fast and responsive interface.</p>
              </div>
              <div className="text-center group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-6 text-primary-600 dark:text-primary-400 group-hover:-translate-y-2 transition-all duration-300 shadow-sm">
                  <Globe2 size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 transition-colors">2. Select Language</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">Translate instantly from English and Kiswahili into Gikuyu with natural-sounding context.</p>
              </div>
              <div className="text-center group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-6 text-primary-600 dark:text-primary-400 group-hover:-translate-y-2 transition-all duration-300 shadow-sm">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 transition-colors">3. Get Results</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">Instantly receive context-aware, highly accurate translations ready to be shared or saved.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer hidden on mobile – bottom nav provides nav instead */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile bottom padding spacer */}
      <div className="md:hidden h-20" />

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      {/* Floating voice bubble */}
      <VoiceBubble />
    </div>
  );
}
