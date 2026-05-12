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
