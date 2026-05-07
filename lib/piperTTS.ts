/**
 * Piper TTS — calls your local/hosted FastAPI server
 * Server: piper-server/main.py
 * Default: http://localhost:5002
 */

export async function synthesizeWithPiper(text: string): Promise<ArrayBuffer> {
  const piperUrl = process.env.PIPER_TTS_URL || "http://localhost:5002";

  const response = await fetch(`${piperUrl}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Piper TTS error: ${response.status}`);
  }

  return response.arrayBuffer();
}
