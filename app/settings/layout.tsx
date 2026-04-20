"use client";

import { SettingsSidebar, settingsTabs } from "../../components/SettingsSidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileHeader } from "../../components/MobileHeader";
import { MobileBottomNav } from "../../components/MobileBottomNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Desktop settings sidebar */}
      <SettingsSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile: lightweight header for branding + theme */}
        <MobileHeader />

        {/* Mobile: horizontal tab strip for settings sections */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 gap-2 shrink-0">
          {settingsTabs.map((tab) => {
            const isActive = pathname === tab.href || (pathname === "/settings" && tab.href === "/settings/profile");
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0",
                  isActive
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                )}
              >
                <tab.icon size={13} />
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 relative">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
