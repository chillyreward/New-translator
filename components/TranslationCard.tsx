"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Mic, MicOff, Copy, Share2, Bookmark,
  Volume2, History, Loader2, AlertCircle, CheckCircle2, Youtube, Film,
} from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SOURCE_LANGUAGES = ["Auto-detect", "English", "Kiswahili"];
type LoadingState = "idle" | "translating" | "listening" | "transcribing" | "youtube" | "video";

export function TranslationCard({ initialText = "" }: { initialText?: string }) {
  const { addSavedPhrase } = useStore();
  const [sourceLang, setSourceLang]         = useState("Auto-detect");
  const mode                                 = "translate";
  const targetLang                           = "Gikuyu";
  const [sourceText, setSourceText]         = useState(initialText);
  const [translatedText, setTranslatedText] = useState("");
  const [localWav, setLocalWav]             = useState<string | null>(null);
  const [isSaved, setIsSaved]               = useState(false);
  const [loadingState, setLoadingState]     = useState<LoadingState>("idle");
  const [error, setError]                   = useState<string | null>(null);
  const [copiedSource, setCopiedSource]     = useState(false);
  const [copiedTarget, setCopiedTarget]     = useState(false);
  const [youtubeUrl, setYoutubeUrl]         = useState("");
  const [showYoutube, setShowYoutube]       = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const videoInputRef    = useRef<HTMLInputElement | null>(null);
  const isRecording      = loadingState === "listening";
  const isBusy           = loadingState !== "idle";

  const clearError = () => setError(null);

  // ─── Translate ────────────────────────────────────────────────────────────
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) { setError("Please enter some text to translate."); return; }
    clearError();
    setLoadingState("translating");
    setTranslatedText("");
    setIsSaved(false);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText.trim(),
          sourceLang: sourceLang === "Kiswahili" ? "sw" : "en",
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed.");
      setTranslatedText(data.translation ?? "");
      setLocalWav(data.wav ?? null);  // set local WAV if returned
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Translation failed.");
    } finally {
      setLoadingState("idle");
    }
  }, [sourceText, sourceLang]);

  // ─── Video Upload ─────────────────────────────────────────────────────────
  const handleVideoUpload = useCallback(async (file: File) => {
    if (!file) return;
    clearError();
    setLoadingState("video");
    setSourceText(""); setTranslatedText("");
    try {
      const form = new FormData();
      form.append("video", file);
      const res  = await fetch("/api/video-transcript", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Video transcription failed.");
      setSourceText(data.transcript);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Video transcription failed.");
    } finally {
      setLoadingState("idle");
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }, []);

  // ─── YouTube ──────────────────────────────────────────────────────────────
  const handleYoutubeTranscribe = useCallback(async () => {
    if (!youtubeUrl.trim()) { setError("Please enter a YouTube URL."); return; }
    clearError();
    setLoadingState("youtube");
    setSourceText(""); setTranslatedText("");
    try {
      const res  = await fetch("/api/youtube-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: youtubeUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get transcript.");
      setSourceText(data.transcript);
      setShowYoutube(false);
      setYoutubeUrl("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "YouTube transcription failed.");
    } finally {
      setLoadingState("idle");
    }
  }, [youtubeUrl]);

  // ─── Voice Input ──────────────────────────────────────────────────────────
  const handleMicClick = useCallback(async () => {
    if (isRecording) { mediaRecorderRef.current?.stop(); return; }
    clearError();
    try {
      const stream        = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current   = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setLoadingState("transcribing");
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const res  = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Transcription failed.");
          setSourceText(data.transcript ?? data.text);
          setIsSaved(false);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Transcription failed.");
        } finally { setLoadingState("idle"); }
      };
      mediaRecorder.start();
      setLoadingState("listening");
    } catch {
      setError("Microphone access was denied.");
      setLoadingState("idle");
    }
  }, [isRecording]);

  // ─── Save / Copy ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!translatedText || isSaved) return;
    addSavedPhrase({ sourceText, translatedText, sourceLang, targetLang });
    setIsSaved(true);
  };
  const handleCopySource = () => {
    if (!sourceText) return;
    navigator.clipboard.writeText(sourceText);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  };
  const handleCopyTarget = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const micLabel = loadingState === "listening" ? "Listening..." : loadingState === "transcribing" ? "Transcribing..." : "Voice Input";

  return (
    <Card className="overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300">

      {/* YouTube Input Panel */}
      {showYoutube && (
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex gap-3 items-center animate-in fade-in duration-200">
          <Youtube size={18} className="text-red-500 shrink-0" />
          <input
            type="url"
            placeholder="Paste YouTube URL…"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleYoutubeTranscribe()}
            disabled={isBusy}
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          <Button size="sm" onClick={handleYoutubeTranscribe} disabled={isBusy || !youtubeUrl.trim()} className="shrink-0 text-xs">
            {loadingState === "youtube" ? <Loader2 size={14} className="animate-spin" /> : "Get Transcript"}
          </Button>
          <button onClick={() => setShowYoutube(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold">✕</button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 px-5 py-3 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm animate-in fade-in duration-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold text-xs shrink-0">✕</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 relative">

        {/* ── Source ── */}
        <div className="flex-1 p-5 md:p-8 relative flex flex-col group transition-all">
          <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6">
            {SOURCE_LANGUAGES.map(lang => (
              <button key={lang}
                onClick={() => { setSourceLang(lang); setIsSaved(false); }}
                disabled={isBusy}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all border",
                  sourceLang === lang
                    ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700",
                  isBusy && "opacity-50 cursor-not-allowed"
                )}
              >{lang}</button>
            ))}
          </div>

          <textarea
            className="w-full flex-1 resize-none bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 text-xl md:text-2xl min-h-[180px] font-serif leading-relaxed selection:bg-primary-500/30 transition-colors"
            placeholder={
              loadingState === "transcribing" ? "Transcribing audio..." :
              loadingState === "youtube"      ? "Fetching YouTube transcript..." :
              "Type, paste, or speak text here..."
            }
            value={sourceText}
            onChange={e => { setSourceText(e.target.value); setIsSaved(false); clearError(); setLocalWav(null); }}
            disabled={isBusy}
          />

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1 md:gap-2">
              <Button variant="ghost" size="icon" onClick={handleMicClick}
                disabled={loadingState === "translating" || loadingState === "transcribing"}
                title={micLabel}
                className={cn("rounded-xl h-10 w-10 transition-all",
                  isRecording ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 animate-pulse"
                  : loadingState === "transcribing" ? "text-amber-500 dark:text-amber-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                )}>
                {loadingState === "transcribing" ? <Loader2 size={20} className="animate-spin" /> : isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setShowYoutube(v => !v)}
                disabled={isBusy} title="Transcribe from YouTube"
                className={cn("rounded-xl h-10 w-10 transition-all",
                  showYoutube ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                  : loadingState === "youtube" ? "text-red-500 animate-pulse"
                  : "text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}>
                {loadingState === "youtube" ? <Loader2 size={20} className="animate-spin" /> : <Youtube size={20} />}
              </Button>

              <input ref={videoInputRef} type="file" accept="video/*,.mp4,.mov,.avi,.mkv,.webm" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }} />
              <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()}
                disabled={isBusy} title="Upload video to transcribe"
                className={cn("rounded-xl h-10 w-10 transition-all",
                  loadingState === "video" ? "text-primary-500 animate-pulse"
                  : "text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                )}>
                {loadingState === "video" ? <Loader2 size={20} className="animate-spin" /> : <Film size={20} />}
              </Button>

              <Button variant="ghost" size="icon" onClick={handleCopySource}
                disabled={!sourceText.trim()} title="Copy source text"
                className={cn("rounded-xl h-10 w-10 transition-all",
                  copiedSource ? "text-green-500 dark:text-green-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
                  !sourceText.trim() && "opacity-40 cursor-not-allowed"
                )}>
                {copiedSource ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </Button>
            </div>
            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {sourceText.length} / 5000
            </p>
          </div>
        </div>

        {/* ── Translation output ── */}
        <div className="flex-1 p-5 md:p-8 bg-slate-50/30 dark:bg-slate-950/30 relative flex flex-col group/result transition-all">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="text-[10px] md:text-xs font-bold text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full border border-primary-100 dark:border-primary-800/50 bg-primary-50/50 dark:bg-primary-900/20 uppercase tracking-widest">
              Target: {targetLang}
            </div>
          </div>

          <div className="flex-1 text-xl md:text-2xl text-slate-900 dark:text-white min-h-[180px] font-serif leading-relaxed transition-colors">
            {loadingState === "translating" ? (
              <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600">
                <Loader2 size={22} className="animate-spin text-primary-500 shrink-0" />
                <span className="text-base font-sans">Translating...</span>
              </div>
            ) : translatedText ? (
              <p className="animate-in fade-in duration-500">{translatedText}</p>
            ) : (
              <div className="text-slate-300 dark:text-slate-700 transition-colors">
                <span className="font-medium text-slate-400 dark:text-slate-600">Wĩ mwega?</span>
                <span className="block text-sm mt-1">How are you?</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1 md:gap-2">
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" disabled title="Translation history (coming soon)"
                className="rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 transition-all">
                <History size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSave}
                disabled={!translatedText || isSaved} title={isSaved ? "Phrase saved!" : "Save phrase"}
                className={cn("rounded-xl h-10 w-10 transition-all",
                  isSaved ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
                  !translatedText && "opacity-40 cursor-not-allowed"
                )}>
                <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
              </Button>
              <Button variant="ghost" size="icon"
                onClick={() => { if (translatedText && navigator.share) navigator.share({ title: "Gikuyu Translation", text: translatedText }); }}
                disabled={!translatedText} title="Share translation"
                className={cn("rounded-xl h-10 w-10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all",
                  !translatedText && "opacity-40 cursor-not-allowed"
                )}>
                <Share2 size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCopyTarget}
                disabled={!translatedText} title="Copy translation"
                className={cn("rounded-xl h-10 w-10 transition-all",
                  copiedTarget ? "text-green-500 dark:text-green-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
                  !translatedText && "opacity-40 cursor-not-allowed"
                )}>
                {copiedTarget ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="p-5 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="text-xs text-slate-400 dark:text-slate-600 font-medium">
          {loadingState === "listening" && (
            <span className="flex items-center gap-2 text-red-500 dark:text-red-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Recording… Click the mic again to stop.
            </span>
          )}
          {loadingState === "transcribing" && (
            <span className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
              <Loader2 size={13} className="animate-spin" /> Transcribing audio…
            </span>
          )}
          {loadingState === "youtube" && (
            <span className="flex items-center gap-2 text-red-500 dark:text-red-400">
              <Loader2 size={13} className="animate-spin" /> Fetching YouTube transcript…
            </span>
          )}
          {loadingState === "video" && (
            <span className="flex items-center gap-2 text-primary-500 dark:text-primary-400">
              <Loader2 size={13} className="animate-spin" /> Extracting audio from video…
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!translatedText) return;
              if (localWav) {
                // Play local WAV directly
                const audio = new Audio(localWav);
                audio.play().catch(() => {
                  // Fallback to speak page if WAV fails
                  window.location.href = `/speak?q=${encodeURIComponent(translatedText)}`;
                });
              } else {
                // No local WAV — go to speak page for MMS/OpenVoice
                window.location.href = `/speak?q=${encodeURIComponent(translatedText)}`;
              }
            }}
            disabled={!translatedText}
            title={localWav ? "Play local audio" : "Speak via TTS"}
            className={cn(
              "inline-flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-semibold border transition-all",
              translatedText
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/40"
                : "text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed"
            )}
          >
            <Volume2 size={15} />
            {localWav ? "Play" : "Speak"}
          </button>

          <Button
            onClick={handleTranslate}
            disabled={isBusy || !sourceText.trim()}
            className={cn(
              "w-full sm:w-auto px-10 h-12 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary-500/20 dark:shadow-primary-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]",
              (isBusy || !sourceText.trim()) && "opacity-60 cursor-not-allowed hover:scale-100"
            )}
          >
            {loadingState === "translating"
              ? <><Loader2 size={16} className="animate-spin mr-2 inline" />Translating…</>
              : "Translate"
            }
          </Button>
        </div>
      </div>
    </Card>
  );
}
