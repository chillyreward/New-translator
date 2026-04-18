"use client";

import { useState } from "react";
import Link from "next/link";
import { Mailbox, CheckCircle2, XCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

type VerificationState = "waiting" | "success" | "expired";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationState>("waiting");

  // This is just a mock function to demonstrate the UI states for the user's request.
  const cycleStatus = () => {
    setStatus(prev => prev === "waiting" ? "success" : prev === "success" ? "expired" : "waiting");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4 relative overflow-hidden transition-colors">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors"></div>

      <div className="w-full max-w-md relative z-10 text-center">
        
        {/* Toggle link for demo purposes */}
        <button 
          onClick={cycleStatus}
          className="absolute -top-16 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-4 py-1.5 rounded-full border border-primary-100 dark:border-primary-800 backdrop-blur-md shadow-sm opacity-60 hover:opacity-100 transition-all"
        >
          Mock UI State: <span className="text-slate-900 dark:text-white">{status}</span>
        </button>

        <Card className="p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-100 dark:border-slate-800 transition-all">
          
          {/* Waiting State */}
          {status === "waiting" && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Mailbox size={32} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-3 transition-colors">Check your inbox</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed transition-colors">
                We've sent a verification link to <span className="font-bold text-slate-900 dark:text-slate-200">john@example.com</span>. Please click the link in that email to proceed.
              </p>
              
              <div className="space-y-4">
                <Button className="w-full h-12 gap-2 shadow-lg shadow-primary-500/10">
                  Open Email App <ArrowRight size={18} />
                </Button>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Didn't receive it? <button className="font-bold text-primary-600 dark:text-primary-400 hover:underline transition-colors">Click to resend</button>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100 dark:border-emerald-900/30 transition-colors">
                <CheckCircle2 size={40} className="drop-shadow-sm" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-3 transition-colors">Email Verified!</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed transition-colors">
                Your email address has been successfully verified. Your account is now fully active and ready to use.
              </p>
              
              <Link href="/dashboard">
                <Button className="w-full h-12 shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          )}

          {/* Expired State */}
          {status === "expired" && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <XCircle size={32} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-3 transition-colors">Link Expired</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed transition-colors">
                The verification link you clicked has expired or is invalid. For security reasons, links expire after 24 hours.
              </p>
              
              <Button onClick={() => setStatus("waiting")} className="w-full h-12 gap-2 shadow-lg shadow-red-500/10">
                <RefreshCcw size={18} /> Send New Link
              </Button>
            </div>
          )}

        </Card>

        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400 transition-colors">
          Need help? <Link href="/support" className="font-bold text-primary-600 dark:text-primary-400 hover:underline transition-colors">Contact Support</Link>
        </p>

      </div>
    </div>
  );
}

