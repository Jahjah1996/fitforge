import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getGenAI, cleanJSON, withRetry, MODEL } from "../_shared/gemini.ts";

function normalizeWorkoutPreferences(preferencesOrGoal: any) {
  if (typeof preferencesOrGoal === "object" && preferencesOrGoal !== null) {
    return {
      goal: preferencesOrGoal.goal || "build muscle",
      level: preferencesOrGoal.level || "intermediate",
      equipment: preferencesOrGoal.equipment || "dumbbells",
      daysPerWeek: preferencesOrGoal.daysPerWeek || "5",
      sessionLength: preferencesOrGoal.sessionLength || "45",
      workoutLocation: preferencesOrGoal.workoutLocation || "gym",
      workoutStyle: preferencesOrGoal.workoutStyle || "balanced",
      cardioPreference: preferencesOrGoal.cardioPreference || "light",
      focusAreas: Array.isArray(preferencesOrGoal.focusAreas) ? preferencesOrGoal.focusAreas : [],
      limitations: preferencesOrGoal.limitations || "none",
      notes: preferencesOrGoal.notes || "none"
    };
  }
  return {
    goal: "build muscle",
    level: "intermediate",
    equipment: "dumbbells",
    daysPerWeek: "5",
    sessionLength: "45",
    workoutLocation: "gym",
    workoutStyle: "balanced",
    cardioPreference: "light",
    focusAreas: [],
    limitations: "none",
    notes: "none"
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const preferences = normalizeWorkoutPreferences(
      { ...body, focusAreas: Array.isArray(body.focusAreas) ? body.focusAreas : [] }
    );
    console.log("[generate-workout] Preferences:", JSON.stringify(preferences));

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { temperature: 0.35 }
    });

    const prompt = `You are a certified personal trainer. Generate a personalized ${preferences.daysPerWeek}-day workout plan.
User details:
- Fitness goal: ${preferences.goal}
- Fitness level: ${preferences.level}
- Available equipment: ${preferences.equipment}
- Training location: ${preferences.workoutLocation}
- Workout style: ${preferences.workoutStyle}
- Days per week: ${preferences.daysPerWeek}
- Time per session: ${preferences.sessionLength} minutes
- Cardio preference: ${preferences.cardioPreference}
- Focus areas: ${preferences.focusAreas.length ? preferences.focusAreas.join(", ") : "balanced full body"}
- Limitations or injuries: ${preferences.limitations}
- Extra notes: ${preferences.notes}

Build the plan around the user's goal and limitations. Keep exercises realistic for the equipment and session length.
Use progressive overload, balanced recovery, and include concise form tips.

Return ONLY a valid JSON array. No markdown, no explanation, no extra text. Format:
[
  {
    "day": "Monday",
    "muscle_group": "Chest & Triceps",
    "exercises": [
      {
        "name": "Push-ups",
        "sets": 3,
        "reps": "12",
        "rest_seconds": 60,
        "form_tip": "Keep your core tight and back flat."
      }
    ]
  }
]`;

    console.log("[generate-workout] Calling Gemini API...");
    const plan = await withRetry(() => model.generateContent(prompt).then(r => {
      const text = r.response.text();
      console.log("[generate-workout] Response length:", text.length);
      return JSON.parse(cleanJSON(text));
    }));

    console.log("[generate-workout] Success — returning", plan.length, "days.");
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("[generate-workout] ERROR:", error?.message);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
