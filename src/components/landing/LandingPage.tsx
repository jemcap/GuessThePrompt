import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50
      to-white"
    >
      {/* Hero Section */}
      <section
        className="h-[80vh] flex items-center justify-center container mx-auto px-4 py-20 
     text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-5xl md:text-6xl font-bold 
     text-gray-900 mb-6"
          >
            Master the Art of <span>Prompt Engineering</span>
          </h1>
          <p
            className="text-xl text-gray-600 mb-8 
     leading-relaxed"
          >
            GuessThePrompt is a gamified learning platform where you
            reverse-engineer AI prompts. See an AI-generated outcome and figure
            out the prompt that created it. Improve your prompt engineering
            skills through interactive challenges and real-time feedback.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/play")}
              className="px-8 py-3 bg-blue-600 
     text-white font-semibold rounded-lg hover:bg-blue-700 
     transition-colors"
            >
              Start Playing
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="px-8 py-3 border-2 
     border-gray-300 text-gray-700 font-semibold rounded-lg 
     hover:border-gray-400 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold text-center 
     text-gray-900 mb-4"
          >
            How It Works
          </h2>
          <p
            className="text-lg text-gray-600 text-center 
     mb-12 max-w-3xl mx-auto"
          >
            Learn by doing! Watch how GuessThePrompt helps you develop intuition
            for crafting effective AI prompts.
          </p>

          {/* Video Container */}
          <div
            className="bg-gray-900 rounded-xl shadow-2xl 
     overflow-hidden aspect-video max-w-4xl mx-auto"
          >
            <div
              className="w-full h-full flex items-center 
     justify-center bg-gradient-to-br from-gray-800 to-gray-900"
            >
              <div className="text-center">
                <div
                  className="w-20 h-20 mx-auto mb-4 
     rounded-full bg-gray-700 flex items-center justify-center"
                >
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">
                  Video demonstration coming soon
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  See the app in action
                </p>
              </div>
            </div>
          </div>

          {/* Feature Steps */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 
     bg-blue-100 rounded-full flex items-center justify-center"
              >
                <span
                  className="text-2xl font-bold 
     text-blue-600"
                >
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">See the Outcome</h3>
              <p className="text-gray-600">
                View an AI-generated text, image, or code snippet
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 
     bg-purple-100 rounded-full flex items-center justify-center"
              >
                <span
                  className="text-2xl font-bold 
     text-purple-600"
                >
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Write Your Prompt</h3>
              <p className="text-gray-600">
                Craft a prompt that would produce that outcome
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 
     bg-green-100 rounded-full flex items-center justify-center"
              >
                <span
                  className="text-2xl font-bold 
     text-green-600"
                >
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Score</h3>
              <p className="text-gray-600">
                Receive points based on similarity to the original prompt
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
