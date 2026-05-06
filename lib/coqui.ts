export async function ttsChunk(text: string): Promise<ArrayBuffer> {
  const res = await fetch("http://localhost:5003/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      language: "en",
      sample_rate: 16000,  // 16kHz, mono, WAV
    }),
  });
  return res.arrayBuffer();
}
