import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nsotzoyhllncdmerfhsx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb3R6b3lobGxuY2RtZXJmaHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTE4MzUsImV4cCI6MjA5Mzc2NzgzNX0.CVW5nL67kZUgIQFHQD9MB9aDN55i70-thIHKeCuG2tA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Try to insert a dummy row to see what columns error out, or just query one row
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles columns:", data.length > 0 ? Object.keys(data[0]) : "No rows");
  }
}

checkSchema();
