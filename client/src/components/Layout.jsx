import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import logo from "../assets/logo.png";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* ── Floating Pill Navbar ── */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
        <nav className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-[999px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img src={logo} alt="FitForge Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {[
                { path: "/workout", label: "Training" },
                { path: "/tracker", label: "Nutrition" },
                { path: "/calculator", label: "Calculator" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    location.pathname === path
                      ? "bg-[#FEF2F2] text-[#EF4444]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{user.name?.split(" ")[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors px-3 py-2"
                >
                  Sign out
                </button>
                {/* Mobile hamburger */}
                <button
                  className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  <span className="material-symbols-outlined text-gray-600">{mobileOpen ? "close" : "menu"}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-brand text-sm py-2.5 px-5">
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {mobileOpen && user && (
          <div className="md:hidden mt-2 max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-4 flex flex-col gap-1">
            {[
              { path: "/workout", label: "Training", icon: "fitness_center" },
              { path: "/tracker", label: "Nutrition", icon: "restaurant" },
              { path: "/calculator", label: "Calculator", icon: "calculate" },
            ].map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  location.pathname === path
                    ? "bg-[#FEF2F2] text-[#EF4444]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="pt-20 md:pt-24 min-h-screen">
        {children}
      </main>
    </div>
  );
}
