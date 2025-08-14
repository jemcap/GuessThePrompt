import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AIOutputDisplay from "./AIOutputDisplay";
import UserInputSection from "./UserInputSection";
import { 
  DailyPromptsApiService, 
  DailyPromptsApiError 
} from "../../services/dailyPromptsApi";
import type { DailyPrompt, DailySubmission } from "../../services/dailyPromptsApi";

// Interfaces are now imported from API service

// Component now uses state variables directly instead of interface

const PromptOfTheDay = () => {
  const { user } = useAuth();
  
  // Core data state
  const [dailyPrompt, setDailyPrompt] = useState<DailyPrompt | null>(null);
  const [submission, setSubmission] = useState<DailySubmission | null>(null);
  
  // UI state
  const [userAnswer, setUserAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate personalized message based on score
  const getScoreMessage = (score: number) => {
    if (score >= 900) { // Adjusted for backend's 1000-point scale
      return {
        title: "Incredible!",
        message: "You're a prompt engineering master! That was spot-on.",
        color: "text-purple-300",
        bgColor: "bg-purple-900/20",
        borderColor: "border-purple-700"
      };
    } else if (score >= 800) {
      return {
        title: "Excellent!",
        message: "Outstanding work! You really nailed the essence of this prompt.",
        color: "text-green-300",
        bgColor: "bg-green-900/20",
        borderColor: "border-green-700"
      };
    } else if (score >= 700) {
      return {
        title: "Great Job!",
        message: "Solid attempt! You captured most of the key elements.",
        color: "text-blue-300",
        bgColor: "bg-blue-900/20",
        borderColor: "border-blue-700"
      };
    } else if (score >= 600) {
      return {
        title: "Good Effort!",
        message: "Pretty good! You're on the right track, keep practicing.",
        color: "text-indigo-300",
        bgColor: "bg-indigo-900/20",
        borderColor: "border-indigo-700"
      };
    } else if (score >= 400) {
      return {
        title: "Getting There!",
        message: "Good start! Focus on being more specific and detailed next time.",
        color: "text-orange-300",
        bgColor: "bg-orange-900/20",
        borderColor: "border-orange-700"
      };
    } else {
      return {
        title: "Keep Learning!",
        message: "Every expert was once a beginner. Tomorrow's a new chance to improve!",
        color: "text-red-300",
        bgColor: "bg-red-900/20",
        borderColor: "border-red-700"
      };
    }
  };

  /**
   * Load today's prompt and user's submission status
   * This replaces the old mock data approach with real API calls
   * Optimized to use the combined data from your backend's single endpoint
   */
  const loadTodaysChallenge = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Your backend returns both prompt and submission data in one call
      // So we'll make one optimized request
      const response = await fetch('http://localhost:3003/api/v1/daily-prompts/today', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Full API response:', data);

      if (data.success && data.data) {
        const { prompt, hasSubmitted, submission } = data.data;
        
        setDailyPrompt(prompt);
        
        if (hasSubmitted && submission) {
          setSubmission(submission);
          setHasSubmitted(true);
          setUserAnswer(submission.userPrompt);
          console.log('User has already submitted:', submission);
        } else {
          console.log('User can submit a new answer');
        }
      } else {
        throw new Error('Invalid response format from API');
      }

    } catch (error) {
      console.error('Failed to load today\'s challenge:', error);
      
      if (error instanceof DailyPromptsApiError) {
        setError(`API Error: ${error.message}`);
      } else {
        setError(`Failed to load today's challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    loadTodaysChallenge();
  }, [user]);

  /**
   * Handle user submission
   * This now calls the real API instead of using mock localStorage
   */
  const handleSubmit = async () => {
    if (!user || !dailyPrompt || hasSubmitted || !userAnswer.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Submit to the backend API for real scoring
      const response = await DailyPromptsApiService.submitGuess(
        userAnswer.trim()
      );

      // Update component state with the real submission data
      setSubmission(response.submission);
      setHasSubmitted(true);

      console.log('Submission successful:', {
        score: response.submission.score,
        breakdown: response.scoreBreakdown,
        message: response.message
      });

    } catch (error) {
      console.error('Failed to submit guess:', error);
      
      if (error instanceof DailyPromptsApiError) {
        setError(`Submission failed: ${error.message}`);
      } else {
        setError('Failed to submit your guess. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-300">Loading today's challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-red-700">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <h2 className="text-lg font-semibold text-red-300 mb-2">
                Unable to Load Challenge
              </h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => loadTodaysChallenge()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No prompt available
  if (!dailyPrompt) {
    return (
      <div className="bg-gray-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-300">
            No challenge available for today.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Prompt of the Day
            </h1>
            <p className="text-gray-300">
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
                    {getScoreMessage(submission.score).title} You scored {submission.score}/{dailyPrompt.maxScore}
                  </span>
                </div>
                <p className={`text-sm mt-1 text-center ${getScoreMessage(submission.score).color.replace('300', '400')}`}>
                  Come back tomorrow for a new challenge.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Info */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Daily Challenge</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {dailyPrompt.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Difficulty:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < dailyPrompt.difficulty
                          ? "bg-orange-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">One attempt only</div>
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
