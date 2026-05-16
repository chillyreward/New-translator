"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { Youtube, Loader2, Download, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

type Stage = "idle" | "downloading" | "transcribing" | "translating" | "synthesizing" | "merging" | "done" | "error";

export default function DubPage() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stageLabels: Record<Stage, string> = {
    idle: "",
    downloading: "Downloading video...",
    transcribing: "Transcribing audio with Whisper...",
    translating: "Translating to Kikuyu...",
    synthesizing: "Generating Kikuyu voice...",
    merging: "Merging dubbed audio with video...",
    done: "Done!",
    error: "Error",
  };

  const handleDub = async () => {
    if (!url.trim()) return;
    setError(null);
    setVideoUrl(null);
    setSegments([]);
    setStage("downloading");

    try {
      const res = await fetch("/api/dub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Dubbing failed");

      setVideoUrl(data.videoUrl);
      setSegments(data.segments || []);
      setStage("done");
    } catch (err: any) {
      setError(err.message);
      setStage("error");
    }
  };

  const isBusy = stage !== "idle" && stage !== "done" && stage !== "error";

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <div className="hidden md:block"><Navbar /></div>
        <MobileHeader />

        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto w-full">

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Youtube size={22} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">YouTube Dubbing</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Paste a YouTube URL to automatically dub the video into Kikuyu using your cloned voice.
              </p>
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                YouTube URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !isBusy && handleDub()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isBusy}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary-500 transition-colors"
                />
                <Button
                  onClick={handleDub}
                  disabled={isBusy || !url.trim()}
                  className="shrink-0 px-6"
                >
                  {isBusy ? <Loader2 size={18} className="animate-spin" /> : "Dub"}
                </Button>
              </div>
            </div>

            {/* Progress */}
            {isBusy && (
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/50 p-6 mb-6">
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="animate-spin text-primary-600 dark:text-primary-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-primary-700 dark:text-primary-300">{stageLabels[stage]}</p>
                    <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-0.5">
                      This may take several minutes depending on video length.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-100 dark:border-red-900/50 p-6 mb-6 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">Dubbing failed</p>
                  <p className="text-sm text-red-600 dark:text-red-400/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Result */}
            {stage === "done" && videoUrl && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">Dubbed video ready</span>
                </div>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-xl bg-black mb-4"
                />
                <a
                  href={videoUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors w-fit"
                >
                  <Download size={16} />
                  Download dubbed video
                </a>
              </div>
            )}

            {/* Transcript */}
            {segments.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-widest">
                  Translation ({segments.length} segments)
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {segments.map((seg, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="text-xs text-slate-400 dark:text-slate-600 shrink-0 pt-0.5 w-16">
                        {Math.floor(seg.start / 60)}:{String(Math.floor(seg.start % 60)).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-0.5 truncate">{seg.original}</p>
                        <p className="text-slate-900 dark:text-white font-medium">{seg.kikuyu}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
