import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function MacroBar({ label, value, target, color, unit = "g" }) {
  const width = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-bold text-[#111]">{label}</span>
        <span className="text-sm font-semibold text-gray-400">{Math.round(value)}/{target}{unit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function CalorieTracker() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const inputRef = useRef(null);

  const dailyTarget = user?.daily_calorie_target || 2000;
  const proteinTarget = user?.daily_protein_target || 150;
  const carbsTarget = user?.daily_carbs_target || 250;
  const fatTarget = user?.daily_fat_target || 70;

  const totalCalories = log.reduce((sum, i) => sum + i.calories, 0);
  const totalProtein  = log.reduce((sum, i) => sum + i.protein_g, 0);
  const totalCarbs    = log.reduce((sum, i) => sum + i.carbs_g, 0);
  const totalFat      = log.reduce((sum, i) => sum + i.fat_g, 0);
  const progress      = dailyTarget > 0 ? Math.min((totalCalories / dailyTarget) * 100, 100) : 0;

  const fetchLog = useCallback(async () => {
    if (!user) return;
    try {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      
      const { data, error: dbError } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())
        .order('date', { ascending: true });
        
      if (dbError) throw dbError;
      setLog(data || []);
    } catch {
      setError("Failed to load today's food log.");
    }
  }, [user]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { fetchLog(); }, [fetchLog]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAdd = async () => {
    if (!input.trim() || !user) return;
    setLoading(true); setError(null);
    try {
      const { data: nutrition, error: aiError } = await supabase.functions.invoke('estimate-calories', {
        body: { foodDescription: input }
      });
      
      if (aiError) throw aiError;

      const { data: newLog, error: dbError } = await supabase.from('food_logs').insert({
        user_id: user.id,
        food_name: nutrition.food_name || input,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fat_g: nutrition.fat_g
      }).select().single();

      if (dbError) throw dbError;

      setLog([...log, newLog]);
      setInput("");
    } catch (err) {
      setError(err?.message?.includes("429")
        ? "AI rate limit reached. Try again in a moment."
        : "Failed to analyze food. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const { error: dbError } = await supabase.from('food_logs').delete().eq('id', id);
      if (dbError) throw dbError;
      setLog(log.filter(i => i.id !== id));
    } catch {
      setError("Failed to delete food. Please try again.");
    }
  };


  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-black text-4xl text-[#111] mb-1">Nutrition Diary</h1>
        <p className="text-gray-500 font-medium">Type what you ate and AI will do the math.</p>
      </div>

      {/* Calorie ring card */}
      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] p-7 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Calories today</p>
            <div className="flex items-baseline gap-1">
              <span className="font-['Plus_Jakarta_Sans'] font-black text-5xl text-[#111]">{totalCalories}</span>
              <span className="text-gray-400 font-semibold text-lg">/ {dailyTarget} kcal</span>
            </div>
          </div>
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#F0F4FF" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="#EF4444" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Plus_Jakarta_Sans'] font-black text-sm text-[#111]">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <MacroBar label="Protein" value={totalProtein} target={proteinTarget} color="#EF4444" />
          <MacroBar label="Carbs"   value={totalCarbs}   target={carbsTarget}   color="#6EB5FF" />
          <MacroBar label="Fat"     value={totalFat}     target={fatTarget}     color="#FFD95A" />
        </div>
      </div>

      {/* Log input */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}
      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.07)] border border-gray-100 p-3 mb-8 flex gap-3 focus-within:ring-2 focus-within:ring-[#EF4444]/30 transition-all">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder='e.g. "2 eggs with toast and orange juice"'
          className="flex-1 px-3 py-2 bg-transparent outline-none text-[#111] text-sm font-medium placeholder-gray-400"
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !input.trim()}
          className="btn-brand text-sm py-3 px-6 disabled:opacity-50 flex-shrink-0"
        >
          {loading ? "Analyzing..." : "Log food"}
        </button>
      </div>

      {/* Today's log */}
      <div>
        <h2 className="font-extrabold text-xl text-[#111] mb-4">Today's log</h2>

        {log.length === 0 && !loading && (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-inner bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-400 text-3xl">restaurant</span>
            </div>
            <p className="text-[#111] font-bold text-lg mb-1">Nothing logged yet</p>
            <p className="text-gray-400 text-sm font-medium">Add your first meal above!</p>
          </div>
        )}

        <div className="space-y-3">
          {log.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-5 flex items-center justify-between hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#EF4444]">restaurant</span>
                </div>
                <div>
                  <p className="font-bold text-[#111] capitalize text-base">{item.food_name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs font-semibold text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded-full">P {item.protein_g}g</span>
                    <span className="text-xs font-semibold text-[#6EB5FF] bg-[#EFF6FF] px-2 py-0.5 rounded-full">C {item.carbs_g}g</span>
                    <span className="text-xs font-semibold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded-full">F {item.fat_g}g</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-['Plus_Jakarta_Sans'] font-black text-xl text-[#111]">{item.calories}</p>
                  <p className="text-gray-400 text-xs font-semibold">kcal</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 transition-colors text-gray-400"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
