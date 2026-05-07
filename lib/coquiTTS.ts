/**
 * Coqui XTTS v2 — voice cloning TTS
 * Clones the voice from public/audio/coffee-varieties.wav
 * Server: coqui-server/main.py running on port 5003
 */

export async function synthesizeWithCoqui(text: string): Promise<ArrayBuffer> {
  const coquiUrl = process.env.COQUI_TTS_URL || "http://localhost:5003";

  const response = await fetch(`${coquiUrl}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language: "en" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Coqui TTS error: ${response.status}`);
  }

  return response.arrayBuffer();
}
