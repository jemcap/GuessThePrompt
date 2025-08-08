import { useState } from "react";
import Outcome from "../prompt-window/Outcome";
import { set } from "zod";

interface MockChallengeProps {
  id: string;
  originalPrompt: string; // The actual prompt (hidden from user)
  aiOutput: string; // The AI-generated result users see
  outputType: "text" | "code";
  difficulty: number;
  category: string;
}

const GameLayout = () => {
  // Mock data for demonstration
  const [currentPrompt] = useState<MockChallengeProps>({
    id: "1",
    originalPrompt: `You are a senior software architect with 15 years of experience in building scalable web applications. You specialize in microservices architecture and have successfully migrated multiple monolithic applications to microservices.

Context: A startup has a growing monolithic Node.js e-commerce application that's becoming difficult to maintain and scale. They have a team of 5 developers and handle about 10,000 daily active users, expecting to grow 10x in the next year.

Task: Provide a strategic migration plan from monolith to microservices, including specific steps, potential challenges, and recommended technologies. Focus on practical advice that a small team can actually implement.`,
    aiOutput: `## Microservices Migration Strategy for E-commerce Platform

### Phase 1: Preparation & Analysis (Weeks 1-4)

**1. Domain Mapping**
- Identify bounded contexts: User Management, Product Catalog, Order Processing, Payment, Inventory, Notifications
- Document inter-dependencies and data flows
- Priority: Start with least coupled services (typically User Management or Product Catalog)

**2. Current State Assessment**
- Audit database schema for separation points
- Map API endpoints to potential services
- Document shared libraries and utilities

### Phase 2: Strangler Fig Pattern Implementation (Months 2-6)

**Step 1: API Gateway Setup**
- Implement Kong or AWS API Gateway
- Route all client requests through gateway
- Maintain backward compatibility

**Step 2: Extract First Service - User Management**
- Create separate database/schema
- Implement REST API with JWT authentication
- Use event streaming (Kafka/RabbitMQ) for data sync
- Gradual traffic migration using feature flags

**Technologies Recommended:**
- **Containerization:** Docker + Kubernetes (use managed services like EKS)
- **Service Mesh:** Istio for inter-service communication
- **Messaging:** RabbitMQ for async communication
- **Monitoring:** Prometheus + Grafana, distributed tracing with Jaeger

### Critical Challenges to Anticipate:

1. **Data Consistency**: Implement Saga pattern for distributed transactions
2. **Team Cognitive Load**: Max 2 services per developer initially
3. **Testing Complexity**: Invest in contract testing (Pact) early
4. **Latency**: Expect 20-30ms overhead per service hop

### Success Metrics:
- Deployment frequency per service (target: daily)
- Mean time to recovery (target: <15 min)
- Service autonomy score (independent deployments)

**Pro Tip:** Don't migrate everything. Keep reporting and analytics as a modular monolith - the complexity isn't worth it for your scale.`,
    outputType: "text",
    difficulty: 4,
    category: "Software Architecture",
  });
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate an API call or processing delay
    setTimeout(() => {
      // Here you would typically handle the submission logic
      console.log("User answer submitted:", userAnswer);
      setIsSubmitting(false);
      // Reset user answer after submission
      setUserAnswer("");
    }, 2000);
  };
  return (
    <div className="bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Progress/Info Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Challenge #{currentPrompt?.id}
              </span>
              {/* <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Difficulty:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < currentPrompt?.difficulty
                          ? "bg-orange-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div> */}
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {currentPrompt.category}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Time: <span className="font-mono">02:34</span>
            </div>
          </div>
        </div>

        {/* Main Game Area - Side by Side on lg screens, stacked on smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outcome Display */}
          <div className="bg-white rounded-lg shadow-sm border h-fit">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Reverse Engineer This:
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                What prompt would generate the output below?
              </p>
            </div>

            <Outcome
              outcome={currentPrompt.aiOutput}
              outcomeType={currentPrompt.outputType}
              difficulty={currentPrompt.difficulty}
            />
          </div>

          {/* Answer Input Section */}
          <div className="bg-white rounded-lg shadow-sm border h-fit">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Prompt Guess:
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Write the prompt you think created the output above
              </p>
            </div>

            <div className="p-4">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter your prompt here... Be specific and detailed."
                className="w-full h-32 lg:h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Characters: {userAnswer.length}/1000
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={isSubmitting}
                  >
                    Skip Challenge
                  </button>

                  <button
                    onClick={handleSubmit}
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
                        Analyzing...
                      </div>
                    ) : (
                      "Submit Guess"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
