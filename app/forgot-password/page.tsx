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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md relative z-10">

        <Card className="p-8 shadow-xl bg-white border-slate-100 relative overflow-hidden">
          
          {step === "input" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound size={28} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-2 text-center">Reset your password</h1>
              <p className="text-slate-500 text-sm text-center mb-8">
                Type in your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleRequestReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <Input type="email" placeholder="john@example.com" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>
          )}

          {step === "reset" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound size={28} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-2 text-center">Set new password</h1>
              <p className="text-slate-500 text-sm text-center mb-8">
                Your new password must be different from previous used passwords.
              </p>

              <form onSubmit={handlePasswordSet} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <Input type="password" placeholder="••••••••" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                  <Input type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-2">Password reset</h1>
              <p className="text-slate-500 text-sm mb-8">
                Your password has been successfully reset. You can now log in with your new password.
              </p>

              <Link href="/login">
                <Button className="w-full">
                  Return to login
                </Button>
              </Link>
            </div>
          )}

        </Card>

        {step !== "success" && (
          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to log in
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
