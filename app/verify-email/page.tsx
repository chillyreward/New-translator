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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="w-full max-w-md relative z-10 text-center">
        
        {/* Toggle link for demo purposes */}
        <button 
          onClick={cycleStatus}
          className="absolute -top-16 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200"
        >
          Mock toggle state: {status}
        </button>

        <Card className="p-8 shadow-xl bg-white border-slate-100 relative overflow-hidden">
          
          {/* Waiting State */}
          {status === "waiting" && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mailbox size={32} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-3">Check your email</h1>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                We've sent a verification link to <span className="font-medium text-slate-900">john@example.com</span>. Please check your inbox and click the link to verify your account.
              </p>
              
              <div className="space-y-4">
                <Button className="w-full gap-2">
                  Open Email App <ArrowRight size={16} />
                </Button>
                <div className="text-sm text-slate-500">
                  Didn't receive it? <button className="font-medium text-primary-600 hover:text-primary-700 hover:underline">Click to resend</button>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
                <CheckCircle2 size={40} className="drop-shadow-sm" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-3">Email Verified!</h1>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Your email address has been successfully verified. Your account is now fully active.
              </p>
              
              <Link href="/dashboard">
                <Button className="w-full shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          )}

          {/* Expired State */}
          {status === "expired" && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-3">Link Expired</h1>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                The verification link you clicked has expired or is invalid. For security reasons, links expire after 24 hours.
              </p>
              
              <Button onClick={() => setStatus("waiting")} className="w-full gap-2">
                <RefreshCcw size={16} /> Send New Link
              </Button>
            </div>
          )}

        </Card>

        <p className="mt-8 text-sm text-slate-500">
          Need help? <Link href="/support" className="font-medium text-primary-600 hover:underline">Contact Support</Link>
        </p>

      </div>
    </div>
  );
}
