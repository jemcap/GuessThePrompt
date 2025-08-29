import { useEffect, useState } from "react";
import practicePromptsData from "../data/practicePrompts.json";
import { practicePromptsApiService } from "@/services/practicePromptsApi";

interface PromptComponent {
  role: string;
  task: string;
  context: string;
  reasoning: string;
  outputFormat: string;
  stopConditions: string;
}

interface PracticePrompt {
  id: number;
  title: string;
  difficulty: string;
  output: string;
  components: PromptComponent;
}

interface PromptGroup {
  title: string;
  description: string;
  color: string;
  prompts: PracticePrompt[];
}

const Practice = () => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<PromptComponent>({
    role: "",
    task: "",
    context: "",
    reasoning: "",
    outputFormat: "",
    stopConditions: "",
  });
  const [showResults, setShowResults] = useState(false);
  const [_, setScore] = useState(0);
  const [serviceReady, setServiceReady] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    Record<keyof PromptComponent, boolean>
  >({
    role: false,
    task: false,
    context: false,
    reasoning: false,
    outputFormat: false,
    stopConditions: false,
  });

  useEffect(() => {
    const checkScoringService = async () => {
      try {
        const health = await practicePromptsApiService.checkHealth();
        
        setServiceReady(health.success && health?.data?.ready);
        if (!health.success || !health?.data?.ready) {
          setScoringError("Scoring service is currently unavailable. Please try again later.");
        }
      } catch (error) {
        console.error("❌ API health check failed:", error);
        setServiceReady(false);
        setScoringError("Scoring service is currently unavailable. Please try again later.");
      }
    };

    checkScoringService();
  }, []);


  const promptGroups: Record<string, PromptGroup> =
    practicePromptsData.promptGroups;
  const groupKeys = Object.keys(promptGroups);

  const handleInputChange = (field: keyof PromptComponent, value: string) => {
    setUserInputs((prev) => ({ ...prev, [field]: value }));
  };

  // AI-powered validation using TensorFlow.js Universal Sentence Encoder
  const validateAnswersWithAI = async () => {
    if (!selectedGroup) return;

    const currentPrompt = promptGroups[selectedGroup].prompts[currentPromptIndex];
    const correctAnswers = currentPrompt.components;

    try {
      setIsSubmitting(true);
      setScoringError(null);

      // Call the backend scoring API
      const response = await practicePromptsApiService.evaluateAnswers({
        userInputs,
        expectedAnswers: correctAnswers,
      });

      if (response.success && response.data) {
        const { totalScore, feedback } = response.data;
        
        // Update the UI with AI-calculated scores
        setScore(totalScore);
        setFeedback(feedback);
        setShowResults(true);
      } else {
        throw new Error(response.error || 'Unknown scoring error');
      }
    } catch (error) {
      console.error('❌ AI Scoring failed:', error);
      setScoringError(error instanceof Error ? error.message : 'AI scoring failed');
      
      // Fallback to keyword matching if AI fails
      fallbackValidation();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Original keyword-based validation as fallback
  const fallbackValidation = () => {
    if (!selectedGroup) return;

    const currentPrompt = promptGroups[selectedGroup].prompts[currentPromptIndex];
    const correctAnswers = currentPrompt.components;
    const newFeedback: Record<keyof PromptComponent, boolean> = {} as any;
    let correctCount = 0;

    (Object.keys(userInputs) as Array<keyof PromptComponent>).forEach((key) => {
      const userAnswer = userInputs[key].toLowerCase().trim();
      const correctAnswer = correctAnswers[key].toLowerCase();

      // Check if user's answer contains key concepts from the correct answer
      const keywords = correctAnswer
        .split(" ")
        .filter((word) => word.length > 3);
      const matchedKeywords = keywords.filter((keyword) =>
        userAnswer.includes(keyword)
      );

      const isCorrect = matchedKeywords.length >= keywords.length * 0.5;
      newFeedback[key] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setFeedback(newFeedback);
    setScore(Math.round((correctCount / 6) * 100));
    setShowResults(true);
  };

  const handleSubmit = () => {
    // Use AI scoring if service is ready, otherwise use fallback
    if (serviceReady) {
      validateAnswersWithAI();
    } else {
      fallbackValidation();
    }
  };

  const handleNext = () => {
    if (!selectedGroup) return;

    const groupPrompts = promptGroups[selectedGroup].prompts;
    if (currentPromptIndex < groupPrompts.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
      resetForm();
    }
  };

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex((prev) => prev - 1);
      resetForm();
    }
  };

  const resetForm = () => {
    setUserInputs({
      role: "",
      task: "",
      context: "",
      reasoning: "",
      outputFormat: "",
      stopConditions: "",
    });
    setShowResults(false);
    setScore(0);
    setIsSubmitting(false);
    setScoringError(null);
    setFeedback({
      role: false,
      task: false,
      context: false,
      reasoning: false,
      outputFormat: false,
      stopConditions: false,
    });
  };

  const handleGroupSelect = (groupKey: string) => {
    setSelectedGroup(groupKey);
    setCurrentPromptIndex(0);
    resetForm();
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setCurrentPromptIndex(0);
    resetForm();
  };

  const getGroupColor = (color: string) => {
    const colors = {
      blue: "from-blue-600 to-blue-800 border-blue-500",
      green: "from-green-600 to-green-800 border-green-500",
      purple: "from-purple-600 to-purple-800 border-purple-500",
      pink: "from-pink-600 to-pink-800 border-pink-500",
      indigo: "from-indigo-600 to-indigo-800 border-indigo-500",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Group Selection View
  if (!selectedGroup) {
    return (
      <div className="bg-gray-900 min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Prompt Structure Practice
              </h1>
              <p className="text-gray-300">
                Choose a category to practice breaking down prompts into their
                essential components
              </p>
            </div>
          </div>

          {/* Group Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupKeys.map((groupKey) => {
              const group = promptGroups[groupKey];

              return (
                <div
                  key={groupKey}
                  onClick={() => handleGroupSelect(groupKey)}
                  className={`bg-gradient-to-br ${getGroupColor(
                    group.color
                  )} rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform duration-200 border-2`}
                >
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2">{group.title}</h3>
                    <p className="text-gray-100 mb-4 text-sm">
                      {group.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Practice View
  const currentGroup = promptGroups[selectedGroup];
  const currentPrompt = currentGroup.prompts[currentPromptIndex];

  return (
    <div className="bg-gray-900 min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={handleBackToGroups}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Back to Categories
                </button>
                <span className="text-gray-400">|</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getGroupColor(
                    currentGroup.color
                  )} text-white`}
                >
                  {currentGroup.title}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {currentPrompt.title}
              </h1>
              <p className="text-gray-300 text-sm">
                {currentGroup.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Progress</p>
              <p className="text-lg font-semibold text-white">
                {currentPromptIndex + 1} / {currentGroup.prompts.length}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Output Display */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">AI Output</h3>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                {currentPrompt.output}
              </pre>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Analyse this output and identify the prompt components that would
              generate it.
            </p>
          </div>

          {/* Input Fields */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Identify Prompt Components
            </h3>
            
            {/* Error Display */}
            {scoringError && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  <span className="font-medium">⚠️ Notice:</span> {scoringError} Using fallback scoring method.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {Object.keys(userInputs).map((field) => {
                const key = field as keyof PromptComponent;
                const labels: Record<keyof PromptComponent, string> = {
                  role: "Role",
                  task: "Task",
                  context: "Context",
                  reasoning: "Reasoning",
                  outputFormat: "Output Format",
                  stopConditions: "Stop Conditions",
                };
                const placeholders: Record<keyof PromptComponent, string> = {
                  role: "e.g., You are a helpful assistant, expert, teacher...",
                  task: "e.g., analyse, summarise, explain, create, solve...",
                  context:
                    "e.g., background information, constraints, scenario...",
                  reasoning:
                    "e.g., think step by step, consider alternatives, explain logic...",
                  outputFormat:
                    "e.g., bullet points, JSON, paragraph, table...",
                  stopConditions:
                    "e.g., don't include personal info, avoid speculation...",
                };

                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {labels[key]}
                      {showResults && (
                        <span
                          className={`ml-2 text-xs ${
                            feedback[key] ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {feedback[key] ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={userInputs[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder={placeholders[key]}
                      disabled={showResults}
                      className={`w-full px-3 py-2 text-sm bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                        showResults
                          ? feedback[key]
                            ? "border-green-600"
                            : "border-red-600"
                          : "border-gray-600"
                      }`}
                    />
                    {showResults && !feedback[key] && (
                      <p className="text-xs text-gray-400 mt-1">
                        Expected: "{currentPrompt.components[key]}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {!showResults ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.values(userInputs).some((v) => !v.trim()) || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{serviceReady ? 'AI Analyzing...' : 'Checking...'}</span>
                    </div>
                  ) : (
                    <span>
                        Check Answers
                    </span>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Try Again
                  </button>
                  {currentPromptIndex < currentGroup.prompts.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                    >
                      Next Challenge
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentPromptIndex === 0}
                className="text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={
                  currentPromptIndex === currentGroup.prompts.length - 1
                }
                className="text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
