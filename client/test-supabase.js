import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nsotzoyhllncdmerfhsx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb3R6b3lobGxuY2RtZXJmaHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTE4MzUsImV4cCI6MjA5Mzc2NzgzNX0.CVW5nL67kZUgIQFHQD9MB9aDN55i70-thIHKeCuG2tA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // We can't log in without credentials, but we can try to fetch a dummy profile or authenticate
  // Wait, the user might have registered tester123@example.com / test1234
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'password123' // Or whatever
  });

  if (signInError) {
    console.error("Sign in failed:", signInError.message);
  } else {
    console.log("Signed in successfully. User ID:", session.user.id);
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    console.log("Profile data:", data);
  }
}

test();
