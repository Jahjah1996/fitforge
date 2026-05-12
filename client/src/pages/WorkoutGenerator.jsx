import { useState } from "react";
import Camera from "../components/Camera";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function getExerciseType(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.includes("squat")) return "squat";
  if (lower.includes("push") || lower.includes("push-up")) return "pushup";
  return null;
}

const SVG_ALLOWED_ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
]);

const SVG_ALLOWED_ATTRIBUTES = new Set([
  "viewBox",
  "width",
  "height",
  "fill",
  "stroke",
  "strokeWidth",
  "stroke-width",
  "strokeLinecap",
  "stroke-linecap",
  "strokeLinejoin",
  "stroke-linejoin",
  "strokeMiterlimit",
  "stroke-miterlimit",
  "strokeDasharray",
  "stroke-dasharray",
  "strokeDashoffset",
  "stroke-dashoffset",
  "opacity",
  "fillOpacity",
  "fill-opacity",
  "strokeOpacity",
  "stroke-opacity",
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
  "transform",
]);

const SVG_DANGEROUS_VALUE = /(?:javascript:|data:|vbscript:|url\s*\(|<|>)/i;
const GENERATE_TIMEOUT_MS = 90000;
const SAVE_TIMEOUT_MS = 15000;

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function getReadableError(err, fallback) {
  if (err?.context) {
    try {
      const payload = await err.context.clone().json();
      if (payload?.error) return payload.error;
      if (payload?.message) return payload.message;
    } catch {
      try {
        const text = await err.context.clone().text();
        if (text) return text;
      } catch {
        // Use the generic message below.
      }
    }
  }

  return err?.message || fallback;
}

function normalizeWorkoutPlan(rawPlan) {
  if (!Array.isArray(rawPlan)) {
    throw new Error("Invalid workout plan format returned from AI.");
  }

  const normalized = rawPlan
    .map((day, dayIndex) => {
      const exercises = Array.isArray(day?.exercises)
        ? day.exercises
            .map((exercise) => ({
              name: String(exercise?.name || "").trim(),
              sets: exercise?.sets || 3,
              reps: String(exercise?.reps || "8-12"),
              rest_seconds: Number.isFinite(Number(exercise?.rest_seconds))
                ? Number(exercise.rest_seconds)
                : 60,
              form_tip: String(exercise?.form_tip || "Move with control and keep your form steady."),
              svg_icon: typeof exercise?.svg_icon === "string" ? exercise.svg_icon : "",
            }))
            .filter((exercise) => exercise.name)
        : [];

      return {
        day: String(day?.day || `Day ${dayIndex + 1}`),
        muscle_group: String(day?.muscle_group || day?.focus || "Training"),
        completed: Boolean(day?.completed),
        exercises,
      };
    })
    .filter((day) => day.exercises.length > 0);

  if (!normalized.length) {
    throw new Error("The AI returned a workout without usable exercises. Please try generating again.");
  }

  return normalized;
}

function sanitizeSVG(svg) {
  if (!svg) return "";

  const parser = new DOMParser();
  const document = parser.parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;

  if (root.nodeName === "parsererror" || root.nodeName.toLowerCase() !== "svg") {
    return "";
  }

  const sanitizeNode = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return true;

    const tagName = node.tagName;
    if (!SVG_ALLOWED_ELEMENTS.has(tagName)) {
      node.remove();
      return false;
    }

    [...node.attributes].forEach((attribute) => {
      const name = attribute.name;
      const value = attribute.value.trim();
      if (
        name.toLowerCase().startsWith("on") ||
        !SVG_ALLOWED_ATTRIBUTES.has(name) ||
        SVG_DANGEROUS_VALUE.test(value)
      ) {
        node.removeAttribute(name);
      }
    });

    [...node.childNodes].forEach(sanitizeNode);
    return true;
  };

  sanitizeNode(root);
  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("focusable", "false");

  return new XMLSerializer().serializeToString(root);
}

function ExerciseIcon({ svg, className, fallbackClassName = "text-[#EF4444]" }) {
  const safeSvg = sanitizeSVG(svg);

  if (safeSvg) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: safeSvg }}
      />
    );
  }

  return (
    <span className={`material-symbols-outlined ${fallbackClassName}`}>
      fitness_center
    </span>
  );
}

const DEFAULT_WORKOUT_FORM = {
  goal: "build muscle",
  level: "intermediate",
  equipment: "dumbbells",
  daysPerWeek: "5",
  sessionLength: "45",
  workoutLocation: "gym",
  workoutStyle: "balanced",
  cardioPreference: "light",
  focusAreas: ["full body"],
  limitations: "",
  notes: "",
};

