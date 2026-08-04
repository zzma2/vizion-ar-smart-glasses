import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SpeakInput = z.object({
  audioBase64: z.string().min(10),
  format: z.enum(["webm", "mp4", "m4a", "wav", "mp3", "ogg"]).default("webm"),
});

export const speechToText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SpeakInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    // OpenAI-compatible /v1/audio/transcriptions endpoint
    const buffer = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    const mime =
      data.format === "webm" ? "audio/webm" :
      data.format === "mp4" || data.format === "m4a" ? "audio/mp4" :
      data.format === "wav" ? "audio/wav" :
      data.format === "mp3" ? "audio/mpeg" :
      "audio/ogg";
    const blob = new Blob([buffer], { type: mime });

    const form = new FormData();
    form.append("file", blob, `audio.${data.format}`);
    form.append("model", "openai/gpt-4o-mini-transcribe");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`Transcription failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as { text?: string };
    return { text: json.text ?? "" };
  });

const SignInput = z.object({
  imageBase64: z.string().min(50), // data URL or raw base64
});

export const signToText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SignInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const dataUrl = data.imageBase64.startsWith("data:")
      ? data.imageBase64
      : `data:image/jpeg;base64,${data.imageBase64}`;

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    try {
      const { text } = await generateText({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an ASL (American Sign Language) recognizer for a live demo. Look at the photo and identify the most likely sign, letter, or short phrase being shown. Reply with ONLY the interpreted word or short phrase (max 6 words), no explanation. If no hand or sign is visible, reply exactly: 'No sign detected'.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What sign is being shown?" },
              { type: "image", image: dataUrl },
            ],
          },
        ],
      });
      return { text: text.trim().slice(0, 120) };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) throw new Error("Rate limit reached. Please try again shortly.");
      if (msg.includes("402")) throw new Error("AI credits exhausted.");
      throw new Error(`Vision failed: ${msg.slice(0, 200)}`);
    }
  });
