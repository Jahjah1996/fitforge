import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getGenAI, cleanJSON, withRetry, MODEL } from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { age, gender, weight, height, activity, goal, unit } = await req.json();

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: MODEL,
      generationConfig: { temperature: 0 }
    });

    const prompt = `You are an elite fitness and nutrition coach. Calculate the basal metabolic rate (BMR), total daily energy expenditure (TDEE), target daily calories, and a macronutrient breakdown for this user:
      - Age: ${age}
      - Gender: ${gender}
      - Weight: ${weight} ${unit === 'metric' ? 'kg' : 'lbs'}
      - Height: ${height} ${unit === 'metric' ? 'cm' : 'total inches'}
      - Activity Level: ${activity}
      - Goal: ${goal}
      
      Use scientifically backed formulas but apply your AI expertise to optimize the macros.
      Return ONLY a valid JSON object with no extra text or markdown. Format exactly like this:
      {
        "bmr": 1800,
        "tdee": 2400,
        "target": 1900,
        "macros": {
          "protein_g": 150,
          "fat_g": 60,
          "carbs_g": 190
        }
      }`;

    const data = await withRetry(() => model.generateContent(prompt).then(r => JSON.parse(cleanJSON(r.response.text()))));

    return new Response(JSON.stringify(data), {
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
