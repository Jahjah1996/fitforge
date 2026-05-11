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

async function testRegister() {
  console.log("Registering...");
  try {
    const { data, error } = await supabase.auth.signUp({
      email: "test_register@example.com",
      password: "password123",
      options: {
        data: { name: "Test User" }
      }
    });
    console.log("Data:", data);
    console.log("Error:", error);
  } catch (err) {
    console.log("Catch Error:", err);
  }
}

testRegister();
