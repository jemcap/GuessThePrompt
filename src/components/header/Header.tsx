import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between  w-full items-center gap-2 align-elements">
          <div>
            <Link to="/">
              <h1 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                GuessThePrompt
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4 mr-6">
                <Link 
                  to="/daily"
                  className="text-gray-300 hover:text-blue-400 font-medium transition-colors flex items-center gap-1"
                >
                  Daily Challenge
                </Link>
                
              </div>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-300 hover:text-white font-medium transition-colors flex items-center gap-1"
                >
                  {user.username}
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-600 z-10">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                          navigate("/");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-gray-300 hover:text-white font-medium transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors">
                    Register
                  </button>
                </Link>
              </>
            )}
            {/* {user && (
              <Link to="/profile">
                <span className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  {user.username}
                </span>
              </Link>
            )}
            <Link to="/login">
              <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Register
              </button>
            </Link> */}
          </div>
        </div>
      </header>

    </>
  );
}

export default Header;
