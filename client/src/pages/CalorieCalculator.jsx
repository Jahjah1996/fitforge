import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useAuth } from "../context/AuthContext";
import { SetupFlowProgress, SetupTransitionOverlay } from "../components/SetupFlowProgress";
import {
  calculateBMR,
  calculateTDEE,
  calculateTarget,
  calculateMacros,
} from "../utils/calorieFormulas";

const COLORS = ["#EF4444", "#6EB5FF", "#FFD95A"];

const inputClass =
  "w-full bg-[#F7F9FC] border border-gray-200 text-[#111] px-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 transition-all placeholder-gray-400 text-sm font-medium";

const selectClass =
  "w-full bg-[#F7F9FC] border border-gray-200 text-[#111] px-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 transition-all text-sm font-semibold cursor-pointer appearance-none";

const DEFAULT_FORM = {
  unit: "metric",
  age: "",
  gender: "male",
  weight: "",
  height: "",
  weight_lb: "",
  height_ft: "",
  height_in: "",
  activity: "moderate",
  goal: "maintain",
};

function getSavedCalculatorForm(user) {
  return user?.calculator_profile
    ? { ...DEFAULT_FORM, ...user.calculator_profile }
    : { ...DEFAULT_FORM };
}

/** True only after a real calculator save — not a bare DB default on `daily_calorie_target`. */
function userHasPersistedCalculatorRun(user) {
  if (!user) return false;
  const lr = user.last_calorie_result;
  if (lr && Number.isFinite(Number(lr.bmr)) && Number.isFinite(Number(lr.tdee))) return true;
  const cp = user.calculator_profile;
  if (cp && typeof cp === "object") {
    const hasAnyInput = ["age", "weight", "height", "weight_lb"].some((k) => {
      const v = cp[k];
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
    if (hasAnyInput) return true;
  }
  return false;
}

export default function CalorieCalculator() {
  const { user, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setupMode = searchParams.get("setup") === "1";

  const [form, setForm] = useState(() => getSavedCalculatorForm(user));
  const [result, setResult] = useState(() => user?.last_calorie_result || null);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [setupLeaving, setSetupLeaving] = useState(false);

  const calculate = async () => {
    const age = parseFloat(form.age);
    const heightInches = (parseFloat(form.height_ft || 0) * 12) + parseFloat(form.height_in || 0);
    const weightKg = form.unit === "metric"
      ? parseFloat(form.weight)
      : parseFloat(form.weight_lb) * 0.45359237;
    const heightCm = form.unit === "metric"
      ? parseFloat(form.height)
      : heightInches * 2.54;

    if (!age || !weightKg || !heightCm) {
      setError("Please fill out all fields.");
      setResult(null);
      return;
    }

    setError(null);
    setSaveMessage("");
    const bmr = calculateBMR(weightKg, heightCm, age, form.gender);
    const tdee = calculateTDEE(bmr, form.activity);
    const target = calculateTarget(tdee, form.goal);
    const macros = calculateMacros(target, weightKg);
    const calorieResult = { bmr, tdee, target, macros };

    setResult(calorieResult);

    if (!user) {
      setSaveMessage("Log in to save this target to your nutrition diary.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        calculator_profile: form,
        calorie_result: calorieResult,
      });
      setSaveMessage(
        setupMode
          ? "Target saved. Next up: your workout plan."
          : "Saved to your profile and nutrition diary."
      );
    } catch (err) {
      setSaveMessage(`Save failed: ${err.message || "Unknown error"}. Please check database columns.`);
    } finally {
      setSaving(false);
    }
  };

  const goToWorkoutSetup = () => {
    setSetupLeaving(true);
    window.setTimeout(() => {
      navigate("/workout?setup=1", { replace: true });
    }, 520);
  };

  const saveOk =
    saveMessage.startsWith("Target saved") ||
    saveMessage.startsWith("Saved to your profile");

  const showSetupContinue =
    setupMode &&
    result &&
    user &&
    !saving &&
    (saveOk || (userHasPersistedCalculatorRun(user) && !saveMessage.includes("Save failed")));

  const showSkipIfAlreadyHasTarget =
    setupMode &&
    user &&
    userHasPersistedCalculatorRun(user) &&
    !result;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 relative">
      {setupLeaving && <SetupTransitionOverlay message="Opening your workout planner" />}

      {/* Header */}
      <div className="mb-8">
        {setupMode && <SetupFlowProgress activeStep={1} />}
        <h1 className="font-['Plus_Jakarta_Sans'] font-black text-4xl text-[#111] mb-1">Calorie Calculator</h1>
        <p className="text-gray-500 font-medium">
          {setupMode
            ? "Step 1 of 2 — lock in your daily calories and macros."
            : "Formula-based daily targets in seconds."}
        </p>
      </div>

      {showSkipIfAlreadyHasTarget && (
        <div className="mb-6 rounded-3xl border border-[#EF4444]/20 bg-[#FEF2F2] px-5 py-4 text-sm font-semibold text-[#111]">
          <p className="mb-3">You already have a saved calorie target. Continue to build your AI workout plan.</p>
          <button type="button" onClick={goToWorkoutSetup} className="btn-brand text-sm py-3 px-6">
            Continue to workout planner
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Unit toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#F7F9FC] p-1 rounded-2xl inline-flex border border-gray-200">
          {[{ value: "metric", label: "Metric (kg, cm)" }, { value: "imperial", label: "Imperial (lb, ft)" }].map(u => (
            <button
              key={u.value}
              onClick={() => setForm({ ...form, unit: u.value })}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                form.unit === u.value
                  ? "bg-white shadow-sm text-[#EF4444] border border-gray-200"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] border border-gray-100 p-8 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Age */}
          <div>
            <label className="block text-[#111] text-sm font-bold mb-2">Age</label>
            <input type="number" placeholder="Years" value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              className={inputClass} />
          </div>

          {/* Weight / Height */}
          {form.unit === "metric" ? (
            <>
              <div>
                <label className="block text-[#111] text-sm font-bold mb-2">Weight (kg)</label>
                <input type="number" placeholder="e.g. 75" value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-[#111] text-sm font-bold mb-2">Height (cm)</label>
                <input type="number" placeholder="e.g. 178" value={form.height}
                  onChange={e => setForm({ ...form, height: e.target.value })}
                  className={inputClass} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[#111] text-sm font-bold mb-2">Weight (lbs)</label>
                <input type="number" placeholder="e.g. 165" value={form.weight_lb}
                  onChange={e => setForm({ ...form, weight_lb: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[#111] text-sm font-bold mb-2">Ft</label>
                  <input type="number" placeholder="5" value={form.height_ft}
                    onChange={e => setForm({ ...form, height_ft: e.target.value })}
                    className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className="block text-[#111] text-sm font-bold mb-2">In</label>
                  <input type="number" placeholder="10" value={form.height_in}
                    onChange={e => setForm({ ...form, height_in: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
            </>
          )}

          {/* Gender */}
          <div>
            <label className="block text-[#111] text-sm font-bold mb-2">Gender</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={selectClass}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-[#111] text-sm font-bold mb-2">Activity Level</label>
            <select value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} className={selectClass}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="very">Very Active</option>
              <option value="athlete">Athlete</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-[#111] text-sm font-bold mb-2">Goal</label>
            <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} className={selectClass}>
              <option value="lose">Lose Weight</option>
              <option value="recomp">Lose Fat & Gain Muscle</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Muscle</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black">!</span>
            {error}
          </div>
        )}

        <button
          onClick={calculate}
          disabled={saving}
          className="btn-brand w-full justify-center text-base mt-6"
        >
          {saving ? "Saving Target..." : "Calculate Target"}
        </button>

        {saveMessage && (
          <div className="mt-4 bg-[#F7F9FC] border border-gray-200 text-gray-600 px-4 py-3 rounded-2xl text-sm font-semibold">
            {saveMessage}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Key numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Basal Metabolic Rate", value: Math.round(result.bmr), unit: "kcal", bg: "bg-[#FEF2F2]", text: "text-[#EF4444]" },
              { label: "Total Daily Energy", value: result.tdee, unit: "kcal", bg: "bg-[#EFF6FF]", text: "text-[#6EB5FF]" },
              { label: "Your Daily Target", value: result.target, unit: "kcal", bg: "bg-[#EF4444]", text: "text-white", sub: "text-white/80" },
            ].map(card => (
              <div key={card.label} className={`${card.bg} rounded-3xl p-6 text-center`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${card.sub || card.text}`}>{card.label}</p>
                <p className={`font-['Plus_Jakarta_Sans'] font-black text-4xl ${card.text}`}>
                  {card.value} <span className="text-lg font-semibold opacity-70">{card.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Macro breakdown */}
          <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] border border-gray-100 p-8">
            <h2 className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-[#111] mb-6">Macro Breakdown</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 flex justify-center">
                <PieChart width={220} height={200}>
                  <Pie
                    data={[
                      { name: "Protein", value: result.macros.protein_g * 4 },
                      { name: "Carbs",   value: result.macros.carbs_g * 4 },
                      { name: "Fat",     value: result.macros.fat_g * 9 },
                    ]}
                    cx={105} cy={90} innerRadius={55} outerRadius={80}
                    dataKey="value" stroke="none" paddingAngle={4}
                  >
                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [`${Math.round(v / (name === "Fat" ? 9 : 4))}g (${v} kcal)`, name]}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "12px" }} />
                </PieChart>
              </div>

              <div className="flex-1 w-full space-y-3">
                {[
                  { label: "Protein", value: result.macros.protein_g, color: "#EF4444", bg: "bg-[#FEF2F2]" },
                  { label: "Carbs",   value: result.macros.carbs_g,   color: "#6EB5FF", bg: "bg-[#EFF6FF]" },
                  { label: "Fat",     value: result.macros.fat_g,     color: "#FFD95A", bg: "bg-[#FFFBEB]" },
                ].map(m => (
                  <div key={m.label} className={`flex items-center justify-between ${m.bg} rounded-2xl px-5 py-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                      <span className="font-semibold text-[#111] text-sm">{m.label}</span>
                    </div>
                    <span className="font-['Plus_Jakarta_Sans'] font-black text-xl text-[#111]">{m.value}g</span>
                  </div>
                ))}

                {result.notes && (
                  <div className="bg-[#F7F9FC] border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-500 font-medium leading-relaxed">
                    💡 {result.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {showSetupContinue && (
            <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-[#F7F9FC] p-6 sm:p-8 shadow-[0_8px_40px_rgba(239,68,68,0.12)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#EF4444] mb-1">Next step</p>
                  <p className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-[#111] leading-tight">
                    Forge your AI workout plan
                  </p>
                  <p className="text-gray-500 font-medium text-sm mt-1 max-w-md">
                    We will tailor sessions to your goal, schedule, and equipment.
                  </p>
                </div>
                <button type="button" onClick={goToWorkoutSetup} className="btn-brand shrink-0 justify-center text-base px-8">
                  Continue
                  <span className="material-symbols-outlined text-base">fitness_center</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
