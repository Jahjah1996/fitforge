import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CalorieTracker from "./pages/CalorieTracker";
import CalorieCalculator from "./pages/CalorieCalculator";
import WorkoutGenerator from "./pages/WorkoutGenerator";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-on-surface">Loading...</div>;
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
            <Route path="*" element={<div className="p-10 text-center text-2xl font-bold text-error">404 Not Found</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
