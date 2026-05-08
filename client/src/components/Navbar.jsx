import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="FitForge Logo" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/workout"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-semibold text-sm px-4 py-2 rounded-pill transition-colors"
                >
                  Training
                </Link>
                <Link
                  to="/tracker"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-semibold text-sm px-4 py-2 rounded-pill transition-colors"
                >
                  Nutrition
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-brand font-semibold text-sm px-4 py-2 rounded-pill transition-colors ml-2"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-semibold text-sm px-4 py-2 rounded-pill transition-colors"
                >
                  Log in
                </Link>
                <Link to="/register" className="btn-brand text-sm py-2.5 px-5">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
