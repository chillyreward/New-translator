"use client";

import { useState } from "react";
import { phrases } from "@/lib/kikuyuPhrases";

export default function RecordPage() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);

  const currentPhrase = phrases[currentIndex];

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("transcript", currentPhrase.kikuyu);
      formData.append("english", currentPhrase.english);

      await fetch("/api/upload", { method: "POST", body: formData });

      setSaved(prev => [...prev, currentPhrase.kikuyu]);
      setCurrentIndex(i => Math.min(i + 1, phrases.length - 1));
      stream.getTracks().forEach(t => t.stop());
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  }

  function stop() {
    mediaRecorder?.stop();
    setRecording(false);
  }

  function skip() {
    setCurrentIndex(i => Math.min(i + 1, phrases.length - 1));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-3xl font-bold font-serif">Record Kikuyu Dataset</h1>

      <div className="bg-slate-900 rounded-2xl p-8 max-w-xl w-full text-center space-y-4 border border-slate-700">
        <p className="text-slate-400 text-sm uppercase tracking-widest">Read this phrase:</p>
        <p className="text-4xl font-serif text-white">{currentPhrase?.kikuyu}</p>
        <p className="text-slate-400 italic">{currentPhrase?.english}</p>
        <p className="text-xs text-slate-600">{currentIndex + 1} / {phrases.length}</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={recording ? stop : start}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
            recording
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {recording ? "⏹ Stop & Save" : "🎙 Start Recording"}
        </button>

        <button
          onClick={skip}
          disabled={recording}
          className="px-6 py-4 rounded-full font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
        >
          Skip →
        </button>
      </div>

      {saved.length > 0 && (
        <div className="text-sm text-green-400">
          ✅ {saved.length} phrase{saved.length > 1 ? "s" : ""} recorded
        </div>
      )}
    </div>
  );
}
