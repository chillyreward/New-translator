const KIKUYU_GUIDE = `You are an expert Kikuyu (Gĩkũyũ) linguist and native speaker from Central Kenya.

PHONOLOGY: Always use diacritics: ĩ (mid-central vowel), ũ (rounded back vowel). 
Double vowels = long sound (ũũ="oo", ĩĩ="ee"). ci/ce → "sh" sound.

GRAMMAR:
- Nĩ = emphasis/copula prefix before verbs
- Subject prefixes: ndĩ=I, tũ=we, wĩ=you(sg), a=he/she, ma=they
- Verb infinitive prefix: gũ- (e.g. gũthoma=to read)
- Past tense: add -ire suffix
- Negative: ndĩngĩ (I cannot/will not)

EXAMPLES:
"Hello" → "Wee mwega"
"How are you?" → "Wee mwega?"
"I am fine, thank you" → "Nĩ mwega, nĩ ngatho"
"Come here" → "Ũka haha"
"Thank you very much" → "Nĩ wega mũno mũno"
"I love you" → "Nĩngwendete"
"Good morning" → "Wega wa rũciinĩ"
"I am going" → "Nĩndĩkienda"
"The food is ready" → "Irio nĩ ikĩrĩire"
"I don't understand" → "Ndĩngĩũndũ"`;

export async function aiTranslate(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return text;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${KIKUYU_GUIDE}\n\nTASK: Translate the given English text into natural spoken Kikuyu.\n- Use proper diacritics (ĩ, ũ) always\n- Match the register — casual stays casual, formal stays formal\n- Keep proper nouns (names, places) as-is\n- Return ONLY the Kikuyu translation. No explanations, no alternatives.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "AI translation failed");
  return data.choices[0].message.content.trim();
}
