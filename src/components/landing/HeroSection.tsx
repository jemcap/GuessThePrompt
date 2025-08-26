import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero_bg.jpg";

const ROTATING_PHRASES = [
  "Prompter",
  "Software Developer", 
  "System Architect",
  "AI-Powered Professional",
  "Problem Solver",
  "Data Scientist",
  "Content Creator",
  "Marketing Strategist",
  "Product Manager",
  "UX Designer",
  "Business Analyst",
  "Research Assistant",
  "Technical Writer",
  "Innovation Leader",
  "Digital Strategist"
];

const CarouselText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-8 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"
        >
          {ROTATING_PHRASES[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

interface HeroSectionProps {
  onLearnMoreClick: () => void;
}

const HeroSection = ({ onLearnMoreClick }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section 
      className="relative w-full h-[80vh] flex items-center justify-center mx-auto px-4 py-20 text-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      <div className="max-w-5xl mx-auto relative z-20">
        <motion.div
          className="text-xl font-medium text-gray-100 mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-white">Become a more efficient </span>
          <CarouselText />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Master the Art of{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Prompt Engineering
          </span>
        </motion.h1>

        <motion.p
          className="text-xl text-gray-100 mb-8 leading-relaxed drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          GuessThePrompt is a gamified learning platform where you
          reverse-engineer AI prompts. See an AI-generated outcome and
          figure out the prompt that created it. Improve your prompt
          engineering skills through interactive challenges and
          real-time feedback.
        </motion.p>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            onClick={() => navigate("/daily")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Playing
          </motion.button>
          <motion.button
            onClick={onLearnMoreClick}
            className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;