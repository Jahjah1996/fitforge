import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, startTransition } from "react";
import logo from "../assets/logo.png";

function mobileNavItemClass(active) {
  return [
    "flex min-h-[48px] touch-manipulation items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold transition-colors active:scale-[0.99]",
    active ? "bg-[#FEF2F2] text-[#EF4444]" : "text-gray-700 hover:bg-gray-50",
  ].join(" ");
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMobileNavOpen(false);
    });
  }, [location.pathname, user?.id]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-[100dvh] bg-[#F7F9FC]">
      {/* Fixed header — safe areas for notched phones */}
      <div
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 md:px-8 pt-[max(12px,env(safe-area-inset-top))]"
      >
        <nav
          className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-[999px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-between gap-2 min-h-14 md:min-h-16 px-3 sm:px-4 md:px-6 py-1.5 md:py-0"
          aria-label="Main"
        >
          <Link
            to="/"
            onClick={closeMobileNav}
            className="flex-shrink-0 flex items-center rounded-full p-1 -m-1 min-h-[44px] min-w-[44px] justify-center sm:justify-start touch-manipulation"
          >
            <img src={logo} alt="FitForge" className="h-8 w-auto sm:h-10" />
          </Link>

          {user && (
            <div className="hidden md:flex flex-1 justify-center items-center gap-1 max-w-xl">
              {[
                { path: "/workout", label: "Training" },
                { path: "/tracker", label: "Nutrition" },
                { path: "/calculator", label: "Calculator" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`cursor-pointer touch-manipulation rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
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

          <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 max-w-[160px]">
                  <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 truncate">
                    {user.name?.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={() => {
                    void logout();
                  }}
                  type="button"
                  className="hidden md:flex cursor-pointer touch-manipulation items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors px-3 py-2.5 rounded-full min-h-[44px]"
                >
                  Sign out
                </button>
                <button
                  type="button"
                  className="md:hidden flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileNavOpen((o) => !o)}
                  aria-expanded={mobileNavOpen}
                  aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                >
                  <span className="material-symbols-outlined text-gray-700 text-[26px]">
                    {mobileNavOpen ? "close" : "menu"}
                  </span>
                </button>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="cursor-pointer touch-manipulation text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2.5 rounded-full transition-colors min-h-[44px] inline-flex items-center"
                  >
                    Log in
                  </Link>
                  <Link to="/register" className="btn-brand text-sm py-2.5 px-5">
                    Get started
                  </Link>
                </div>
                <button
                  type="button"
                  className="md:hidden flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileNavOpen((o) => !o)}
                  aria-expanded={mobileNavOpen}
                  aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                >
                  <span className="material-symbols-outlined text-gray-700 text-[26px]">
                    {mobileNavOpen ? "close" : "menu"}
                  </span>
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile menu panel */}
        {mobileNavOpen && (
          <div className="md:hidden mt-2 max-w-6xl mx-auto rounded-3xl border border-gray-100 bg-white shadow-xl overflow-hidden relative z-50 max-h-[min(70vh,calc(100dvh-5.5rem))] flex flex-col">
            <div className="overflow-y-auto overscroll-contain p-2 pb-[max(12px,env(safe-area-inset-bottom))] flex flex-col gap-0.5">
              {user ? (
                <>
                  {[
                    { path: "/workout", label: "Training", icon: "fitness_center" },
                    { path: "/tracker", label: "Nutrition", icon: "restaurant" },
                    { path: "/calculator", label: "Calculator", icon: "calculate" },
                  ].map(({ path, label, icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={closeMobileNav}
                      className={mobileNavItemClass(location.pathname === path)}
                    >
                      <span className="material-symbols-outlined text-[22px] opacity-90">{icon}</span>
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      void logout();
                      closeMobileNav();
                    }}
                    className={`${mobileNavItemClass(false)} w-full text-left text-red-600 hover:bg-red-50`}
                  >
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    onClick={closeMobileNav}
                    className={mobileNavItemClass(location.pathname === "/")}
                  >
                    <span className="material-symbols-outlined text-[22px]">home</span>
                    Home
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMobileNav}
                    className={mobileNavItemClass(location.pathname === "/login")}
                  >
                    <span className="material-symbols-outlined text-[22px]">login</span>
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileNav}
                    className="mt-2 btn-brand w-full justify-center text-base min-h-[48px]"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dimmed backdrop — below nav chrome, above content */}
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] md:hidden touch-manipulation"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      )}

      <main className="min-h-screen pt-[calc(4.25rem+max(12px,env(safe-area-inset-top)))] md:pt-24 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div key={location.pathname} className="ff-page-enter-wrap">
          {children}
        </div>
      </main>
    </div>
  );
}
