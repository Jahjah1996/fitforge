const updates = {
  calculator_profile: { goal: "lose" },
  calorie_result: {
    bmr: 1500,
    tdee: 2000,
    target: 1500,
    macros: { protein_g: 100, carbs_g: 100, fat_g: 50 }
  }
};

const data = {};
if (updates.calculator_profile !== undefined) data.calculator_profile = JSON.stringify(updates.calculator_profile);
if (updates.workout_profile !== undefined) data.workout_profile = JSON.stringify(updates.workout_profile);
if (updates.saved_workout_plan !== undefined) data.saved_workout_plan = JSON.stringify(updates.saved_workout_plan);

if (updates.calorie_result) {
  data.last_bmr = updates.calorie_result.bmr;
  data.last_tdee = updates.calorie_result.tdee;
  data.daily_calorie_target = Math.round(updates.calorie_result.target);
  data.daily_protein_target = updates.calorie_result.macros?.protein_g;
  data.daily_carbs_target = updates.calorie_result.macros?.carbs_g;
  data.daily_fat_target = updates.calorie_result.macros?.fat_g;
}

if (updates.daily_calorie_target !== undefined) data.daily_calorie_target = Math.round(updates.daily_calorie_target);
if (updates.daily_protein_target !== undefined) data.daily_protein_target = updates.daily_protein_target;
if (updates.daily_carbs_target !== undefined) data.daily_carbs_target = updates.daily_carbs_target;
if (updates.daily_fat_target !== undefined) data.daily_fat_target = updates.daily_fat_target;

console.log("Final data to upsert:", data);
