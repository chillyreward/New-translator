/**
 * Gooey.ai TTS
 * Uses OpenAI onyx voice via Gooey — reliable fallback for Kikuyu text
 */

export async function synthesizeWithGooey(
  text: string,
  apiKey: string
): Promise<ArrayBuffer> {
  // Use OpenAI onyx via Gooey — most reliable for Kikuyu phonetics
  return await gooeyRequest(apiKey, {
    text_prompt: text,
    tts_provider: "OPEN_AI",
    openai_voice_name: "onyx",
  });
}

async function gooeyRequest(apiKey: string, payload: object): Promise<ArrayBuffer> {
  const response = await fetch("https://api.gooey.ai/v2/TextToSpeech/", {
    method: "POST",
    headers: {
      "Authorization": `bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Gooey TTS error: ${response.status}`);
  }

  const result = await response.json();
  const audioUrl: string = result?.output?.audio_url;
  if (!audioUrl) throw new Error(`Gooey TTS: no audio_url in response. Got: ${JSON.stringify(result)}`);

  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) throw new Error("Gooey TTS: failed to fetch audio");

  return audioResponse.arrayBuffer();
}
