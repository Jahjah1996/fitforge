export function calculateBMR(weight_kg, height_cm, age, gender) {
  const base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    athlete: 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

export function calculateTarget(tdee, goal) {
  const adjustments = {
    lose: -500,
    maintain: 0,
    gain: 300,
    recomp: -200
  };
  return tdee + (adjustments[goal] || 0);
}

export function calculateMacros(targetCalories, weight_kg) {
  const protein_g = Math.round(weight_kg * 2);
  const fat_g = Math.round((targetCalories * 0.25) / 9);
  const carb_cal = targetCalories - (protein_g * 4) - (fat_g * 9);
  const carbs_g = Math.max(0, Math.round(carb_cal / 4));
  return { protein_g, fat_g, carbs_g };
}
