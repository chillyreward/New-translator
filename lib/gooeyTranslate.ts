/**
 * Gooey.ai Translation — English/Swahili → Kikuyu
 * Uses GhanaNLP machine translation model
 * Docs: https://api.gooey.ai/v2/Translate
 */

export async function translateWithGooey(
  text: string,
  sourceLang: "en" | "sw" = "en"
): Promise<string> {
  const apiKey = process.env.GOOEY_API_KEY;
  if (!apiKey) throw new Error("Missing GOOEY_API_KEY");

  const response = await fetch("https://api.gooey.ai/v2/Translate/", {
    method: "POST",
    headers: {
      "Authorization": `bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts: [text],
      source_language: sourceLang,
      target_language: "ki",  // Kikuyu ISO code
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Gooey translate error: ${response.status}`);
  }

  const result = await response.json();
  return result?.output?.translations?.[0] ?? text;
}
