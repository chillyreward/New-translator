"use client";

import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VoiceOrb } from "@/components/VoiceOrb";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import {
  Play, Square, Download, Copy, CheckCircle2,
  Loader2, Volume2, AlertCircle, Mic2,
} from "lucide-react";

// MMS VITS speaking_rate: 0.6=slow, 0.75=natural, 0.9=fast, 1.1=faster
const SPEEDS = [
  { value: 0.6,  label: "Slow"   },
  { value: 0.75, label: "Normal" },
  { value: 0.9,  label: "Fast"   },
  { value: 1.1,  label: "Faster" },
];

// Voice engines — each has a different character
const ENGINES = [
  {
    id: "mms",
    name: "MMS",
    desc: "Best Kikuyu phonemes",
    color: "violet",
    badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    active: "border-violet-500 bg-violet-50 dark:bg-violet-900/20",
  },
  {
    id: "chatterbox",
    name: "Chatterbox",
    desc: "24kHz voice clone",
    color: "emerald",
    badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    active: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    id: "openvoice",
    name: "OpenVoice v2",
    desc: "Zero-shot voice clone",
    color: "blue",
    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    active: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "rvc",
    name: "RVC",
    desc: "Speaker voice conversion",
    color: "amber",
    badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    active: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
  },
];

type State = "idle" | "loading" | "playing" | "error";

export default function SpeakPage() {
  return (
    <Suspense>
      <SpeakContent />
    </Suspense>
  );
}

function SpeakContent() {
  const searchParams = useSearchParams();
  const [text, setText]         = useState(searchParams.get("q") ?? "");
  const [speed, setSpeed]       = useState(0.75);
  const [engine, setEngine]     = useState("mms");
  const [state, setState]       = useState<State>("idle");
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
  }, []);

  const handleSpeak = useCallback(async () => {
    if (!text.trim()) return;
    setError(null);
    stopAudio();
    setState("loading");

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), speed, engine }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `TTS failed (${res.status})`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.onerror = () => { setState("error"); setError("Audio playback failed."); };

      setState("playing");
      await audio.play();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "TTS failed.");
      setState("error");
    }
  }, [text, speed, engine, audioUrl, stopAudio]);

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href     = audioUrl;
    a.download = `kikuyu-${engine}-${Date.now()}.wav`;
    a.click();
  };

  const handleCopy = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxChars  = 5000;
  const charCount = text.length;
  const activeEngine = ENGINES.find(e => e.id === engine)!;

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <div className="hidden md:block"><Navbar /></div>
        <MobileHeader />

        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-200/30 dark:bg-violet-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto w-full">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900 dark:text-white mb-1">
                Text to Speech
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Kikuyu voice synthesis — switch between engines to compare quality.
              </p>
            </div>

            {/* Engine selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {ENGINES.map(eng => (
                <button
                  key={eng.id}
                  onClick={() => setEngine(eng.id)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all",
                    engine === eng.id
                      ? eng.active
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      eng.badge
                    )}>
                      {eng.name}
                    </span>
                    {engine === eng.id && (
                      <CheckCircle2 size={12} className="ml-auto text-current opacity-60" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                    {eng.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Left — controls */}
              <div className="lg:col-span-3 flex flex-col gap-5">

                {/* Text input */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-5 pb-0">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">
                      Kikuyu Text
                    </label>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value.slice(0, maxChars))}
                      placeholder="Type or paste Kikuyu text here… e.g. Wĩ mwega?"
                      rows={8}
                      className="w-full resize-none bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 text-base md:text-lg font-serif leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                    <span className={cn(
                      "text-[11px] font-medium",
                      charCount > maxChars * 0.9 ? "text-amber-500" : "text-slate-400 dark:text-slate-600"
                    )}>
                      {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                    </span>
                    <button
                      onClick={handleCopy}
                      disabled={!text.trim()}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-medium transition-colors",
                        copied ? "text-green-500" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
                        !text.trim() && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Speed selector */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">
                    Speaking Speed
                  </label>
                  <div className="flex gap-2">
                    {SPEEDS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSpeed(s.value)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                          speed === s.value
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                            : "border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-xl">
                    <AlertCircle size={16} className="shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold text-xs">✕</button>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  {state === "playing" ? (
                    <Button
                      onClick={stopAudio}
                      className="flex-1 h-12 gap-2 bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                      <Square size={16} className="fill-current" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSpeak}
                      disabled={!text.trim() || state === "loading"}
                      className={cn(
                        "flex-1 h-12 gap-2 shadow-xl shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]",
                        (!text.trim() || state === "loading") && "opacity-60 cursor-not-allowed hover:scale-100"
                      )}
                    >
                      {state === "loading"
                        ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
                        : <><Play size={16} className="fill-current" /> Speak</>
                      }
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={!audioUrl}
                    title="Download audio"
                    className={cn("h-12 px-4 gap-2", !audioUrl && "opacity-40 cursor-not-allowed")}
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>

              </div>

              {/* Right — orb + status */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center gap-6 py-8">
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-pink-500/20 blur-3xl transition-all duration-700",
                    state === "playing" ? "scale-150 opacity-100" : "scale-110 opacity-50",
                    state === "loading" && "animate-pulse scale-125"
                  )} />
                  <VoiceOrb size={300} />
                </div>

                {/* Status */}
                <div className="text-center">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    state === "playing" ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : state === "loading" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      : state === "error"   ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  )}>
                    {state === "playing" && <><Volume2 size={14} className="animate-pulse" /> Speaking…</>}
                    {state === "loading" && <><Loader2 size={14} className="animate-spin" /> Generating…</>}
                    {state === "error"   && <><AlertCircle size={14} /> Error</>}
                    {state === "idle"    && <><Mic2 size={14} /> Ready</>}
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">
                    {activeEngine.name} · {SPEEDS.find(s => s.value === speed)?.label} speed
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
