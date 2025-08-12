import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AIOutputDisplay from "./AIOutputDisplay";
import UserInputSection from "./UserInputSection";

interface DailyPrompt {
  id: string;
  date: string;
  originalPrompt: string;
  aiOutput: string;
  outputType: "text" | "code";
  difficulty: number;
  category: string;
}

interface UserSubmission {
  promptId: string;
  userPrompt: string;
  submittedAt: string;
  score?: number;
}

const PromptOfTheDay = () => {
  const { user } = useAuth();
  const [dailyPrompt, setDailyPrompt] = useState<DailyPrompt | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<UserSubmission | null>(null);

  // Get today's date as a string for prompt identification
  const getTodayKey = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Generate personalized message based on score
  const getScoreMessage = (score: number) => {
    if (score >= 90) {
      return {
        title: "Incredible!",
        message: "You're a prompt engineering master! That was spot-on.",
        color: "text-purple-800",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      };
    } else if (score >= 80) {
      return {
        title: "Excellent!",
        message: "Outstanding work! You really nailed the essence of this prompt.",
        color: "text-green-800",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    } else if (score >= 70) {
      return {
        title: "Great Job!",
        message: "Solid attempt! You captured most of the key elements.",
        color: "text-blue-800",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      };
    } else if (score >= 60) {
      return {
        title: "Good Effort!",
        message: "Nice try! You're on the right track, keep practicing.",
        color: "text-indigo-800",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200"
      };
    } else if (score >= 40) {
      return {
        title: "Getting There!",
        message: "Good start! Focus on being more specific and detailed next time.",
        color: "text-orange-800",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      };
    } else {
      return {
        title: "Keep Learning!",
        message: "Every expert was once a beginner. Tomorrow's a new chance to improve!",
        color: "text-red-800",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      };
    }
  };

  // Mock daily prompts (in real app, this would come from backend)
  const getDailyPrompt = (dateKey: string): DailyPrompt => {
    // Simple hash to generate consistent prompt for each day
    const prompts: DailyPrompt[] = [
      {
        id: "day-1",
        date: dateKey,
        originalPrompt:
          "You are a creative writing assistant. Write a short story about a coffee shop that only exists on rainy days. The story should be exactly 150 words and have a mysterious, whimsical tone.",
        aiOutput: `The Raindrop Café appears only when the sky weeps. Maria discovered this on a Tuesday, seeking shelter from an unexpected downpour. The weathered sign materialized through the mist: "Open Only During Rain."

Inside, steam rose from countless cups while patrons spoke in hushed whispers. The barista, an elderly woman with silver hair, served coffee that tasted like memories—some sweet, some bitter, all authentic.

"How long have you been here?" Maria asked.

"Since the first rainfall," the woman replied, her eyes twinkling. "We exist between drops, in the spaces where people need comfort most."

Maria sipped her drink, tasting childhood summers and forgotten dreams. When the rain stopped, she found herself standing on an empty street corner, holding only the lingering warmth of the cup and the certainty that she'd return the next time storms gathered overhead.`,
        outputType: "text",
        difficulty: 3,
        category: "Creative Writing",
      },
      {
        id: "day-2",
        date: dateKey,
        originalPrompt:
          "You are a senior React developer. Create a custom hook called useLocalStorage that provides a simple interface for storing and retrieving data from localStorage with TypeScript support. Include error handling and sync with useState.",
        aiOutput: `import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: SetValue<T> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(\`Error setting localStorage key "\${key}":\`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;`,
        outputType: "code",
        difficulty: 4,
        category: "React Development",
      },
    ];

    // Use date hash to select prompt consistently
    const hash = dateKey
      .split("-")
      .reduce((acc, part) => acc + parseInt(part), 0);
    return prompts[hash % prompts.length];
  };

  // Check if user has already submitted for today's prompt
  const checkSubmissionStatus = () => {
    if (!user) return;

    const todayKey = getTodayKey();
    const submissionKey = `submission_${user.id}_${todayKey}`;
    const savedSubmission = localStorage.getItem(submissionKey);

    if (savedSubmission) {
      const parsedSubmission = JSON.parse(savedSubmission);
      setSubmission(parsedSubmission);
      setHasSubmitted(true);
      setUserAnswer(parsedSubmission.userPrompt);
    }
  };

  // Load today's prompt
  useEffect(() => {
    const todayKey = getTodayKey();
    const prompt = getDailyPrompt(todayKey);
    setDailyPrompt(prompt);
    checkSubmissionStatus();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !dailyPrompt || hasSubmitted || !userAnswer.trim()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create submission record
      const newSubmission: UserSubmission = {
        promptId: dailyPrompt.id,
        userPrompt: userAnswer,
        submittedAt: new Date().toISOString(),
        score: Math.floor(Math.random() * 100), // Mock score
      };

      // Save to localStorage (in real app, this would be saved to backend)
      const submissionKey = `submission_${user.id}_${getTodayKey()}`;
      localStorage.setItem(submissionKey, JSON.stringify(newSubmission));

      setSubmission(newSubmission);
      setHasSubmitted(true);
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!dailyPrompt) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Prompt of the Day
            </h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {hasSubmitted && submission && submission.score !== undefined && (
              <div className={`mt-4 p-3 rounded-lg border ${getScoreMessage(submission.score).bgColor} ${getScoreMessage(submission.score).borderColor}`}>
                <div className="flex items-center justify-center gap-3">
                  <span className={`font-medium ${getScoreMessage(submission.score).color}`}>
                    {getScoreMessage(submission.score).title} You scored {submission.score}/100
                  </span>
                </div>
                <p className={`text-sm mt-1 text-center ${getScoreMessage(submission.score).color.replace('800', '600')}`}>
                  Come back tomorrow for a new challenge.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Daily Challenge</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {dailyPrompt.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Difficulty:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < dailyPrompt.difficulty
                          ? "bg-orange-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">One attempt only</div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIOutputDisplay 
            aiOutput={dailyPrompt.aiOutput}
            outputType={dailyPrompt.outputType}
          />
          
          <UserInputSection
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            hasSubmitted={hasSubmitted}
            isSubmitting={isSubmitting}
            submission={submission}
            originalPrompt={dailyPrompt.originalPrompt}
            challengeId={dailyPrompt.id}
            onSubmit={handleSubmit}
            getScoreMessage={getScoreMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default PromptOfTheDay;
