"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-50 mb-1">Appearance</h1>
        <p className="text-slate-500 dark:text-slate-400">Customize how Tafsiri looks on your device.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-medium text-slate-900 dark:text-slate-50 mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
              theme === "light" 
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <div className="p-3 bg-white shadow-sm rounded-full text-slate-700">
              <Sun size={24} />
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Light</span>
          </button>
          
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
              theme === "dark" 
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <div className="p-3 bg-slate-900 shadow-sm rounded-full text-slate-50">
              <Moon size={24} />
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Dark</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
              theme === "system" 
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <div className="p-3 bg-slate-100 dark:bg-slate-800 shadow-sm rounded-full text-slate-700 dark:text-slate-300">
              <Monitor size={24} />
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">System</span>
          </button>
        </div>
      </div>
    </div>
  );
}
