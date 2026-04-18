import { SettingsSidebar } from "../../components/SettingsSidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <SettingsSidebar />
      <div className="flex-1 overflow-auto p-4 md:p-8 relative">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
