import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/Card";
import { Globe2, Users, BookOpen } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Story Section */}
        <section className="pt-20 md:pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white mb-6">Our Story</h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Founded on the belief that communication should never be a barrier, {APP_NAME} was built to bridge the gap between Gikuyu and the world. 
              We started as a small team of linguists and engineers dedicated to preserving the richness of local languages through state-of-the-art neural machine translation.
            </p>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Today, {APP_NAME} powers thousands of conversations daily, maintaining nuance and cultural fidelity in every word translated.
            </p>
          </div>
        </section>

        {/* Value Cards */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors border-y border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6">
                  <Globe2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Preserve</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  We are deeply committed to maintaining the nuances, idioms, and rich cultural context inherent in every dialect we support.
                </p>
              </Card>

              <Card className="p-8 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Connect</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  By breaking down language walls, we empower people, businesses, and communities to forge truly global connections.
                </p>
              </Card>

              <Card className="p-8 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Educate</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {APP_NAME} acts as a bridge for infinite learning, allowing students and professionals to unlock knowledge from across the globe.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-slate-900"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center md:divide-x md:divide-slate-800">
              <div className="p-4">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 font-serif">100+</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Languages</div>
              </div>
              <div className="p-4">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 font-serif">2M+</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Translations Daily</div>
              </div>
              <div className="p-4">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 font-serif">99%</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Uptime Record</div>
              </div>
              <div className="p-4">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 font-serif">50k</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Active Users</div>
              </div>
            </div>
          </div>
        </section>

        {/* Illustration Section */}
        <section className="py-24 bg-white dark:bg-slate-950 transition-colors">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-12 sm:gap-16">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-6">Designed for scale and simplicity</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  While our backend runs powerful translation engines capable of processing immense amounts of text in milliseconds, our frontend remains exceptionally clean and user-friendly. 
                </p>
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-center md:justify-start gap-3 text-primary-600 dark:text-primary-400 font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                     Premium responsive interfaces
                   </div>
                   <div className="flex items-center justify-center md:justify-start gap-3 text-primary-600 dark:text-primary-400 font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                     Frictionless micro-interactions
                   </div>
                </div>
              </div>
              <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 relative overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner min-h-[300px]">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-gradient-to-tr from-primary-200 dark:from-primary-900 to-transparent rounded-full blur-3xl opacity-30"></div>
                 <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-48 md:w-64 h-36 md:h-48 border border-white dark:border-slate-800 p-6 rotate-3 transition-colors">
                   <div className="w-3/4 h-2 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
                   <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                   <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                   <div className="w-1/2 h-2 bg-slate-100 dark:bg-slate-800 rounded mb-8"></div>
                   <div className="w-1/3 h-6 bg-primary-100 dark:bg-primary-900/40 rounded-lg ml-auto"></div>
                 </div>
                 <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-48 md:w-64 h-36 md:h-48 border border-white dark:border-slate-800 p-6 absolute -bottom-8 -left-4 -rotate-6 transition-colors">
                   <div className="w-3/4 h-2 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
                   <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                   <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

