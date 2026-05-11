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

async function testLogin() {
  console.log("Logging in...");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test_register@example.com",
      password: "password123",
    });
    console.log("Data:", data);
    console.log("Error:", error);
    
    if (data.user) {
        console.log("Login successful!");
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
        
        if (profileError) {
            console.error("Profile Fetch Error:", profileError);
        } else {
            console.log("Profile Data:", profile);
        }
    } else {
        console.log("Login failed.");
    }
  } catch (err) {
    console.log("Catch Error:", err);
  }
}

testLogin();
