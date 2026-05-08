import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getGenAI, cleanJSON, withRetry, MODEL } from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { foodDescription } = await req.json();

    if (!foodDescription) {
      throw new Error("No food provided");
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: MODEL,
      generationConfig: { temperature: 0 }
    });

    const prompt = `You are a nutrition expert. Estimate the nutritional information for this food: "${foodDescription}"
      Return ONLY valid JSON with no extra text or markdown in the exact format below:
      { "food_name": "...", "calories": 156, "protein_g": 13, "carbs_g": 1, "fat_g": 11 }`;

    const nutrition = await withRetry(() => model.generateContent(prompt).then(r => JSON.parse(cleanJSON(r.response.text()))));

    return new Response(JSON.stringify(nutrition), {
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
