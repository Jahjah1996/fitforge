import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function normalizePreferences(body: any) {
  return {
    goal: body.goal || "build muscle",
    level: body.level || "intermediate",
    equipment: body.equipment || "dumbbells",
    daysPerWeek: body.daysPerWeek || "5",
    sessionLength: body.sessionLength || "45",
    workoutLocation: body.workoutLocation || "gym",
    workoutStyle: body.workoutStyle || "balanced",
    cardioPreference: body.cardioPreference || "light",
    focusAreas: Array.isArray(body.focusAreas) && body.focusAreas.length ? body.focusAreas.join(", ") : "balanced full body",
    limitations: body.limitations || "none",
    notes: body.notes || "none",
  };
}

function extractJSON(text: string): any {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/(\[[\s\S]*\])/);
  if (!match) throw new Error("No JSON array found in Gemini response");
  return JSON.parse(match[1]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY secret is not configured in Supabase");
    }

    const body = await req.json();
    const p = normalizePreferences(body);

    const prompt = `You are a certified personal trainer. Generate a personalized ${p.daysPerWeek}-day workout plan.

User details:
- Goal: ${p.goal}
- Level: ${p.level}
- Equipment: ${p.equipment}
- Location: ${p.workoutLocation}
- Style: ${p.workoutStyle}
- Session: ${p.sessionLength} minutes
- Cardio: ${p.cardioPreference}
- Focus: ${p.focusAreas}
- Limitations: ${p.limitations}
- Notes: ${p.notes}

Rules:
- Tailor every exercise to the equipment and location
- Keep rest periods and sets realistic for the session length
- Include a brief form tip per exercise

Return ONLY a raw JSON array, no markdown, no prose. Exact format:
[{"day":"Monday","muscle_group":"Chest & Triceps","exercises":[{"name":"Push-ups","sets":3,"reps":"12","rest_seconds":60,"form_tip":"Keep core tight."}]}]`;

    console.log("[generate-workout] Calling Gemini REST API, model:", GEMINI_MODEL);

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[generate-workout] Gemini API error:", geminiRes.status, errText);
      throw new Error(`Gemini API returned ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini");

    console.log("[generate-workout] Got response, length:", rawText.length);
    const plan = extractJSON(rawText);

    if (!Array.isArray(plan)) throw new Error("Gemini did not return a JSON array");

    console.log("[generate-workout] Success — returning", plan.length, "days.");
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("[generate-workout] ERROR:", error?.message);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
