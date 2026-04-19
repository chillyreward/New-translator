"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Mail, AlertCircle, MessageSquare, ChevronDown, Headset } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Which languages are supported?",
    answer: "We currently support translating English and Kiswahili into Gikuyu."
  },
  {
    question: "Can I translate audio files?",
    answer: "Currently, we only support live audio translation through the microphone. Audio file uploading may be supported in the future."
  },
  {
    question: "How accurate are the translations?",
    answer: "Our engine uses advanced neural machine translation fine-tuned specifically for Gikuyu, providing high accuracy for everyday phrases."
  },
  {
    question: "Do I need an account to translate?",
    answer: "You can try translations as a guest, but an account is required to save phrases to your Phrasebook."
  }
];

import { APP_NAME } from "@/lib/constants";

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const brandEmail = `support@${APP_NAME.toLowerCase().replace(/\s+/g, "")}.com`;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Support Hero */}
        <section className="pt-24 pb-20 px-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 relative z-10 transition-colors">
            <Headset size={14} className="text-primary-500" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white mb-6 relative z-10 transition-colors">How can we help?</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto relative z-10 transition-colors leading-relaxed">
            Browse our resources, check FAQs, or reach out to our team directly. We are committed to providing you with the best experience.
          </p>
        </section>

        {/* Support Cards */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-8 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer text-center bg-white dark:bg-slate-900/50">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Email Support</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Direct help from our team.</p>
                <div className="text-sm font-bold text-primary-600 dark:text-primary-400 group-hover:underline">{brandEmail}</div>
              </Card>

              <Card className="p-8 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer text-center bg-white dark:bg-slate-900/50">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <AlertCircle size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Report Error</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Did a translation fail?</p>
                <div className="text-sm font-bold text-red-600 dark:text-red-400 group-hover:underline">Submit Ticket</div>
              </Card>

              <Card className="p-8 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer text-center bg-white dark:bg-slate-900/50">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Feedback</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Help us improve the app.</p>
                <div className="text-sm font-bold text-primary-600 dark:text-primary-400 group-hover:underline">Share Feedback</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Content Section: FAQ & Form */}
        <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/50 transition-colors">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 md:gap-24">
              
              {/* FAQ Accordion */}
              <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "transition-all duration-300 rounded-2xl overflow-hidden border",
                        openFaq === index 
                          ? "border-primary-500/30 bg-white dark:bg-slate-900 shadow-xl shadow-primary-500/5" 
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                    >
                      <button 
                        className="w-full text-left px-6 py-6 flex items-center justify-between group"
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      >
                        <span className={cn(
                          "font-bold text-sm md:text-base transition-colors",
                          openFaq === index ? "text-primary-600 dark:text-primary-400" : "text-slate-900 dark:text-white"
                        )}>{faq.question}</span>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                          openFaq === index ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                        )}>
                          <ChevronDown 
                            size={18} 
                            className={cn(
                              "transition-transform duration-500",
                              openFaq === index ? "rotate-180" : ""
                            )} 
                          />
                        </div>
                      </button>
                      <div 
                        className={cn(
                          "px-6 overflow-hidden transition-all duration-500 ease-in-out",
                          openFaq === index ? "max-h-80 pb-6 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <Card className="p-8 md:p-10 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/80 backdrop-blur-xl">
                  <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-2">Send a Message</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Have a specific question? Fill out the form below and we'll reply shortly.</p>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">First Name</label>
                        <Input placeholder="John" className="h-12 rounded-xl dark:bg-slate-950 dark:border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">Last Name</label>
                        <Input placeholder="Doe" className="h-12 rounded-xl dark:bg-slate-950 dark:border-slate-800" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">Email Address</label>
                      <Input type="email" placeholder="john@example.com" className="h-12 rounded-xl dark:bg-slate-950 dark:border-slate-800" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">Message</label>
                      <textarea 
                        className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all shadow-sm min-h-[140px] resize-none"
                        placeholder="How can we help?"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20">
                      Send Message
                    </Button>
                  </form>
                </Card>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

