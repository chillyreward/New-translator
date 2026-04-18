import Link from "next/link";
import { ArrowRight, Globe2, Sparkles, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 md:pt-36 md:pb-48 overflow-hidden px-4">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-primary-300 rounded-full blur-3xl opacity-20"></div>
          
          <div className="container mx-auto text-center relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 backdrop-blur-md shadow-sm mb-8 text-sm font-medium text-slate-800">
              <Sparkles size={16} className="text-primary-500" />
              <span>Next generation translation engine is here</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-slate-900 tracking-tight leading-tight mb-6">
              Understand the world, <br className="hidden md:block"/>
              <span className="text-gradient">seamlessly.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Professional-grade translations powered by advanced AI. Connect cultures, expand your business, and communicate with absolute clarity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/translate">
                <Button size="lg" className="w-full sm:w-auto gap-2 group shadow-xl shadow-primary-500/20">
                  Start Translating
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn how it works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Translation Preview Mock */}
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-20">
            <div className="max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-3xl border border-white/40 shadow-2xl overflow-hidden">
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
                {/* Mock UI Header */}
                <div className="h-12 bg-white flex items-center px-4 border-b border-slate-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  </div>
                </div>
                {/* Mock UI Content */}
                <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8 md:gap-12 relative">
                  <div className="hidden md:block w-px bg-slate-200 absolute left-1/2 top-12 bottom-12"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">English</div>
                    <p className="text-2xl text-slate-800 font-serif leading-relaxed">"The limits of my language mean the limits of my world."</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-primary-500 mb-2 uppercase tracking-wide">Spanish</div>
                    <p className="text-2xl text-primary-600 font-serif leading-relaxed">"Los límites de mi lenguaje significan los límites de mi mundo."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-4">How Tafsiri works</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Three simple steps to break down language barriers instantly.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6 text-primary-600 group-hover:-translate-y-2 transition-all duration-300">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Input Text</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Type, paste or speak your text into our incredibly fast and responsive interface.</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6 text-primary-600 group-hover:-translate-y-2 transition-all duration-300">
                  <Globe2 size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Select Language</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Choose from over 100 fully supported languages with natural-sounding pronunciation.</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6 text-primary-600 group-hover:-translate-y-2 transition-all duration-300">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Get Results</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Instantly receive context-aware, highly accurate translations ready to be shared or saved.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
