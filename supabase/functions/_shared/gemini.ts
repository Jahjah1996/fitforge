// Deno imports
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-flash-lite-latest";

export function getGenAI() {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

export function cleanJSON(text: string): string {
  // Strip markdown fences
  let cleaned = text.replace(/```json|```/g, "").trim();
  // Extract the first JSON object or array, ignoring any surrounding prose
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  return match ? match[0] : cleaned;
}

/** Retry fn up to maxRetries times, doubling delay on 429s. */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 2000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = err?.message?.includes("429");
      if (is429 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Retry failed");
}

export { MODEL };
