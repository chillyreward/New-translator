"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { Button } from "./Button";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 min-w-0">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 min-w-0 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-sm shrink-0">
            <Languages size={18} />
          </div>
          <span className="text-xl font-bold font-serif text-slate-900 dark:text-slate-50 tracking-tight truncate">{APP_NAME}</span>
        </Link>

        <div className="flex gap-6 items-center">
          <Link href="/about" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            About
          </Link>
          <Link href="/support" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Support
          </Link>

          {pathname === "/" && (
            <div className="flex items-center gap-3 ml-2">
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-medium h-9">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm font-medium h-9">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
