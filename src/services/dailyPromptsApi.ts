/**
 * Daily Prompts API Service
 * 
 * This service handles all communication with the backend API for daily prompts.
 * It includes type-safe interfaces matching the backend schema and proper error handling.
 * 
 * Backend endpoints (from SESSION_SUMMARY_2025-08-12.md):
 * - GET /api/v1/daily-prompts/today - Get today's challenge
 * - POST /api/v1/daily-prompts/submit - Submit guess
 * - GET /api/v1/daily-prompts/leaderboard - Daily rankings
 * - GET /api/v1/daily-prompts/stats - User statistics
 */

// API Configuration
const API_BASE_URL = 'https://guessthepromptbackend-production-52ac.up.railway.app/api/v1';

// TypeScript interfaces matching the backend schema
export interface DailyPrompt {
  id: string;
  date: string;
  originalPrompt: string; // The actual prompt that was used
  aiOutput: string;       // The AI's response to that prompt
  outputType: 'text' | 'code' | 'image';
  difficulty: number;     // 1-5 scale
  category: string;
  maxScore: number;       // Default 1000
  createdAt: string;
  updatedAt: string;
}

export interface DailySubmission {
  id?: string;
  userId?: string;
  dailyPromptId?: string;
  userPrompt: string;     // User's guess
  score?: number;
  similarity?: number;
  keywordMatch?: number;
  creativityBonus?: number;
  lengthOptimization?: number;
  submittedAt?: string;
}

export interface SubmissionResponse {
  success: boolean;
  submission: DailySubmission;
  scoreBreakdown: {
    similarity: number;
    keywordMatch: number;
    creativityBonus: number;
    lengthOptimization: number;
    total: number;
  };
  message: string;
}

export interface GuestScoreResponse {
  success: boolean;
  data: {
    score: number;
    maxScore: number;
    similarity: number;
    feedback: string;
    breakdown: {
      similarity: number;
      bonus: number;
      penalties: number;
    };
    prompt: {
      id: string;
      category: string;
      difficulty: number;
      originalPrompt: string;
    };
    canTransferScore: boolean;
    sessionId: string;
  };
}

export interface ApiError {
  error: string;
  details?: string;
  status: number;
}

// Custom error class for API errors
export class DailyPromptsApiError extends Error {
  public status: number;
  public details?: string;

  constructor(error: ApiError) {
    super(error.error);
    this.status = error.status;
    this.details = error.details;
    this.name = 'DailyPromptsApiError';
  }
}

/**
 * Generic API request handler with proper error handling and credentials
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Include credentials for HTTP-only cookies
      credentials: 'include',
    });

    // Handle non-JSON responses (like 404, 500, etc.)
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        // If response isn't JSON, create a generic error
        errorData = {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }
      throw new DailyPromptsApiError(errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error instanceof DailyPromptsApiError) {
      throw error; // Re-throw our custom errors
    }
    
    // Handle network/fetch errors
    throw new DailyPromptsApiError({
      error: 'Network request failed',
      details: error instanceof Error ? error.message : 'Unknown network error',
      status: 0,
    });
  }
}

/**
 * Daily Prompts API Service Class
 * 
 * This provides a clean interface for all daily prompt operations.
 * Each method handles specific API endpoints with proper typing and error handling.
 */
export class DailyPromptsApiService {
  /**
   * Get today's daily prompt
   * 
   * This corresponds to: GET /api/v1/daily-prompts/today
   * Returns the challenge for the current date, creating one if it doesn't exist.
   */
  static async getTodaysPrompt(): Promise<DailyPrompt> {
    try {
      const response = await apiRequest<{ 
        success: boolean;
        data: { 
          prompt: DailyPrompt;
          hasSubmitted: boolean;
          submission: DailySubmission | null;
        }
      }>('/daily-prompts/today');
      
      return response.data.prompt;
    } catch (error) {
      console.error('Failed to fetch today\'s prompt:', error);
      throw error;
    }
  }

