"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Mail, AlertCircle, MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Do you offer API access for developers?",
    answer: "Yes, we offer enterprise API access. You can find the documentation in our developer portal."
  },
  {
    question: "Can I translate audio files?",
    answer: "Currently, we only support live audio translation through the microphone. Uploading audio files for batch translation will be available in Q3."
  },
  {
    question: "How accurate are the translations?",
    answer: "Our engine utilizes state-of-the-art neural machine translation, boasting over 95% accuracy for common language pairings."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can manage or cancel your subscription at any time from your Account Settings Dashboard."
  }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Support Hero */}
        <section className="pt-24 pb-20 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6 text-sm font-medium text-slate-600">
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-6">How can we help?</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Browse our resources, check FAQs, or reach out to our team directly. We're here to assist you.
          </p>
        </section>

        {/* Support Cards */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
                <p className="text-sm text-slate-500 mb-4">Direct help from our team.</p>
                <div className="text-sm font-medium text-blue-600 group-hover:underline">support@tafsiri.com</div>
              </Card>

              <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer text-center">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <AlertCircle size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Report Error</h3>
                <p className="text-sm text-slate-500 mb-4">Did the transaltion fail?</p>
                <div className="text-sm font-medium text-red-600 group-hover:underline">Submit Ticket</div>
              </Card>

              <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer text-center">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Feedback</h3>
                <p className="text-sm text-slate-500 mb-4">Help us improve the app.</p>
                <div className="text-sm font-medium text-primary-600 group-hover:underline">Share Feedback</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Content Section: FAQ & Form */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16">
              
              {/* FAQ Accordion */}
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "border outline outline-offset-0 transition-all duration-200 rounded-2xl overflow-hidden",
                        openFaq === index 
                          ? "border-transparent outline-primary-500/20 bg-primary-50/50 shadow-sm" 
                          : "border-slate-200 outline-transparent bg-white hover:bg-slate-50"
                      )}
                    >
                      <button 
                        className="w-full text-left px-6 py-5 flex items-center justify-between"
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      >
                        <span className="font-medium text-slate-900">{faq.question}</span>
                        <ChevronDown 
                          size={20} 
                          className={cn(
                            "text-slate-400 transition-transform duration-300",
                            openFaq === index ? "rotate-180" : ""
                          )} 
                        />
                      </button>
                      <div 
                        className={cn(
                          "px-6 overflow-hidden transition-all duration-300",
                          openFaq === index ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/50">
                  <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Send a Message</h2>
                  <p className="text-slate-500 text-sm mb-8">Fill out the form below and we will get back to you within 24 hours.</p>
                  
                  <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">First Name</label>
                        <Input placeholder="John" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Last Name</label>
                        <Input placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <Input type="email" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Message</label>
                      <textarea 
                        className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[120px] resize-none transition-all shadow-sm"
                        placeholder="How can we help?"
                      />
                    </div>
                    <Button type="submit" className="w-full">
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
