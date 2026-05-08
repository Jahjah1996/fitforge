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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const preferences = normalizeWorkoutPreferences(
        { ...body, focusAreas: Array.isArray(body.focusAreas) ? body.focusAreas : [] }
    );

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

    const plan = await withRetry(() => model.generateContent(prompt).then(r => JSON.parse(cleanJSON(r.response.text()))));

    // Attach dynamic GIFs via Tenor API
    for (const day of plan) {
      for (const ex of day.exercises) {
        try {
          const query = encodeURIComponent(ex.name + " exercise");
          const tenorRes = await fetch(`https://g.tenor.com/v1/search?q=${query}&key=LIVDSRZULELA&limit=1`);
          const data = await tenorRes.json();
          ex.gif_url = data.results?.length
            ? data.results[0].media[0].gif.url
            : "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-jacks.gif";
        } catch {
          ex.gif_url = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-jacks.gif";
        }
      }
    }

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
