import { Link, useLocation } from "react-router-dom";
import Stats from "./Stats";

function Header() {
  const location = useLocation();
  const isGamePage = location.pathname === "/play";

  return (
    <>
      <header className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
        <div className="flex justify-between  w-full items-center gap-2 align-elements">
          <div>
            <Link to="/">
              <h1 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                GuessThePrompt
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">

            <Link to="/login">
              <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Register
              </button>
            </Link>
          </div>
        </div>
      </header>
      {isGamePage && (
        <section className="flex w-full justify-end items-center px-6 py-4 bg-white shadow-sm">
          <Stats />
        </section>
      )}
    </>
  );
}

export default Header;
