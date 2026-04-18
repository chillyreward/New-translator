import Link from "next/link";
import { Languages, Menu } from "lucide-react";
import { Button } from "./Button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-sm">
            <Languages size={18} />
          </div>
          <span className="text-xl font-bold font-serif text-slate-900 tracking-tight">Tafsiri</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
            About
          </Link>
          <Link href="/support" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
            Support
          </Link>
          <div className="h-4 w-px bg-slate-200 mr-2"></div>
          <Link href="/login">
            <Button variant="ghost" className="font-medium">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
