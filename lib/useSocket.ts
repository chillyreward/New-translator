"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

/**
 * React hook for real-time Kikuyu dubbing via WebSocket.
 *
 * Usage:
 *   const { sendSpeech } = useSocket((audioBuffer) => {
 *     // play the audio
 *   });
 */
export function useSocket(onAudio: (buffer: ArrayBuffer) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    fetch("/api/socket").then(() => {
      const socket = io({ path: "/api/socket", addTrailingSlash: false });

      socket.on("connect", () => {
        console.log("[Socket] Connected:", socket.id);
      });

      socket.on("audio", (data: ArrayBuffer) => {
        onAudio(data);
      });

      socket.on("error", (msg: string) => {
        console.error("[Socket] Error:", msg);
      });

      socketRef.current = socket;
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendSpeech = useCallback((text: string) => {
    socketRef.current?.emit("speech", text);
  }, []);

  return { sendSpeech };
}
