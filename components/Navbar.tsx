"use client";

import Link from "next/link";
import { Languages, Menu, User, Settings as SettingsIcon, LogOut, Bookmark } from "lucide-react";
import { Button } from "./Button";
import { useStore } from "@/lib/store";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { profile } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-sm">
            <Languages size={18} />
          </div>
          <span className="text-xl font-bold font-serif text-slate-900 dark:text-slate-50 tracking-tight">Tafsiri</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/about" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            About
          </Link>
          <Link href="/support" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Support
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mr-2"></div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 p-1 pr-3 rounded-full border border-slate-200 dark:border-slate-800 transition-all dark:text-slate-200"
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border overflow-hidden flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-serif">{profile.name?.charAt(0) || "U"}</span>
                )}
              </div>
              <span className="text-sm font-medium">{profile.name.split(" ")[0]}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{profile.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link href="/settings/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> Profile
                  </Link>
                  <Link href="/saved-phrases" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setDropdownOpen(false)}>
                    <Bookmark size={16} /> Saved Phrases
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setDropdownOpen(false)}>
                    <SettingsIcon size={16} /> Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={() => setDropdownOpen(false)}>
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
