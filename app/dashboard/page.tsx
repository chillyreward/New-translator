import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Languages, History, Star, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const recentTranslations = [
    { id: 1, source: "English", target: "Spanish", text: "Hello, how are you?", date: "2 hours ago" },
    { id: 2, source: "French", target: "English", text: "Ceci est un test.", date: "5 hours ago" },
    { id: 3, source: "Spanish", target: "German", text: "El gato duerme.", date: "1 day ago" }
  ];

  const phrasebook = [
    { id: 1, text: "Where is the train station?", translation: "¿Dónde está la estación de tren?" },
    { id: 2, text: "I would like a coffee, please.", translation: "Me gustaría un café, por favor." },
    { id: 3, text: "How much does this cost?", translation: "Combien ça coûte?" }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md flex items-center px-8 sticky top-0 z-10 hidden md:flex">
          <h1 className="text-xl font-semibold font-serif text-slate-800">Dashboard</h1>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mb-2">Welcome back, John 👋</h2>
              <p className="text-slate-500">Here's an overview of your recent translation activities.</p>
            </div>
            <Link href="/translate">
              <Button className="shadow-lg shadow-primary-500/20">New Translation</Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Languages size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Words Translated</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">45.2k</h3>
                  <span className="text-xs font-medium text-emerald-500 flex items-center"><TrendingUp size={12} className="mr-0.5" /> +12%</span>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <History size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Requests</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">1,248</h3>
                  <span className="text-xs font-medium text-emerald-500 flex items-center"><TrendingUp size={12} className="mr-0.5" /> +5%</span>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Saved Phrases</p>
                <h3 className="text-2xl font-bold text-slate-900">84</h3>
              </div>
            </Card>
            <Card className="p-6 border-slate-200 shadow-sm flex items-start flex-col justify-center bg-gradient-to-br from-primary-600 to-primary-800 text-white border-transparent relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <p className="text-sm font-medium text-primary-100 mb-2 z-10">Current Plan</p>
              <h3 className="text-2xl font-bold mb-4 z-10">Pro</h3>
              <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white border-white/20 hover:text-slate-900 z-10">
                Upgrade
              </Button>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Translations Table */}
            <Card className="lg:col-span-2 p-0 border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-semibold text-slate-900 content-center">Recent Translations</h3>
                <Link href="/history" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
                  View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 font-medium">Languages</th>
                      <th className="px-6 py-3 font-medium">Source Text</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTranslations.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{item.source}</span>
                            <ArrowRight size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-900">{item.target}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 truncate block max-w-xs">{item.text}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {item.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Phrasebook Section */}
            <Card className="p-0 border-slate-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Star size={16} className="text-amber-500" /> Phrasebook
                </h3>
              </div>
              <div className="p-2 space-y-1 bg-slate-50/50 flex-1">
                {phrasebook.map((phrase) => (
                  <div key={phrase.id} className="p-4 rounded-lg hover:bg-white transition-colors group cursor-pointer border border-transparent hover:border-slate-200 hover:shadow-sm">
                    <p className="text-sm font-medium text-slate-900 mb-1">{phrase.text}</p>
                    <p className="text-sm text-primary-600">{phrase.translation}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-white">
                <Button variant="outline" className="w-full">Open Phrasebook</Button>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
