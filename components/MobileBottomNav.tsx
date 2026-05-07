"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Translate",
    href: "/translate",
    icon: Languages,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_32px_rgba(0,0,0,0.3)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative group",
                active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
              <item.icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className="transition-transform group-active:scale-90"
              />
              <span className={cn(
                "text-[10px] font-semibold tracking-wide transition-all",
                active ? "font-bold" : ""
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
