"use client";

import { Navbar } from "@/components/Navbar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { Film, Lock } from "lucide-react";

export default function DubPage() {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <div className="hidden md:block"><Navbar /></div>
        <MobileHeader />

        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto w-full">

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Film size={22} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Video Dubbing</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Automatically dub a video into Kikuyu using AI translation and voice synthesis.
              </p>
            </div>

            {/* Locked Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Top banner */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-950 dark:to-slate-900 px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
                  <Lock size={22} className="text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Feature Locked</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Video dubbing is currently unavailable</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
                  <Lock size={36} className="text-slate-400 dark:text-slate-500" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Dubbing is Locked
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
                  This feature has been temporarily disabled. Please contact the administrator to request access or enable this feature.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                  <Lock size={14} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    Access Restricted
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
