// Import the actual types from the API service
import type { DailySubmission } from "../../services/dailyPromptsApi";

interface ScoreMessage {
  title: string;
  message: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface UserInputSectionProps {
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  hasSubmitted: boolean;
  isSubmitting: boolean;
  submission: DailySubmission | null;
  originalPrompt: string;
  challengeId: string;
  onSubmit: () => void;
  getScoreMessage: (score: number) => ScoreMessage;
}

const UserInputSection = ({
  userAnswer,
  setUserAnswer,
  hasSubmitted,
  isSubmitting,
  submission,
  originalPrompt,
  challengeId,
  onSubmit,
  getScoreMessage,
}: UserInputSectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Prompt Guess:
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {hasSubmitted
            ? "Your submitted prompt:"
            : "Enter your best guess for the prompt that created the AI output."}
        </p>
      </div>

      {/* Main Prompt Input Section */}
      <div className="p-4 space-y-4">
        {/* Prompt Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="user-prompt"
              className="text-sm font-medium text-gray-700"
            >
              Answer
            </label>
            <div className="text-xs text-gray-500">
              {hasSubmitted
                ? "Submission locked"
                : `${userAnswer.length}/1000 characters`}
            </div>
          </div>

          <textarea
            id="user-prompt"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={
              hasSubmitted
                ? "You've already submitted for today"
                : "Enter your best guess for the prompt that created this output...\n\nTip: Be specific and detailed. Consider the tone, style, and specific instructions that might have been used."
            }
            className={`w-full h-40 lg:h-64 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
              hasSubmitted || isSubmitting
                ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                : "border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:shadow-sm"
            }`}
            disabled={hasSubmitted || isSubmitting}
            maxLength={1000}
          />
        </div>
        {/* Notes Section */}
        {!hasSubmitted && (
          <div className="border-t border-gray-100 bg-gray-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <label
                  htmlFor="user-notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <span className="text-xs text-gray-500">(Optional)</span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Use this space to analyse the output, brainstorm ideas, or draft
                your prompt before finalising above.
              </p>

              <textarea
                name="user-notes"
                id="user-notes"
                placeholder={`Jot down your thoughts...\n\n• What style or tone does this output have?\n• What specific instructions might have been given?\n• Any patterns or keywords you notice?`}
                className={`w-full h-24 lg:h-32 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
                  hasSubmitted || isSubmitting
                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus:shadow-sm"
                }`}
                disabled={hasSubmitted || isSubmitting}
                maxLength={1000}
              />
            </div>
          </div>
        )}

        {/* Submit Button Area */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            {hasSubmitted && (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Submission completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {hasSubmitted && submission?.score !== undefined && (
              <div className="text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <span className="text-gray-600">Score: </span>
                <span className="font-bold text-blue-600">
                  {submission.score}/1000
                </span>
              </div>
            )}

            {hasSubmitted ? (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium border border-green-200">
                Submitted
              </div>
            ) : (
              <button
                onClick={onSubmit}
                disabled={!userAnswer.trim() || isSubmitting}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                  !userAnswer.trim() || isSubmitting
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Submit Answer</span>
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Score Results Section */}
      {hasSubmitted && submission && submission.score !== undefined && (
        <div className="p-4 space-y-4">
          {/* Personalized Score Message */}
          <div
            className={`p-4 rounded-lg border ${
              getScoreMessage(submission.score).bgColor
            } ${getScoreMessage(submission.score).borderColor}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4
                  className={`font-bold text-lg ${
                    getScoreMessage(submission.score).color
                  }`}
                >
                  {getScoreMessage(submission.score).title}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    getScoreMessage(submission.score).color
                  }`}
                >
                  {getScoreMessage(submission.score).message}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
                    getScoreMessage(submission.score).color
                  }`}
                >
                  {submission.score}
                </div>
                <div className="text-xs text-gray-600">out of 1000</div>
              </div>
            </div>

            {/* Score breakdown visual */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  submission.score >= 900
                    ? "bg-purple-500"
                    : submission.score >= 800
                    ? "bg-green-500"
                    : submission.score >= 700
                    ? "bg-blue-500"
                    : submission.score >= 600
                    ? "bg-indigo-500"
                    : submission.score >= 400
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${(submission.score / 1000) * 100}%` }}
              />
            </div>
          </div>

          {/* Original Prompt Reveal */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-semibold text-yellow-800">
                The Original Prompt
              </h4>
            </div>
            <div className="bg-white p-4 rounded border border-yellow-300">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {originalPrompt}
              </p>
            </div>
            <p className="text-xs text-yellow-700 mt-2 text-center italic">
              Compare this with your guess to see how close you were!
            </p>
          </div>

          {/* Submission details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                <strong>Submitted:</strong>{" "}
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleString()
                  : "Unknown"}
              </span>
              <span className="text-blue-600 font-medium">
                Challenge #{challengeId.replace("day-", "")}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-500 text-center">
                Come back tomorrow for a new prompt challenge and keep improving
                your skills!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInputSection;