const FOCUS_OPTIONS = [
  { value: "full body", label: "Full Body" },
  { value: "upper body", label: "Upper Body" },
  { value: "lower body", label: "Lower Body" },
  { value: "core", label: "Core" },
  { value: "mobility", label: "Mobility" },
  { value: "strength", label: "Strength" },
  { value: "conditioning", label: "Conditioning" },
  { value: "glutes", label: "Glutes" },
];

const selectClass =
  "w-full bg-[#F7F9FC] border border-gray-200 text-[#111] px-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 transition-all text-sm font-semibold cursor-pointer appearance-none";

const textareaClass =
  "w-full min-h-24 bg-[#F7F9FC] border border-gray-200 text-[#111] px-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 transition-all placeholder-gray-400 text-sm font-medium resize-y";

function getSavedWorkoutForm(user) {
  const profile = user?.workout_profile;

  return {
    ...DEFAULT_WORKOUT_FORM,
    ...profile,
    focusAreas: Array.isArray(profile?.focusAreas)
      ? [...profile.focusAreas]
      : [...DEFAULT_WORKOUT_FORM.focusAreas],
  };
}

function getSavedWorkoutPlan(user) {
  try {
    return Array.isArray(user?.saved_workout_plan) && user.saved_workout_plan.length
      ? normalizeWorkoutPlan(user.saved_workout_plan)
      : null;
  } catch {
    return null;
  }
}

