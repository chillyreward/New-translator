"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, X, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "idle" | "listening" | "processing" | "speaking" | "error";

interface Message {
  role: "user" | "assistant";
  text: string;
  kikuyu?: string;
}

export function VoiceBubble() {
  const [open, setOpen]       = useState(false);
  const [state, setState]     = useState<State>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError]     = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const scrollRef        = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("listening");
    } catch {
      setError("Microphone access denied. Please allow microphone access.");
      setState("error");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setState("processing");
    }
  }, []);

  const processAudio = async (blob: Blob) => {
    setState("processing");
    try {
      // 1. Transcribe
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!transcribeRes.ok) throw new Error("Transcription failed");
      const { text: userText } = await transcribeRes.json();

      if (!userText?.trim()) {
        setState("idle");
        return;
      }

      setMessages((prev) => [...prev, { role: "user", text: userText }]);

      // 2. Translate to Kikuyu
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText, sourceLang: "en", mode: "translate" }),
      });
      if (!translateRes.ok) throw new Error("Translation failed");
      const { translation } = await translateRes.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: userText, kikuyu: translation },
      ]);

      // 3. Speak the Kikuyu translation
      setState("speaking");
      const speakRes = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translation }),
      });
      if (!speakRes.ok) throw new Error("Speech synthesis failed");

      const audioBlob = await speakRes.blob();
      const audioUrl  = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setState("idle");
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => setState("idle");
      await audio.play();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setState("error");
    }
  };

  const handleMicClick = () => {
    if (state === "listening") {
      stopListening();
    } else if (state === "idle" || state === "error") {
      startListening();
    }
  };

  const handleClose = () => {
    audioRef.current?.pause();
    mediaRecorderRef.current?.stop();
    setState("idle");
    setOpen(false);
    setError(null);
  };

  const stateLabel: Record<State, string> = {
    idle:       "Tap mic to speak",
    listening:  "Listening...",
    processing: "Translating...",
    speaking:   "Speaking Kikuyu...",
    error:      "Try again",
  };

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open voice translator"
        className={cn(
          "fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50",
          "w-14 h-14 rounded-full shadow-2xl",
          "bg-gradient-to-br from-primary-500 to-primary-700",
          "flex items-center justify-center",
          "transition-all duration-300 hover:scale-110 active:scale-95",
          "ring-4 ring-primary-500/20",
          open && "hidden"
        )}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
        <Mic size={22} className="text-white relative z-10" />
      </button>

      {/* Voice panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50",
            "w-80 rounded-3xl shadow-2xl overflow-hidden",
            "bg-white dark:bg-slate-900",
            "border border-slate-100 dark:border-slate-800",
            "flex flex-col",
            "animate-in slide-in-from-bottom-4 fade-in duration-300"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Voice Translator
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px] max-h-[260px]"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-3">
                  <Mic size={20} className="text-primary-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Speak in English and hear it in Kikuyu
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                {msg.role === "user" ? (
                  <div className="bg-primary-500 text-white text-sm px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%] space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary-500 uppercase tracking-wider mb-1">
                      <Volume2 size={10} />
                      Kikuyu
                    </div>
                    <p>{msg.kikuyu}</p>
                  </div>
                )}
              </div>
            ))}

            {state === "processing" && (
              <div className="flex items-start">
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-sm">
                  <Loader2 size={16} className="text-primary-500 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
            <button
              onClick={handleMicClick}
              disabled={state === "processing" || state === "speaking"}
              aria-label={state === "listening" ? "Stop recording" : "Start recording"}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
                "shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                state === "listening"
                  ? "bg-red-500 hover:bg-red-600 scale-110 ring-4 ring-red-500/30"
                  : state === "processing" || state === "speaking"
                  ? "bg-slate-200 dark:bg-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-br from-primary-500 to-primary-700 hover:scale-105 active:scale-95"
              )}
            >
              {state === "processing" ? (
                <Loader2 size={22} className="text-slate-400 animate-spin" />
              ) : state === "speaking" ? (
                <Volume2 size={22} className="text-slate-400" />
              ) : state === "listening" ? (
                <MicOff size={22} className="text-white" />
              ) : (
                <Mic size={22} className="text-white" />
              )}
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {stateLabel[state]}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
