const supabaseUrl = 'https://nsotzoyhllncdmerfhsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb3R6b3lobGxuY2RtZXJmaHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTE4MzUsImV4cCI6MjA5Mzc2NzgzNX0.CVW5nL67kZUgIQFHQD9MB9aDN55i70-thIHKeCuG2tA';

async function testUpsert() {
  const payload = {
    id: "00000000-0000-0000-0000-000000000000",
    daily_calorie_target: 2000
  };

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("Upsert error:", await res.text());
    } else {
      console.log("Upsert success!");
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testUpsert();
