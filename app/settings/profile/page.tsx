"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Camera } from "lucide-react";

export default function ProfileSettingsPage() {
  const { profile, setProfile } = useStore();
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if profile loads slightly delayed
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (isSaved) setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleMockUpload = () => {
    // Just toggle to a placeholder avatar
    const mockAvatar = formData.avatarUrl ? "" : "https://i.pravatar.cc/150?u=gikuyutranslator";
    setFormData({ ...formData, avatarUrl: mockAvatar });
    if (isSaved) setIsSaved(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-50 mb-1">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your public identity and personal details.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/20 border-4 border-white dark:border-slate-950 shadow-sm overflow-hidden flex items-center justify-center text-primary-600 dark:text-primary-400">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-serif font-medium">{formData.name?.charAt(0) || "U"}</span>
                )}
              </div>
              <button 
                type="button"
                onClick={handleMockUpload}
                className="absolute bottom-0 right-0 h-8 w-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105"
                title="Upload photo"
              >
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-50">Profile Picture</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">JPG, GIF or PNG. 1MB max.</p>
              <Button type="button" variant="outline" size="sm" onClick={handleMockUpload} className="text-xs">
                Upload New Picture
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="max-w-md dark:bg-slate-950 dark:border-slate-800" 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                disabled 
                className="max-w-md bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed" 
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email addresses cannot be changed here. <a href="/support" className="text-primary-600 dark:text-primary-400 hover:underline">Contact support</a> if you need to change your email.
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="bio" className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
              <textarea 
                id="bio" 
                name="bio"
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us about yourself..."
                className="flex min-h-[100px] w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <Button type="submit">Save Changes</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setFormData(profile); setIsSaved(false); }}
              className="dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            {isSaved && <span className="text-sm text-green-600 dark:text-green-500 ml-auto animate-in fade-in">Changes saved successfully!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
