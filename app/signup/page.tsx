"use client";

import { useState } from "react";
import Link from "next/link";
import { Languages, CheckCircle2, ChevronRight } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [password, setPassword] = useState("");
  
  // Simple strength check logic
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  
  const strengthScore = [hasLength, hasNumber, hasSpecial, hasUpper].filter(Boolean).length;
  
  const strengthText = 
    strengthScore === 0 ? "None" :
    strengthScore === 1 ? "Weak" :
    strengthScore === 2 ? "Fair" :
    strengthScore === 3 ? "Good" : "Strong";

  const strengthColor = 
    strengthScore <= 1 ? "bg-red-400" :
    strengthScore === 2 ? "bg-amber-400" :
    strengthScore === 3 ? "bg-emerald-400" : "bg-emerald-600";

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors">
      {/* Left side Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 relative z-10 transition-all">
        <div className="mx-auto w-full max-w-sm lg:w-96 py-12">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 mb-8 md:mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-md">
              <Languages size={24} />
            </div>
            <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">Tafsiri</span>
          </Link>

          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-2 text-slate-900 dark:text-white transition-colors">Create an account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 transition-colors">Start translating with precision and cultural context.</p>

          <form className="space-y-4 md:space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href = "/verify-email"; }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                <Input placeholder="John" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                <Input placeholder="Doe" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <Input type="email" placeholder="john@company.com" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <Input 
                type="password" 
                placeholder="Create a strong password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Password strength</span>
                    <span className={cn("text-xs font-semibold", 
                      strengthScore <= 1 ? "text-red-500" :
                      strengthScore === 2 ? "text-amber-500" :
                      "text-emerald-500"
                    )}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1.5 mb-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={cn(
                          "flex-1 rounded-full transition-all duration-300",
                          level <= strengthScore ? strengthColor : "bg-slate-100 dark:bg-slate-800"
                        )}
                      ></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 gap-x-4">
                    <span className={cn("text-[11px] flex items-center gap-1 transition-colors", hasLength ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 darK:text-slate-600")}>
                      <CheckCircle2 size={10} /> 8+ characters
                    </span>
                    <span className={cn("text-[11px] flex items-center gap-1 transition-colors", hasUpper ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 darK:text-slate-600")}>
                      <CheckCircle2 size={10} /> Uppercase
                    </span>
                    <span className={cn("text-[11px] flex items-center gap-1 transition-colors", hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 darK:text-slate-600")}>
                      <CheckCircle2 size={10} /> Number
                    </span>
                    <span className={cn("text-[11px] flex items-center gap-1 transition-colors", hasSpecial ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 darK:text-slate-600")}>
                      <CheckCircle2 size={10} /> Special
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full group mt-4 h-12 text-base">
              Create Account
              <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400 text-center transition-colors">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-800 dark:hover:text-slate-200">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-slate-800 dark:hover:text-slate-200">Privacy Policy</Link>.
          </p>

          <p className="mt-6 text-center shadow-sm rounded-xl bg-slate-50 dark:bg-slate-900 py-4 border border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 transition-colors">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>

      {/* Right side Illustration Area (hidden on mobile/tablet) */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-slate-900 border-l border-slate-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/30 rounded-full blur-[100px]"></div>
        
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <Card className="w-full max-w-lg bg-white/10 backdrop-blur-xl border-white/10 p-10 shadow-2xl text-white outline outline-1 outline-white/20 outline-offset-8 rounded-[2.5rem] transition-all">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6 leading-tight">
              "The most intuitive and accurate translation suite we've ever deployed."
            </h3>
            <div className="flex items-center gap-4 mt-10">
              <div className="w-12 h-12 rounded-full bg-primary-400 flex items-center justify-center text-lg font-bold border border-white/20">
                DR
              </div>
              <div>
                <p className="font-semibold">Dr. Robert Chen</p>
                <p className="text-sm text-white/50">Linguistics Director, Global Reach Org</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

