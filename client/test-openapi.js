const supabaseUrl = 'https://nsotzoyhllncdmerfhsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb3R6b3lobGxuY2RtZXJmaHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTE4MzUsImV4cCI6MjA5Mzc2NzgzNX0.CVW5nL67kZUgIQFHQD9MB9aDN55i70-thIHKeCuG2tA';

async function checkSchema() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  
  if (!res.ok) {
    console.error("Error:", await res.text());
  } else {
    const data = await res.json();
    console.log("Profiles definition:", data.definitions.profiles.properties);
  }
}

checkSchema();
