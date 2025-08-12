interface UserSubmission {
  promptId: string;
  userPrompt: string;
  submittedAt: string;
  score?: number;
}

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
  submission: UserSubmission | null;
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
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Prompt Guess:
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {hasSubmitted
            ? "Your submitted prompt:"
            : "What prompt do you think created this output?"}
        </p>
      </div>

      <div className="p-4">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={
        hasSubmitted
          ? "You've already submitted for today"
          : "Enter your prompt here... Be specific and detailed."
          }
          className={`w-full h-32 lg:h-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
        hasSubmitted || isSubmitting
          ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
          : "border-gray-300 bg-white text-gray-900"
          }`}
          disabled={hasSubmitted || isSubmitting}
          maxLength={1000}
        />

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
        Characters: {userAnswer.length}/1000
          </div>

          {hasSubmitted ? (
        <div className="flex items-center gap-4">
          {submission?.score !== undefined && (
            <div className="text-sm">
          <span className="text-gray-600">Score: </span>
          <span className="font-bold text-blue-600">
            {submission.score}/100
          </span>
            </div>
          )}
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
            Submitted
          </div>
        </div>
          ) : (
        <button
          onClick={onSubmit}
          disabled={!userAnswer.trim() || isSubmitting}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            !userAnswer.trim() || isSubmitting
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Submitting...
            </div>
          ) : (
            "Submit Final Answer"
          )}
        </button>
          )}
        </div>

        {hasSubmitted && submission && submission.score !== undefined && (
          <div className="mt-4 space-y-4">
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
          <div className="text-xs text-gray-600">out of 100</div>
            </div>
          </div>

          {/* Score breakdown visual */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            submission.score >= 90
              ? "bg-purple-500"
              : submission.score >= 80
              ? "bg-green-500"
              : submission.score >= 70
              ? "bg-blue-500"
              : submission.score >= 60
              ? "bg-indigo-500"
              : submission.score >= 40
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
          style={{ width: `${submission.score}%` }}
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
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
          <strong>Submitted:</strong>{" "}
          {new Date(submission.submittedAt).toLocaleString()}
            </span>
            <span className="text-blue-600 font-medium">
          Challenge #{challengeId.replace("day-", "")}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-500 text-center">
          Come back tomorrow for a new prompt challenge and keep
          improving your skills!
            </p>
          </div>
        </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInputSection;
