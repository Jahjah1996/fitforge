import { calculateBMR, calculateTDEE, calculateTarget, calculateMacros } from './src/utils/calorieFormulas.js';

const form = {
  age: "25",
  gender: "male",
  weight: "75",
  weight_lb: "165",
  height: "175",
  height_ft: "5",
  height_in: "9",
  unit: "metric",
  activity: "moderate",
  goal: "maintain",
};

const age = parseFloat(form.age);
const weightKg = parseFloat(form.weight);
const heightCm = parseFloat(form.height);

const bmr = calculateBMR(weightKg, heightCm, age, form.gender);
const tdee = calculateTDEE(bmr, form.activity);
const target = calculateTarget(tdee, form.goal);
const macros = calculateMacros(target, weightKg);

console.log("Result:", { bmr, tdee, target, macros });
