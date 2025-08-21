import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, TrendingUp, UserPlus } from "lucide-react";

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  similarity: number;
  userPrompt: string;
  originalPrompt: string;
  onRegister: () => void;
  onLogin: () => void;
  feedback?: string;
  error?: string | null;
}

export default function ScoreModal({
  isOpen,
  onClose,
  score,
  similarity,
  userPrompt,
  originalPrompt,
  onRegister,
  onLogin,
  feedback,
  error,
}: ScoreModalProps) {
  // Fix for backend similarity calculation error - normalize similarity to 0-100 scale
  const similarityPercentage = Math.min(similarity * 100, 100);

  const getScoreColor = (similarityPercent: number) => {
    if (similarityPercent >= 80) return "text-green-500";
    if (similarityPercent >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (similarityPercent: number) => {
    if (similarityPercent >= 90) return "Outstanding!";
    if (similarityPercent >= 80) return "Great job!";
    if (similarityPercent >= 60) return "Good effort!";
    if (similarityPercent >= 40) return "Keep trying!";
    return "Practice makes perfect!";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-gray-900 overflow-y-scroll max-h-[80vh]">
        {error ? (
          // Error state - user already scored or rate limited
          <>
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                Ready to Level Up?
              </DialogTitle>
              <DialogDescription className="text-center">
                {error}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Benefits of registering */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Create a free account to:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Track your progress and improve
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Compete on global leaderboards
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Save your current score automatically
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          // Success state - show score
          <>
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-3 rounded-full ${
                    similarityPercentage >= 80
                      ? "bg-green-100 dark:bg-green-900"
                      : similarityPercentage >= 60
                      ? "bg-yellow-100 dark:bg-yellow-900"
                      : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  <Trophy
                    className={`w-8 h-8 ${getScoreColor(similarityPercentage)}`}
                  />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                {getScoreMessage(similarityPercentage)}
              </DialogTitle>
              <DialogDescription className="text-center">
                {feedback || "Your prompt similarity score"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Score Display */}
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getScoreColor(
                    similarityPercentage
                  )}`}
                >
                  {/* Fix for backend similarity calculation error - clamp to 100% max */}
                  {similarityPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Similarity Score
                </div>
              </div>

              {/* Points Earned */}
              <div className="flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">+{score} points earned</span>
              </div>

              {/* Prompts Comparison */}
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Your Prompt:
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    "{userPrompt}"
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    Original Prompt:
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    "{originalPrompt}"
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Call to Action - Show for both success and error states */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error
              ? "Ready to continue playing?"
              : "Want to track your progress?"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {error
              ? "Create an account to play unlimited times and save your scores!"
              : "Create an account to save your scores, track improvements, and climb the leaderboards!"}
          </p>
          <Button
            onClick={onRegister}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Free Account
          </Button>
          
          {/* Login Section */}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={onLogin}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all duration-200"
              >
                Log in
              </button>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            {error ? "Close" : "Continue as Guest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
