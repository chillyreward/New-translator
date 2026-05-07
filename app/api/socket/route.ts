import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { dub } from "@/lib/dub";

// Store the Socket.IO server instance globally to avoid re-creating on hot reload
const globalAny = global as any;

function getIO(res: any): SocketIOServer {
  if (!globalAny._io) {
    const io = new SocketIOServer(res.socket?.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("[Socket] Client connected:", socket.id);

      // Receive text → translate → TTS → emit audio back
      socket.on("speech", async (text: string) => {
        console.log("[Socket] speech received:", text);
        try {
          const audio = await dub(text);
          socket.emit("audio", audio);
        } catch (err: any) {
          socket.emit("error", err.message);
        }
      });

      socket.on("disconnect", () => {
        console.log("[Socket] Client disconnected:", socket.id);
      });
    });

    globalAny._io = io;
    console.log("[Socket] Server initialized");
  }
  return globalAny._io;
}

export async function GET(req: NextRequest) {
  const res = (req as any).socket?.server;
  if (res) getIO(res);
  return new Response("Socket.IO server running", { status: 200 });
}
