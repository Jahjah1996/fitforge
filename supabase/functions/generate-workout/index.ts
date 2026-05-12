import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
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

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.plan)) return parsed.plan;
    if (Array.isArray(parsed?.workout_plan)) return parsed.workout_plan;
    if (Array.isArray(parsed?.days)) return parsed.days;
    if (parsed?.day && parsed?.exercises) return [parsed];
  } catch {
    // Fall back to extracting JSON from a response that included prose.
  }

  const arrayMatch = cleaned.match(/(\[[\s\S]*\])/);
  if (arrayMatch) return JSON.parse(arrayMatch[1]);

  const objectMatch = cleaned.match(/(\{[\s\S]*\})/);
  if (objectMatch) {
    const parsed = JSON.parse(objectMatch[1]);
    if (Array.isArray(parsed?.plan)) return parsed.plan;
    if (Array.isArray(parsed?.workout_plan)) return parsed.workout_plan;
    if (Array.isArray(parsed?.days)) return parsed.days;
    if (parsed?.day && parsed?.exercises) return [parsed];
  }

  throw new Error("No complete workout JSON found in Gemini response");
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
- Return 4 to 6 exercises per workout day

Return ONLY a raw JSON array as the top-level value, no object wrapper, no markdown, no prose. Exact format:
[{"day":"Monday","muscle_group":"Chest & Triceps","exercises":[{"name":"Push-ups","sets":3,"reps":"12","rest_seconds":60,"form_tip":"Keep core tight."}]}]`;

    console.log("[generate-workout] Calling Gemini REST API, model:", GEMINI_MODEL);

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192, responseMimeType: "application/json" },
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
