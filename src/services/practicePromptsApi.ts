interface UserInputs {
  role: string;
  task: string;
  context: string;
  reasoning: string;
  outputFormat: string;
  stopConditions: string;
}

interface ScoringRequest {
  userInputs: UserInputs;
  expectedAnswers: UserInputs;
}

interface ScoringResponse {
  success: boolean;
  data?: {
    totalScore: number;
    componentScores: {
      role: number;
      task: number;
      context: number;
      reasoning: number;
      outputFormat: number;
      stopConditions: number;
    };
    feedback: {
      role: boolean;
      task: boolean;
      context: boolean;
      reasoning: boolean;
      outputFormat: boolean;
      stopConditions: boolean;
    };
  };
  error?: string;
}

const API_BASE_URL = "https://guessthepromptbackend-production-52ac.up.railway.app/api/v1";

class PracticePromptsApiService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = `${API_BASE_URL}/practice`;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      return response.json();
    } catch (error) {
      console.error("Error checking health:", error);
      throw error;
    }
  }

  async evaluateAnswers(request: ScoringRequest): Promise<ScoringResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Evaluation failed");
      }
      
      return data;
    } catch (error) {
      console.error("Error evaluating answers:", error);
      throw error;
    }
  }
}

export const practicePromptsApiService = new PracticePromptsApiService();
