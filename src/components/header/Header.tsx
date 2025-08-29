import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Header() {
  const { user, userStats, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-gray-900/20 backdrop-blur-md backdrop-saturate-150">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            {/* <h1 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
          GuessThePrompt
            </h1> */}
            <img src="/guesstheprompt.png" alt="Logo" className="h-12 invert" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <>
          <Link to="/daily" className="relative group">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 rounded-full text-white font-medium hover:from-amber-500 hover:to-orange-600 transition-all inline-flex items-center gap-1 shadow-lg">
              <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
              >
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
              Daily Challenge
            </span>
          </Link>

          <Link
            to="/practice"
            className="text-gray-300 hover:text-blue-400 font-medium transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Practice
          </Link>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-gray-300 hover:text-white font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span>{user.username}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl border border-gray-700/50 overflow-hidden">
              <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </Link>
            <hr className="my-1 border-gray-700/50" />
            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
                navigate("/");
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-white/10 transition-colors text-left"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
              </div>
            </div>
          )}
            </div>
          ) : (
            <>
          <Link to="/login">
            <button className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl">
              Register
            </button>
          </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
            >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
            </svg>
          ) : (
            <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
            >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
            </svg>
          )}
        </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden border-t border-gray-700/50 bg-gray-900/20 backdrop-blur-md transition-all duration-300 ease-in-out ${
        isMobileMenuOpen
          ? "max-h-screen opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <nav className="px-4 py-4 space-y-2">
        {user ? (
          <>
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-700/30">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{user.username}</p>
            <p className="text-xs text-gray-400">Level {userStats?.level || 0} · {userStats?.totalXP || 0} points</p>
          </div>
            </div>

            {/* Navigation Links */}
            <Link
          to="/daily"
          onClick={() => handleNavigation("/daily")}
          className="flex items-center gap-3 px-3 py-3 text-white bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors backdrop-blur-sm"
            >
          <svg
            className="w-5 h-5 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
          Daily Challenge
            </Link>

            <Link
          to="/practice"
          onClick={() => handleNavigation("/practice")}
          className="flex items-center gap-3 px-3 py-3 text-gray-300 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-colors"
            >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Practice Mode
            </Link>

            <Link
          to="/profile"
          onClick={() => handleNavigation("/profile")}
          className="flex items-center gap-3 px-3 py-3 text-gray-300 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-colors"
            >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profile
            </Link>



            <hr className="my-2 border-gray-700/50" />

            <button
          onClick={() => {
            logout();
            setIsMobileMenuOpen(false);
            navigate("/");
          }}
          className="flex items-center gap-3 w-full px-3 py-3 text-red-400 rounded-lg hover:bg-red-500/10 backdrop-blur-sm transition-colors"
            >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
            </button>
          </>
        ) : (
          <>
            <Link
          to="/login"
          onClick={() => handleNavigation("/login")}
          className="block px-3 py-3 text-center text-gray-300 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-colors font-medium"
            >
          Login
            </Link>
            <Link
          to="/register"
          onClick={() => handleNavigation("/register")}
          className="block px-3 py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all"
            >
          Get Started
            </Link>
          </>
        )}
          </nav>
        </div>
      </header>
    </>
  );
}

export default Header;
