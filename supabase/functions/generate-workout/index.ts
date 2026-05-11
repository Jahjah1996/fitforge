import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getGenAI, cleanJSON, withRetry, MODEL } from "../_shared/gemini.ts";

function normalizeWorkoutPreferences(preferencesOrGoal: any, level?: string, equipment?: string) {
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
    goal: preferencesOrGoal || "build muscle",
    level: level || "intermediate",
    equipment: equipment || "dumbbells",
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

// Curated fallback GIFs by keyword so every exercise has a relevant image
const FALLBACK_GIFS: Record<string, string> = {
  "push": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif",
  "squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat.gif",
  "deadlift": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Barbell-Deadlift.gif",
  "lunge": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lunge.gif",
  "curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bicep-Curl.gif",
  "press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif",
  "row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif",
  "plank": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif",
  "crunch": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif",
  "pull": "https://fitnessprogramer.com/wp-content/uploads/2022/01/Pull-Up.gif",
  "dip": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Tricep-Dips.gif",
  "burpee": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Burpee.gif",
  "run": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-jacks.gif",
  "jump": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-jacks.gif",
  "default": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-jacks.gif",
};

function getFallbackGif(exerciseName: string): string {
  const lower = exerciseName.toLowerCase();
  for (const [keyword, url] of Object.entries(FALLBACK_GIFS)) {
    if (lower.includes(keyword)) return url;
  }
  return FALLBACK_GIFS["default"];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("[generate-workout] Parsing request body...");
    const body = await req.json();
    const preferences = normalizeWorkoutPreferences(
        { ...body, focusAreas: Array.isArray(body.focusAreas) ? body.focusAreas : [] }
    );
    console.log("[generate-workout] Preferences:", JSON.stringify(preferences));

    console.log("[generate-workout] Initializing Gemini AI...");
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

      Return ONLY a JSON array with no extra text or markdown. Format exactly like this:
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
      console.log("[generate-workout] Raw AI response length:", text.length);
      return JSON.parse(cleanJSON(text));
    }));
    console.log("[generate-workout] Plan generated with", plan.length, "days.");

    // Attach GIFs — use Tenor with fallback to curated library
    for (const day of plan) {
      for (const ex of day.exercises) {
        try {
          const query = encodeURIComponent(ex.name + " exercise");
          const tenorRes = await fetch(`https://g.tenor.com/v1/search?q=${query}&key=LIVDSRZULELA&limit=1`);
          if (tenorRes.ok) {
            const data = await tenorRes.json();
            ex.gif_url = data.results?.length
              ? data.results[0].media[0].gif.url
              : getFallbackGif(ex.name);
          } else {
            ex.gif_url = getFallbackGif(ex.name);
          }
        } catch {
          ex.gif_url = getFallbackGif(ex.name);
        }
      }
    }

    console.log("[generate-workout] Success! Returning plan.");
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("[generate-workout] FATAL ERROR:", error?.message, error?.stack);
    return new Response(JSON.stringify({ error: error.message || "Unknown error in generate-workout" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
