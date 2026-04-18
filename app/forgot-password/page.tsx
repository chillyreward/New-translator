"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";

type Step = "input" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("input");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("reset"); // Moving to reset layout simulating email sent
    }, 1000);
  };

  const handlePasswordSet = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4 transition-colors relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors"></div>
      
      <div className="w-full max-w-md relative z-10">

        <Card className="p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-100 dark:border-slate-800 transition-all">
          
          {step === "input" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <KeyRound size={28} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-2 text-center transition-colors">Reset password</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8 transition-colors">
                Enter your email address and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleRequestReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <Input type="email" placeholder="john@example.com" required />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Sending link..." : "Send Reset Link"}
                </Button>
              </form>
            </div>
          )}

          {step === "reset" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <KeyRound size={28} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-2 text-center transition-colors">Set new password</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8 transition-colors">
                Please create a strong password that you don't use elsewhere.
              </p>

              <form onSubmit={handlePasswordSet} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                  <Input type="password" placeholder="••••••••" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <Input type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Updating password..." : "Reset Password"}
                </Button>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-2 transition-colors">Password reset successful</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 transition-colors">
                Your password has been updated. You can now use your new credentials to sign in.
              </p>

              <Link href="/login">
                <Button className="w-full h-11">
                  Return to login
                </Button>
              </Link>
            </div>
          )}

        </Card>

        {step !== "success" && (
          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to log in
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

