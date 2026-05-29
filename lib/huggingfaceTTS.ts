/**
 * Hugging Face Inference API — Kikuyu TTS
 * Model: facebook/mms-tts-kik (Meta MMS — trained natively on Kikuyu)
 */

const MODEL = "facebook/mms-tts-kik";

export async function synthesizeWithHuggingFace(
  text: string,
  apiKey: string
): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${MODEL}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // Model may be cold-loading — HF returns 503 with estimated_time
    if (response.status === 503) {
      const wait = err?.estimated_time ?? 20;
      throw new Error(`Model is loading, retry in ${Math.ceil(wait)}s`);
    }
    throw new Error(err?.error || `HuggingFace TTS error: ${response.status}`);
  }

  return response.arrayBuffer();
}
