import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/Card";
import { Globe2, Users, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Story Section */}
        <section className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-6">Our Story</h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Founded on the belief that communication should never be a barrier, Tafsiri was built to connect the world. 
              We started as a small team of linguists and engineers who saw the potential of advanced technology to accurately bridge the gap between distinct languages and cultures.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Today, Tafsiri powers thousands of conversations, maintaining nuance and cultural fidelity in every translation.
            </p>
          </div>
        </section>

        {/* Value Cards */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 border-slate-100 shadow-xl shadow-slate-200/20 text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-6">
                  <Globe2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Preserve</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We are deeply committed to maintaining the nuances, idioms, and rich cultural context inherent in every dialect we support.
                </p>
              </Card>

              <Card className="p-8 border-slate-100 shadow-xl shadow-slate-200/20 text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-6">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Connect</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  By breaking down language walls, we empower people, businesses, and communities to forge truly global connections.
                </p>
              </Card>

              <Card className="p-8 border-slate-100 shadow-xl shadow-slate-200/20 text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Educate</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tafsiri acts as a bridge for infinite learning, allowing students and professionals to unlock knowledge from across the globe.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center divide-x divide-slate-800">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-serif">100+</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Languages</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-serif">2M+</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Translations Daily</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-serif">99%</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Uptime Record</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-serif">50k</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Active Users</div>
              </div>
            </div>
          </div>
        </section>

        {/* Illustration Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-3xl font-bold font-serif text-slate-900 mb-6">Designed for scale and simplicity</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  While our backend runs powerful translation engines capable of processing immense amounts of text in milliseconds, our frontend remains exceptionally clean and user-friendly. 
                </p>
                <div className="flex items-center gap-3 text-primary-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                  Premium responsive interfaces
                </div>
                <div className="flex items-center gap-3 text-primary-600 font-medium mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                  Frictionless micro-interactions
                </div>
              </div>
              <div className="flex-1 w-full bg-slate-50 rounded-3xl p-8 relative overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner min-h-[300px]">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-primary-200 to-transparent rounded-full blur-3xl opacity-30"></div>
                 <div className="relative bg-white rounded-2xl shadow-xl w-64 h-48 border border-white p-6 rotate-3">
                   <div className="w-3/4 h-2 bg-slate-100 rounded mb-4"></div>
                   <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                   <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                   <div className="w-1/2 h-2 bg-slate-100 rounded mb-8"></div>
                   
                   <div className="w-1/3 h-6 bg-primary-100 rounded-lg ml-auto"></div>
                 </div>
                 <div className="relative bg-white rounded-2xl shadow-xl w-64 h-48 border border-white p-6 absolute -bottom-8 -left-4 -rotate-6">
                   <div className="w-3/4 h-2 bg-slate-100 rounded mb-4"></div>
                   <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                   <div className="w-full h-2 bg-slate-100 rounded"></div>
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
