import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      return null;
    }

    try {
      // After sign-up, the DB trigger may insert `profiles` slightly after the session is issued.
      // On slow mobile networks, a single read can return 0 rows; retry briefly instead of failing.
      let profile = null;
      let lastError = null;
      const maxAttempts = 10;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        lastError = error;
        if (data) {
          profile = data;
          break;
        }
        if (error) {
          break;
        }
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, 200 + attempt * 150));
        }
      }

      if (!profile) {
        if (lastError) {
          console.error("Error fetching profile:", lastError);
        }
        // Fallback: keep user logged in with basic info if profile table is missing/empty or not ready yet
        const fallback = { id: sessionUser.id, email: sessionUser.email, name: sessionUser.user_metadata?.name || "" };
        setUser(fallback);
        return fallback;
      }

      // Reconstruct the serialized user shape expected by the frontend
      const fullUser = {
        id: profile.id,
        email: sessionUser.email,
        name: profile.name,
        daily_calorie_target: profile.daily_calorie_target,
        daily_protein_target: profile.daily_protein_target,
        daily_carbs_target: profile.daily_carbs_target,
        daily_fat_target: profile.daily_fat_target,
        calculator_profile: profile.calculator_profile ? JSON.parse(profile.calculator_profile) : null,
        last_calorie_result: profile.last_bmr || profile.last_tdee ? {
          bmr: profile.last_bmr,
          tdee: profile.last_tdee,
          target: profile.daily_calorie_target,
          macros: {
            protein_g: profile.daily_protein_target,
            carbs_g: profile.daily_carbs_target,
            fat_g: profile.daily_fat_target
          }
        } : null,
        workout_profile: profile.workout_profile ? JSON.parse(profile.workout_profile) : null,
        saved_workout_plan: profile.saved_workout_plan ? JSON.parse(profile.saved_workout_plan) : []
      };

      setUser(fullUser);
      return fullUser;
    } catch (err) {
      console.error("refreshUser error:", err);
      // Don't null out the user on a profile fetch failure — fall back to basic info
      if (sessionUser) {
        const fallback = { id: sessionUser.id, email: sessionUser.email, name: sessionUser.user_metadata?.name || "" };
        setUser(fallback);
        return fallback;
      }
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        refreshUser(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await refreshUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [refreshUser]);

  const login = async (email, password) => {
    // Wrap in a 15-second timeout so mobile users aren't stuck on "Signing in..." forever
    const signInPromise = supabase.auth.signInWithPassword({ email, password });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Sign-in timed out. Please check your connection and try again.")), 15000)
    );
    const { error } = await Promise.race([signInPromise, timeoutPromise]);
    if (error) throw error;
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name } // This will trigger the DB function to insert into profiles
      }
    });
    if (error) throw error;
    if (data.session?.user) {
      await refreshUser(data.session.user);
    }
    return { hasSession: Boolean(data.session) };
  };

  const updateProfile = async (updates) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

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

    if (Object.keys(data).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: session.user.id, 
          name: user?.name || session.user.user_metadata?.name || "Athlete",
          ...data 
        });
      
      if (error) throw error;
    }

    return await refreshUser(session.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

