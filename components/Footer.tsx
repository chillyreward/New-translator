import Link from "next/link";
import { Languages } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-sm">
                <Languages size={18} />
              </div>
              <span className="text-xl font-bold font-serif text-slate-900 tracking-tight">Tafsiri</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Professional translation tools bridging languages and cultures through advanced technology.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/translate" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Translate</Link></li>
              <li><Link href="/dashboard" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">About Us</Link></li>
              <li><Link href="/support" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Tafsiri Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
