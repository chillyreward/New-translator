import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Search, Filter, Copy, Bookmark, MoreHorizontal, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const historyData = [
    { id: 1, sourceLang: "English", targetLang: "Spanish", sourceText: "The package will arrive tomorrow morning.", targetText: "El paquete llegará mañana por la mañana.", date: "Today, 10:45 AM", type: "Text" },
    { id: 2, sourceLang: "French", targetLang: "English", sourceText: "C'est un excellent restaurant.", targetText: "This is an excellent restaurant.", date: "Yesterday", type: "Speech" },
    { id: 3, sourceLang: "English", targetLang: "German", sourceText: "Please sign the contract and send it back.", targetText: "Bitte unterschreiben Sie den Vertrag und senden Sie ihn zurück.", date: "Oct 12, 2025", type: "Text" },
    { id: 4, sourceLang: "Spanish", targetLang: "English", sourceText: "¿Dónde está la biblioteca más cercana?", targetText: "Where is the nearest library?", date: "Oct 10, 2025", type: "Text" },
    { id: 5, sourceLang: "English", targetLang: "Japanese", sourceText: "Thank you for your hard work.", targetText: "お疲れ様でした。", date: "Oct 08, 2025", type: "Speech" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold font-serif text-slate-800">Translation History</h1>
        </header>

        {/* Filters Area */}
        <div className="bg-white border-b border-slate-100 p-4 shrink-0 shadow-sm z-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
            
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10 h-10 w-full" placeholder="Search in your history..." />
            </div>

            {/* Filters */}
            <div className="flex gap-3 w-full sm:w-auto">
              <select className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer min-w-[120px]">
                <option>All Languages</option>
                <option>English to Spanish</option>
                <option>French to English</option>
              </select>
              <select className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer">
                <option>Any Type</option>
                <option>Text</option>
                <option>Speech</option>
              </select>
              <Button variant="outline" size="sm" className="h-10 gap-2 font-medium">
                <Filter size={16} /> Filters
              </Button>
            </div>
            
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-4">
            
            {historyData.map((item) => (
              <Card key={item.id} className="p-5 border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-all group bg-white relative">
                
                {/* Meta details */}
                <div className="sm:w-48 shrink-0 flex flex-col justify-between border-r border-slate-100 pr-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{item.type}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5 flex-wrap">
                      {item.sourceLang} <ArrowRight size={14} className="text-slate-400" /> {item.targetLang}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-400 mt-4 sm:mt-0">
                    {item.date}
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 grid md:grid-cols-2 gap-4 md:gap-8">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Source</p>
                    <p className="text-slate-900 text-sm leading-relaxed">{item.sourceText}</p>
                  </div>
                  <div>
                     <p className="text-sm text-primary-500 mb-1 font-medium">Translation</p>
                    <p className="text-primary-900 text-sm leading-relaxed">{item.targetText}</p>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-4 right-4 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-100 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <Copy size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-500">
                    <Bookmark size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                     <MoreHorizontal size={16} />
                  </Button>
                </div>

              </Card>
            ))}

            {/* Pagination Mock */}
            <div className="flex justify-center pt-8 pb-4">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="bg-slate-100 pointer-events-none text-slate-900">1</Button>
                <Button variant="ghost" size="sm" className="text-slate-500">2</Button>
                <Button variant="ghost" size="sm" className="text-slate-500">3</Button>
                <span className="px-2 text-slate-400">...</span>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
