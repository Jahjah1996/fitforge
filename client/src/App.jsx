import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CalorieTracker from "./pages/CalorieTracker";
import CalorieCalculator from "./pages/CalorieCalculator";
import WorkoutGenerator from "./pages/WorkoutGenerator";
import VisionTracker from "./pages/VisionTracker";
import { isSupabaseConfigured } from "./lib/supabase";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <span className="w-10 h-10 border-4 border-gray-200 border-t-[#EF4444] rounded-full animate-spin mb-4"></span>
      <p className="text-gray-500 font-bold">Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4">
        <div className="max-w-xl bg-white border border-gray-100 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] p-8">
          <p className="text-[#EF4444] text-sm font-black uppercase tracking-widest mb-3">
            Deployment setup needed
          </p>
          <h1 className="text-3xl font-black text-[#111] mb-3">
            Supabase environment variables are missing.
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed mb-5">
            Add these variables in Vercel, then redeploy the project:
          </p>
          <div className="bg-[#F7F9FC] rounded-2xl p-4 font-mono text-sm text-[#111] space-y-2 border border-gray-200">
            <div>VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_ANON_KEY</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/workout" element={
              <ProtectedRoute><WorkoutGenerator /></ProtectedRoute>
            } />
            <Route path="/tracker" element={
              <ProtectedRoute><CalorieTracker /></ProtectedRoute>
            } />
            <Route path="/calculator" element={
              <ProtectedRoute><CalorieCalculator /></ProtectedRoute>
            } />
            <Route path="/vision" element={
              <ProtectedRoute><VisionTracker /></ProtectedRoute>
            } />
            <Route path="*" element={<div className="p-10 text-center text-2xl font-bold text-error">404 Not Found</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