  /**
   * Submit a user's prompt guess
   * 
   * This corresponds to: POST /api/v1/daily-prompts/submit
   * Backend automatically finds today's prompt, so no promptId needed.
   * 
   * @param userPrompt - The user's guess for the original prompt
   */
  static async submitGuess(
    userPrompt: string
  ): Promise<SubmissionResponse> {
    try {
      const response = await apiRequest<any>('/daily-prompts/submit', {
        method: 'POST',
        body: JSON.stringify({
          userPrompt,
        }),
      });
      
      // Transform backend response to match frontend expectations
      // Backend returns: { success, data: { submission, scoreDetails, ... } }
      // Frontend expects: { success, submission, scoreBreakdown, message }
      if (response.success && response.data && response.data.submission) {
        const backendSubmission = response.data.submission;
        
        return {
          success: response.success,
          submission: {
            id: backendSubmission.id,
            userPrompt: userPrompt,
            score: backendSubmission.pointsEarned, // Map pointsEarned to score
            similarity: backendSubmission.similarityScore,
            submittedAt: backendSubmission.submittedAt
          },
          scoreBreakdown: response.data.scoreDetails || {
            similarity: backendSubmission.similarityScore || 0,
            keywordMatch: 0,
            creativityBonus: 0,
            lengthOptimization: 0,
            total: backendSubmission.pointsEarned || 0
          },
          message: 'Submission successful'
        };
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('Invalid response structure from backend');
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
      throw error;
    }
  }

  /**
   * Get user's submission for today's prompt (if any)
   * 
   * This helps check if the user has already submitted today.
   * Since our backend returns this data along with the prompt, we'll optimize by combining calls.
   */
  static async getTodaysSubmission(): Promise<DailySubmission | null> {
    try {
      const response = await apiRequest<{ 
        success: boolean;
        data: { 
          prompt: DailyPrompt;
          hasSubmitted: boolean;
          submission: DailySubmission | null;
        }
      }>('/daily-prompts/today');
      
      return response.data.submission;
    } catch (error) {
      // If there's no submission, that's fine - return null
      if (error instanceof DailyPromptsApiError && error.status === 404) {
        return null;
      }
      console.error('Failed to fetch today\'s submission:', error);
      throw error;
    }
  }

  /**
   * Get daily leaderboard
   * 
   * This corresponds to: GET /api/v1/daily-prompts/leaderboard
   * Returns top scores for today's challenge.
   */
  static async getLeaderboard(): Promise<Array<{
    userId: string;
    username: string;
    score: number;
    submittedAt: string;
  }>> {
    try {
      const response = await apiRequest<{ leaderboard: any[] }>('/daily-prompts/leaderboard');
      return response.leaderboard;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * 
   * This corresponds to: GET /api/v1/daily-prompts/stats
   * Returns user's overall performance metrics.
   */
  static async getUserStats(): Promise<{
    totalSubmissions: number;
    averageScore: number;
    bestScore: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    try {
      const response = await apiRequest<{ stats: any }>('/daily-prompts/stats');
      return response.stats;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  }

  /**
   * Submit a guest's prompt guess for scoring
   * 
   * This corresponds to: POST /api/v1/daily-prompts/score-guest
   * Allows guest users to score their prompts without authentication.
   * Score is temporarily stored in Redis for potential transfer upon registration.
   * 
   * @param userPrompt - The user's guess for the original prompt
   * @param promptId - The ID of the daily prompt
   * @param sessionId - The guest session ID for tracking
   */
  static async scoreGuestPrompt(
    userPrompt: string,
    promptId: string,
    sessionId: string
  ): Promise<GuestScoreResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/daily-prompts/score-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: userPrompt.trim(),
          promptId,
          sessionId
        })
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }

        // Log detailed error information for debugging
        console.error('Guest scoring API error:', {
          status: response.status,
          error: errorData.error,
          details: errorData.details,
          promptId,
          sessionId
        });

        // Handle specific error cases
        if (response.status === 429) {
          throw new DailyPromptsApiError({
            error: 'Too many attempts. Please register for unlimited scoring!',
            status: 429
          });
        }
        
        if (response.status === 400 && errorData.error?.includes('already scored today')) {
          throw new DailyPromptsApiError({
            error: 'You\'ve already scored today! Register to track your progress and play again tomorrow.',
            status: 400
          });
        }

        // Include validation details in the error message for debugging
        const errorMessage = errorData.details && Array.isArray(errorData.details)
          ? `${errorData.error}: ${errorData.details.join(', ')}`
          : errorData.error || 'Failed to score prompt';

        throw new DailyPromptsApiError({
          error: errorMessage,
          details: errorData.details,
          status: response.status
        });
      }


      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof DailyPromptsApiError) {
        throw error;
      }
      
      console.error('Failed to score guest prompt:', error);
      throw new DailyPromptsApiError({
        error: 'Failed to score your guess. Please try again.',
        status: 0
      });
    }
  }
}

/**
 * Utility function to check if the API is available
 * 
 * This can be used for health checks and debugging connectivity issues.
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
      credentials: 'include',
    });
    return true;
  } catch {
    return false;
  }
}