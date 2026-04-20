"use client";

import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Languages, History, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const { profile } = useStore();

  const recentTranslations = [
    { id: 1, source: "English", target: "Gikuyu", text: "How are you today?", date: "2 hours ago" },
  ];

  const phrasebook = [
    { id: 1, text: "Where is the train station?", translation: "Kîtesheni kîa mûtambo wa kîrî nî kû?" },
    { id: 2, text: "I would like a coffee, please.", translation: "Nîngwenda kahûa, thaitî." },
    { id: 3, text: "How much does this cost?", translation: "Gîthani gîkî nî mbeca thigana?" },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar />

      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Desktop Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md items-center justify-between px-8 sticky top-0 z-10 hidden md:flex transition-colors">
          <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-white">Dashboard</h1>
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full space-y-6 md:space-y-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-slate-900 dark:text-white mb-2 transition-colors">
                Welcome back, {profile.name.split(" ")[0]} 👋
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base transition-colors">
                Here's an overview of your recent translation activities.
              </p>
            </div>
            <Link href="/translate" className="w-full md:w-auto">
              <Button className="w-full md:w-auto shadow-lg shadow-primary-500/20 py-6 md:py-2">
                New Translation
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <Card className="p-6 border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Languages size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Words Translated</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">0</h3>
              </div>
            </Card>
            <Card className="p-6 border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-primary-900/20 text-purple-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <History size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Total Requests</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">0</h3>
              </div>
            </Card>
            <Card className="p-6 border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Star size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Saved Phrases</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">0</h3>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Recent Translations */}
            <Card className="lg:col-span-2 p-0 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col bg-white dark:bg-slate-950">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950/50">
                <h3 className="font-bold text-slate-900 dark:text-white">Recent Translations</h3>
                <Link href="/history" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 group">
                  View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Languages</th>
                      <th className="px-6 py-4">Source Text</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTranslations.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-200">{item.source}</span>
                            <ArrowRight size={12} className="text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-slate-200">{item.target}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 dark:text-slate-400 truncate block max-w-xs">{item.text}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 dark:text-slate-500 text-xs">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Phrasebook */}
            <Card className="p-0 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col bg-white dark:bg-slate-950">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Star size={16} className="text-amber-500" /> Phrasebook
                </h3>
              </div>
              <div className="p-4 space-y-2 flex-1 overflow-auto max-h-[400px]">
                {phrasebook.map((phrase) => (
                  <div key={phrase.id} className="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">{phrase.text}</p>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{phrase.translation}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50">
                <Button variant="outline" className="w-full font-bold">Open Phrasebook</Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
