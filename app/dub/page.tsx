"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { Youtube, Loader2, Download, AlertCircle, CheckCircle2, Upload, Film } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

type Stage = "idle" | "downloading" | "transcribing" | "translating" | "synthesizing" | "merging" | "done" | "error";
type Mode = "youtube" | "upload";

export default function DubPage() {
  const [mode, setMode] = useState<Mode>("youtube");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDubYoutube = async () => {
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

  const handleDubUpload = async () => {
    if (!file) return;
    setError(null);
    setVideoUrl(null);
    setSegments([]);
    setStage("transcribing");

    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch("/api/dub-upload", {
        method: "POST",
        body: formData,
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
                  <Film size={22} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Video Dubbing</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Automatically dub a video into Kikuyu using AI translation and voice synthesis.
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1 mb-6">
              <button
                onClick={() => { setMode("youtube"); setError(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  mode === "youtube"
                    ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Youtube size={16} />
                YouTube URL
              </button>
              <button
                onClick={() => { setMode("upload"); setError(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  mode === "upload"
                    ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Upload size={16} />
                Upload Video
              </button>
            </div>

            {/* YouTube Input */}
            {mode === "youtube" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                  YouTube URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !isBusy && handleDubYoutube()}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={isBusy}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary-500 transition-colors"
                  />
                  <Button onClick={handleDubYoutube} disabled={isBusy || !url.trim()} className="shrink-0 px-6">
                    {isBusy ? <Loader2 size={18} className="animate-spin" /> : "Dub"}
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Input */}
            {mode === "upload" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                  Upload Video File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
                  className="hidden"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4",
                    file
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700"
                  )}
                >
                  {file ? (
                    <div>
                      <Film size={28} className="mx-auto text-primary-500 mb-2" />
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Click to upload video</p>
                      <p className="text-xs text-slate-400 mt-1">MP4, MOV, AVI, MKV, WebM supported</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleDubUpload}
                  disabled={isBusy || !file}
                  className="w-full"
                >
                  {isBusy ? <><Loader2 size={18} className="animate-spin mr-2" /> Processing…</> : "Dub Video"}
                </Button>
              </div>
            )}

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
                <video src={videoUrl} controls className="w-full rounded-xl bg-black mb-4" />
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
