const https = require('https');

const exercises = [
  "Squat", "Push-Up", "Lunge", "Plank", "Dumbbell-Curl", "Crunch", "Burpee", "Jumping-Jacks", 
  "Deadlift", "Bench-Press", "Pull-up", "Triceps-Dips", "Mountain-Climber", "Russian-Twist",
  "Leg-Raise", "High-Knees", "Bicycle-Crunch", "Glute-Bridge", "Wall-Sit", "Calf-Raise",
  "Shoulder-Press", "Lateral-Raise", "Front-Raise", "Bent-Over-Row", "Lat-Pulldown", "Leg-Press",
  "Leg-Extension", "Leg-Curl", "Chest-Fly", "Triceps-Extension", "Hammer-Curl"
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function main() {
  const valid = {};
  for (const ex of exercises) {
    const url = `https://fitnessprogramer.com/wp-content/uploads/2021/02/${ex}.gif`;
    const lowerurl = `https://fitnessprogramer.com/wp-content/uploads/2021/02/${ex.toLowerCase()}.gif`;
    
    if (await checkUrl(url)) valid[ex] = url;
    else if (await checkUrl(lowerurl)) valid[ex] = lowerurl;
    else {
      // try replacing dash with space or no dash? 
      const nodash = url.replace('-', '');
      if (await checkUrl(nodash)) valid[ex] = nodash;
    }
  }
  console.log(JSON.stringify(valid, null, 2));
}

main();
