"use client";

import { SettingsSidebar } from "../../components/SettingsSidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Palette, Languages, Bell, Shield, Bookmark, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { name: "Profile", href: "/settings/profile", icon: User },
  { name: "Appearance", href: "/settings/appearance", icon: Palette },
  { name: "Language", href: "/settings/language", icon: Languages },
  { name: "Saved", href: "/saved-phrases", icon: Bookmark },
  { name: "Notifications", href: "/settings/notifications", icon: Bell },
  { name: "Privacy", href: "/settings/privacy", icon: Shield },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <SettingsSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Tabs */}
        <div className="md:hidden flex flex-col bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center px-4 py-3 gap-3">
             <Link href="/" className="p-2 text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 rounded-lg">
                <ArrowLeft size={16} />
             </Link>
             <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-50">Settings</h2>
          </div>
          <div className="flex overflow-x-auto no-scrollbar px-4 pb-2 gap-2">
            {settingsTabs.map((tab) => {
              const isActive = pathname === tab.href || (pathname === '/settings' && tab.href === '/settings/profile');
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0",
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-transparent"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

