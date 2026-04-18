"use client";

import { useState } from "react";
import Link from "next/link";
import { Languages, AlertCircle } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate error after a delay if both aren't filled
    setTimeout(() => {
      if (!email || !password) {
        setError("Invalid email or password. Please try again.");
      } else {
        // Redirect logic would go here
        window.location.href = "/dashboard";
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-4 transition-colors relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-md">
              <Languages size={24} />
            </div>
            <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">Tafsiri</span>
          </Link>
        </div>

        <Card className="p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-2 transition-colors">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <Input 
                type="email" 
                placeholder="Ex: john@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(error ? "border-red-300 focus-visible:ring-red-500" : "")}
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Link href="/forgot-password" size="sm" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(error ? "border-red-300 focus-visible:ring-red-500" : "")}
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 transition-colors"></div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 transition-colors"></div>
          </div>

          <div className="mt-6">
            <Button variant="outline" className="w-full gap-3 font-semibold text-slate-700 dark:text-slate-300 h-11">
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
              </svg>
              Google
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              Sign up today
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