export default function WorkoutGenerator() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => getSavedWorkoutForm(user));
  const [plan, setPlan] = useState(() => getSavedWorkoutPlan(user));
  const [showForm, setShowForm] = useState(() => !getSavedWorkoutPlan(user));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const toggleFocusArea = (area) => {
    setForm((current) => {
      const hasArea = current.focusAreas.includes(area);
      return {
        ...current,
        focusAreas: hasArea
          ? current.focusAreas.filter(item => item !== area)
          : [...current.focusAreas, area],
      };
    });
  };

  const handleGenerate = async () => {
    if (!user) {
      setError("Please log in to generate a workout.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const generatePromise = async () => {
        const { data: newPlan, error: aiError } = await supabase.functions.invoke('generate-workout', {
          body: form
        });
        if (aiError) throw aiError;
        return normalizeWorkoutPlan(newPlan);
      };

      const newPlan = await withTimeout(
        generatePromise(),
        GENERATE_TIMEOUT_MS,
        "Workout generation timed out. Please try again with fewer days or shorter notes."
      );
      
      setPlan(newPlan);
      setShowForm(false);
      
      // Save it to the user's profile with a separate shorter timeout
      await withTimeout(
        updateProfile({
          workout_profile: form,
          saved_workout_plan: newPlan
        }),
        SAVE_TIMEOUT_MS,
        "Plan generated, but saving to your profile timed out."
      );

    } catch (err) {
      console.error("AI Generation error:", err);
      const errorMsg = await getReadableError(err, "Failed to generate plan. Please try again.");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = (day) => { setActiveDay(day); setCurrentExerciseIndex(0); window.scrollTo(0, 0); };
  const nextExercise = async () => {
    if (!activeDay?.exercises?.length) {
      setActiveDay(null);
      return;
    }

    if (currentExerciseIndex < activeDay.exercises.length - 1) {
      setCurrentExerciseIndex(p => p + 1);
    } else {
      const dayIndex = plan.findIndex(d => d.day === activeDay.day);
      if (dayIndex !== -1 && !plan[dayIndex].completed) {
        const newPlan = [...plan];
        newPlan[dayIndex] = { ...newPlan[dayIndex], completed: true };
        setPlan(newPlan);
        if (user) {
          await updateProfile({ saved_workout_plan: newPlan });
        }
      }
      setActiveDay(null);
    }
  };

  // ── Active workout ───────────────────────────────────────────────────────────
  if (activeDay) {
    const ex = activeDay.exercises?.[currentExerciseIndex];
    if (!ex) {
      return (
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <h1 className="font-black text-2xl text-[#111] mb-2">Workout unavailable</h1>
            <p className="text-gray-500 font-medium mb-6">This workout day did not include any usable exercises.</p>
            <button onClick={() => setActiveDay(null)} className="btn-brand justify-center">
              Back to plan
            </button>
          </div>
        </div>
      );
    }
    const aiType = getExerciseType(ex.name);

    return (
      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* back + badge */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setActiveDay(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#111] font-semibold transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span> Exit
          </button>
          <span className="bg-[#FEF2F2] text-[#EF4444] text-xs font-bold px-4 py-1.5 rounded-full">
            {activeDay.day} — {activeDay.muscle_group}
          </span>
        </div>

        {/* Exercise card */}
        <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] p-8 text-center mb-6 border border-gray-100">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
            Exercise {currentExerciseIndex + 1} / {activeDay.exercises.length}
          </p>
          <div className="w-full h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-[#EF4444] rounded-full transition-all duration-500"
              style={{ width: `${((currentExerciseIndex + 1) / activeDay.exercises.length) * 100}%` }}
            />
          </div>

          <h1 className="font-black text-3xl text-[#111] mb-6">{ex.name}</h1>

          <div className="w-32 h-32 mx-auto mb-8 bg-[#F7F9FC] rounded-3xl p-4 flex items-center justify-center">
            <ExerciseIcon
              svg={ex.svg_icon}
              className="svg-container w-full h-full flex items-center justify-center"
              fallbackClassName="text-[#EF4444] text-5xl"
            />
          </div>



          <div className="flex justify-center gap-4 mb-6">
            {[
              { label: "Sets", value: ex.sets, color: "bg-[#FEF2F2] text-[#EF4444]" },
              { label: "Reps", value: ex.reps, color: "bg-[#EEF2FF] text-[#6366F1]" },
              { label: "Rest", value: `${ex.rest_seconds}s`, color: "bg-[#FFFBEB] text-[#F59E0B]" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-2xl px-6 py-4 text-center min-w-[80px]`}>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{s.label}</p>
                <p className="font-['Plus_Jakarta_Sans'] font-black text-2xl">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 bg-gray-50 px-4 py-3 rounded-2xl">
            <span className="material-symbols-outlined text-[#F59E0B] text-lg flex-shrink-0 mt-0.5">tips_and_updates</span>
            <p className="text-gray-500 text-sm font-medium italic">{ex.form_tip}</p>
          </div>
        </div>

        {aiType ? (
          <div className="mb-6"><Camera exercise={aiType} /></div>
        ) : (
          <div className="bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-3xl p-6 text-center mb-6">
            <p className="font-bold text-[#111] mb-1">Manual Tracking</p>
            <p className="text-gray-500 text-sm font-medium">Count your reps manually for this exercise.</p>
          </div>
        )}

        <button
          onClick={nextExercise}
          className="btn-brand w-full justify-center text-base"
        >
          {currentExerciseIndex < activeDay.exercises.length - 1 ? "Complete & next" : "Finish workout"}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    );
  }

  // ── Generator ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-black text-4xl text-[#111] mb-1">AI Workout Planner</h1>
          <p className="text-gray-500 font-medium">Get a personalized routine built by Gemini AI.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-dark text-sm px-6 py-2.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span> New Plan
          </button>
        )}
      </div>

      {/* Config card */}
      {showForm && (
      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] border border-gray-100 p-5 md:p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[
            {
              label: "Primary Goal", key: "goal",
              options: [
                { value: "lose weight", label: "Lose Weight" },
                { value: "build muscle", label: "Build Muscle" },
                { value: "improve endurance", label: "Improve Endurance" },
                { value: "get stronger", label: "Get Stronger" },
              ]
            },
            {
              label: "Fitness Level", key: "level",
              options: [
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]
            },
            {
              label: "Equipment", key: "equipment",
              options: [
                { value: "no equipment", label: "Bodyweight" },
                { value: "dumbbells", label: "Dumbbells" },
                { value: "kettlebells", label: "Kettlebells" },
                { value: "full gym", label: "Full Gym" },
              ]
            },
            {
              label: "Days / Week", key: "daysPerWeek",
              options: [
                { value: "3", label: "3 Days" },
                { value: "4", label: "4 Days" },
                { value: "5", label: "5 Days" },
                { value: "6", label: "6 Days" },
              ]
            },
            {
              label: "Session Length", key: "sessionLength",
              options: [
                { value: "30", label: "30 Minutes" },
                { value: "45", label: "45 Minutes" },
                { value: "60", label: "60 Minutes" },
                { value: "75", label: "75 Minutes" },
              ]
            },
            {
              label: "Location", key: "workoutLocation",
              options: [
                { value: "home", label: "Home" },
                { value: "gym", label: "Gym" },
                { value: "mixed", label: "Mixed" },
                { value: "outdoors", label: "Outdoors" },
              ]
            },
            {
              label: "Workout Style", key: "workoutStyle",
              options: [
                { value: "balanced", label: "Balanced" },
                { value: "strength", label: "Strength" },
                { value: "hypertrophy", label: "Hypertrophy" },
                { value: "conditioning", label: "Conditioning" },
                { value: "mobility", label: "Mobility" },
              ]
            },
            {
              label: "Cardio", key: "cardioPreference",
              options: [
                { value: "none", label: "None" },
                { value: "light", label: "Light" },
                { value: "moderate", label: "Moderate" },
                { value: "high", label: "High" },
              ]
            },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-[#111] text-sm font-bold mb-2">{field.label}</label>
              <select
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                className={selectClass}
              >
                {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-[#111] text-sm font-bold mb-3">Focus Areas</label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map(area => {
              const active = form.focusAreas.includes(area.value);
              return (
                <button
                  type="button"
                  key={area.value}
                  onClick={() => toggleFocusArea(area.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#FEF2F2] border-[#EF4444]/30 text-[#EF4444]"
                      : "bg-[#F7F9FC] border-gray-200 text-gray-500 hover:text-[#111]"
                  }`}
                >
                  {area.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-[#111] text-sm font-bold mb-2">Limitations or Injuries</label>
            <textarea
              value={form.limitations}
              onChange={e => setForm({ ...form, limitations: e.target.value })}
              placeholder="e.g. Knee pain, no overhead pressing"
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-[#111] text-sm font-bold mb-2">Preferences or Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Prefer dumbbell work, avoid burpees"
              className={textareaClass}
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-brand flex-1 justify-center text-base disabled:opacity-60"
          >
            {loading ? (
              <><span className="animate-spin material-symbols-outlined text-base">autorenew</span> Forging your plan...</>
            ) : (
              "Generate my plan →"
            )}
          </button>
          {plan && (
            <button
              onClick={() => setShowForm(false)}
              disabled={loading}
              className="bg-gray-100 text-gray-600 font-bold rounded-full px-6 py-3 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      )}

      {/* Plan */}
      {plan && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-2xl text-[#111]">
              Your {plan.length}-Day Plan
            </h2>
            <span className="text-xs font-bold text-[#EF4444] bg-[#FEF2F2] px-3 py-1.5 rounded-full">Ready to start</span>
          </div>

          <div className="grid gap-5">
            {plan.map((day, i) => {
              const firstUncompletedIndex = plan.findIndex(d => !d.completed);
              const unlockUpToIndex = firstUncompletedIndex === -1 ? plan.length - 1 : firstUncompletedIndex;
              const isLocked = i > unlockUpToIndex;

              return (
              <div key={i} className={`bg-white rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden transition-shadow ${isLocked ? 'opacity-60 grayscale-[0.2]' : 'hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)]'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 md:px-7 py-4 md:py-5 border-b border-gray-100">
                  <div>
                    <h3 className="font-black text-xl text-[#111] flex items-center">
                      {day.day}
                      {day.completed && <span className="material-symbols-outlined text-green-500 ml-2 text-xl">check_circle</span>}
                    </h3>
                    <p className="text-[#EF4444] text-sm font-bold mt-0.5">{day.muscle_group}</p>
                  </div>
                  {isLocked ? (
                    <button
                      disabled
                      className="bg-gray-100 text-gray-400 font-bold rounded-2xl text-sm py-2.5 px-6 flex items-center gap-2 cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">lock</span> Locked
                    </button>
                  ) : (
                    <button
                      onClick={() => startWorkout(day)}
                      className="btn-brand text-sm py-2.5 px-6"
                    >
                      {day.completed ? "Review →" : "Start →"}
                    </button>
                  )}
                </div>

                <div className="p-5 grid gap-3">
                  {day.exercises.map((ex, j) => {
                    const isAI = getExerciseType(ex.name) !== null;
                    return (
                      <div key={j} className="flex items-center justify-between bg-[#F7F9FC] rounded-2xl p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#FEF2F2] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <ExerciseIcon
                              svg={ex.svg_icon}
                              className="svg-container w-full h-full p-2 flex items-center justify-center"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold text-[#111] text-sm">{ex.name}</p>
                              {isAI && (
                                <span className="text-[10px] font-bold text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#EF4444]/20">
                                  AI tracked
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs font-medium">{ex.form_tip}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-center flex-shrink-0 ml-4">
                          {[
                            { label: "Sets", value: ex.sets },
                            { label: "Reps", value: ex.reps },
                          ].map(s => (
                            <div key={s.label}>
                              <p className="text-gray-400 text-[10px] font-bold uppercase">{s.label}</p>
                              <p className="font-black text-lg text-[#111]">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
