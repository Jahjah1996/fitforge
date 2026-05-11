import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out. Please try again.")), 15000));
      await Promise.race([login(email, password), timeoutPromise]);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#F7F9FC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-[28px] shadow-[0_4px_40px_rgba(0,0,0,0.08)] p-6 sm:p-10">
          <div className="text-center mb-8">
            <img src={logo} alt="FitForge Logo" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="font-extrabold text-[28px] text-[#111] mb-2">Welcome back</h1>
            <p className="text-gray-500 text-sm font-medium">Sign in to continue your journey.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-semibold flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#111] text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                className="w-full bg-[#F7F9FC] border border-gray-200 text-[#111] px-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 transition-all placeholder-gray-400 text-sm font-medium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[#111] text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                className="w-full bg-[#F7F9FC] border border-gray-200 text-[#111] px-4 py-3.5 rounded-2xl focus:outline-none focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 transition-all placeholder-gray-400 text-sm font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full justify-center text-base mt-2"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm font-medium mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#EF4444] font-bold hover:underline">
              Get started free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
