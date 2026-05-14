import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws,
    },
  }
);

async function testGenerate() {
  console.log("Logging in...");
  try {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: "test_register@example.com",
      password: "password123",
    });
    
    if (loginError) throw loginError;
    console.log("Login successful! Token:", loginData.session.access_token.slice(0, 15) + "...");

    console.log("Invoking edge function...");
    const form = {
      goal: "build muscle",
      level: "intermediate",
      equipment: "dumbbells",
      daysPerWeek: "5",
      sessionLength: "45",
      workoutLocation: "gym",
      workoutStyle: "balanced",
      cardioPreference: "light",
      focusAreas: ["full body"],
      limitations: "",
      notes: ""
    };

    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: form
    });
    
    if (error) {
      console.log("Edge Function Response Error:", error);
      if (error.context && error.context.json) {
        console.log("Details:", error.context.json);
      } else if (error.context) {
        console.log("Details:", await error.context.text());
      }
    } else {
      console.log("Success! Data:", data);
    }

  } catch (err) {
    console.log("Catch Error:", err);
  }
}

testGenerate();
