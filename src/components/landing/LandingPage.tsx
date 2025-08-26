import { useRef, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import TypewriterIntro from "../animations/TypewriterIntro";
import { useIntro } from "../../contexts/IntroContext";
import HeroSection from "./HeroSection";
import ImportanceSection from "./ImportanceSection";
import HowItWorksSection from "./HowItWorksSection";

const LandingPage = () => {
  const purposeSectionRef = useRef<HTMLElement>(null);
  const { hasSeenIntro, markIntroAsSeen } = useIntro();
  const [animationStage, setAnimationStage] = useState<"intro" | "content">(
    hasSeenIntro ? "content" : "intro"
  );

  const scrollToPurpose = () => {
    purposeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleIntroComplete = () => {
    markIntroAsSeen();
    setAnimationStage("content");
  };

  // Override body background for landing page only
  useEffect(() => {
    // Store original background
    const originalBackground = document.body.style.backgroundColor;

    // Set transparent background to allow our gradients to show
    document.body.style.backgroundColor = "transparent";

    // Restore original background when component unmounts
    return () => {
      document.body.style.backgroundColor = originalBackground;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Animated Content Based on Stage */}
      <AnimatePresence mode="wait">
        {animationStage === "intro" && (
          <TypewriterIntro
            key="intro"
            text="You are a prompting guru"
            onComplete={handleIntroComplete}
            delay={800}
            speed={60}
          />
        )}

        {animationStage === "content" && (
          <div key="content" className="min-h-screen relative overflow-hidden">
            <HeroSection onLearnMoreClick={scrollToPurpose} />
            <ImportanceSection />
            <HowItWorksSection ref={purposeSectionRef} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
