import Stats from "./Stats";

function Header() {
  return (
    <>
      <header className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
        <div className="flex justify-between  w-full items-center gap-2 align-elements">
          <div>
            <h1 className="text-xl font-bold text-gray-900">GuessThePrompt</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Login
            </button>
            <button className=" px-4 py-2 rounded-lg font-medium transition-colors">
              Register
            </button>
          </div>
        </div>
      </header>
      <section className="flex w-full justify-end items-center px-6 py-4 bg-white shadow-sm">
        <Stats />
      </section>
    </>
  );
}

export default Header;
