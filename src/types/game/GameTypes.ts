 export interface Prompt {
    id: string;
    promptText: string;
    outcomeText: string;
    outcomeType: 'text' | 'code';
    difficulty: number;
    category: string;
    embedding?: number[];
    isActive: boolean;
    createdAt: string;
  }

  export interface Submission {
    id: string;
    userId: string;
    promptId: string;
    submittedText: string;
    similarityScore?: number;
    pointsEarned: number;
    timeTaken?: number;
    submittedAt: string;
  }

  export interface GameState {
    currentPrompt: Prompt | null;
    userAnswer: string;
    isSubmitting: boolean;
    lastResult: {
      similarity: number;
      points: number;
      feedback: string;
    } | null;
    gameStatus: 'loading' | 'playing' | 'submitted' | 'completed';
  }