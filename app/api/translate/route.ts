import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sourceLanguage } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and cannot be empty." },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const targetLanguage = "Gikuyu";

    // Build a clear system prompt for high-quality Gikuyu translation
    const sourceInstruction =
      sourceLanguage === "Auto-detect"
        ? "Detect the source language automatically."
        : `The source language is ${sourceLanguage}.`;

    const systemPrompt = `You are an expert translator specializing in the Gikuyu (Kikuyu) language of Kenya. 
Your task is to translate the given text into Gikuyu with high accuracy, preserving the original meaning, tone, and cultural context.
${sourceInstruction}
Only output the translated Gikuyu text — no explanations, no romanization notes, no additional commentary.
If the text is already in Gikuyu, return it as-is.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: trimmedText },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const translation = completion.choices[0]?.message?.content?.trim();

    if (!translation) {
      return NextResponse.json(
        { error: "Translation failed. No output was returned." },
        { status: 500 }
      );
    }

    // Detect the source language label to return
    const detectedSource =
      sourceLanguage === "Auto-detect" ? "Auto-detected" : sourceLanguage;

    return NextResponse.json({
      translation,
      sourceLanguage: detectedSource,
      targetLanguage,
    });
  } catch (error: unknown) {
    console.error("[/api/translate] Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
