"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/Button";
import { useState, useEffect } from "react";

export default function LanguageSettingsPage() {
  const { preferences, setPreferences } = useStore();
  const [formData, setFormData] = useState(preferences);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(preferences);
  }, [preferences]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (isSaved) setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferences(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-50 mb-1">Language Preferences</h1>
        <p className="text-slate-500 dark:text-slate-400">Set your default translation and app languages.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="appLanguage" className="text-sm font-medium text-slate-700 dark:text-slate-300">App Interface Language</label>
              <select
                id="appLanguage"
                name="appLanguage"
                value={formData.appLanguage}
                onChange={handleChange}
                className="max-w-md w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
              >
                <option value="English">English</option>
                <option value="Kiswahili">Kiswahili</option>
                <option value="Gikuyu">Gikuyu</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">The language used for navigation, buttons, and settings.</p>
            </div>

            <div className="grid gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <label htmlFor="defaultTargetLanguage" className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Target Language</label>
              <select
                id="defaultTargetLanguage"
                name="defaultTargetLanguage"
                value={formData.defaultTargetLanguage}
                onChange={handleChange}
                className="max-w-md w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
              >
                <option value="Gikuyu">Gikuyu</option>
                <option value="Kiswahili">Kiswahili</option>
                <option value="English">English</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">When you paste text, automatically translate it into this language.</p>
            </div>
            
            <div className="grid gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-translate foreign content</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Automatically translate text when pasting.</p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
                </div>
              </div>
            </div>

            <div className="grid gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Show pronunciation hints</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Display transliteration for target text.</p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
                  <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <Button type="submit">Save Preferences</Button>
            {isSaved && <span className="text-sm text-green-600 dark:text-green-500 ml-auto animate-in fade-in">Preferences saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
