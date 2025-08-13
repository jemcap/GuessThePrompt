import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserInputSection from './UserInputSection';
import { DailyPromptsApiService } from '../../services/dailyPromptsApi';
import type { DailySubmission } from '../../services/dailyPromptsApi';

// Mock the API service
vi.mock('../../services/dailyPromptsApi', () => ({
  DailyPromptsApiService: {
    submitGuess: vi.fn(),
  },
}));

describe('UserInputSection', () => {
  const mockProps = {
    userAnswer: '',
    setUserAnswer: vi.fn(),
    hasSubmitted: false,
    isSubmitting: false,
    submission: null,
    originalPrompt: 'Create a function that calculates fibonacci numbers',
    challengeId: 'day-1',
    onSubmit: vi.fn(),
    getScoreMessage: vi.fn((score: number) => ({
      title: score >= 800 ? 'Excellent!' : score >= 600 ? 'Good!' : 'Keep trying!',
      message: `You scored ${score} points`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the input section with correct initial state', () => {
      render(<UserInputSection {...mockProps} />);
      
      expect(screen.getByText('Your Prompt Guess:')).toBeInTheDocument();
      expect(screen.getByText('What prompt do you think created this output?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your best guess for the prompt/)).toBeInTheDocument();
      expect(screen.getByText('Submit Answer')).toBeInTheDocument();
      expect(screen.getByText('0/1000 characters')).toBeInTheDocument();
    });

    it('disables submit button when input is empty', () => {
      render(<UserInputSection {...mockProps} />);
      
      const submitButton = screen.getByRole('button', { name: /submit answer/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('User Input', () => {
    it('allows user to type in the textarea', () => {
      const setUserAnswer = vi.fn();
      render(<UserInputSection {...mockProps} setUserAnswer={setUserAnswer} />);
      
      const textarea = screen.getByPlaceholderText(/Enter your best guess for the prompt/) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'This is my guess' } });
      
      expect(setUserAnswer).toHaveBeenCalledWith('This is my guess');
    });

    it('updates character count as user types', () => {
      const testText = 'This is my test prompt guess';
      render(<UserInputSection {...mockProps} userAnswer={testText} />);
      
      expect(screen.getByText(`${testText.length}/1000 characters`)).toBeInTheDocument();
    });

    it('enables submit button when input has content', () => {
      render(<UserInputSection {...mockProps} userAnswer="Some text" />);
      
      const submitButton = screen.getByText('Submit Answer');
      expect(submitButton).not.toBeDisabled();
    });

    it('limits input to 1000 characters', () => {
      render(<UserInputSection {...mockProps} />);
      
      const textarea = screen.getByPlaceholderText(/Enter your best guess for the prompt/) as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('maxLength', '1000');
    });
  });

  describe('Submission Process', () => {
    it('calls onSubmit when submit button is clicked', async () => {
      const onSubmit = vi.fn();
      render(<UserInputSection {...mockProps} userAnswer="My guess" onSubmit={onSubmit} />);
      
      const submitButton = screen.getByText('Submit Answer');
      fireEvent.click(submitButton);
      
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during submission', () => {
      render(<UserInputSection {...mockProps} isSubmitting={true} userAnswer="My guess" />);
      
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      const textarea = screen.getByPlaceholderText(/Enter your best guess for the prompt/) as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });

    it('disables textarea and shows submitted state after submission', () => {
      const submission: DailySubmission = {
        userPrompt: 'My submitted guess',
        score: 850,
        submittedAt: new Date().toISOString(),
      };
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
        userAnswer="My submitted guess"
      />);
      
      const textarea = screen.getByPlaceholderText(/You've already submitted for today/) as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
      expect(screen.getByText('✓ Submitted')).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('renders score after successful submission', () => {
      const submission: DailySubmission = {
        userPrompt: 'My guess',
        score: 750,
        submittedAt: new Date().toISOString(),
      };
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
      />);
      
      expect(screen.getByText('Score:')).toBeInTheDocument();
      expect(screen.getByText('750/1000')).toBeInTheDocument();
      expect(screen.getByText('750')).toBeInTheDocument();
      expect(screen.getByText('out of 1000')).toBeInTheDocument();
    });

    it('displays personalized score message based on score', () => {
      const submission: DailySubmission = {
        userPrompt: 'My guess',
        score: 850,
        submittedAt: new Date().toISOString(),
      };
      
      const getScoreMessage = vi.fn(() => ({
        title: 'Excellent!',
        message: 'You\'re a prompt engineering master!',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      }));
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
        getScoreMessage={getScoreMessage}
      />);
      
      expect(getScoreMessage).toHaveBeenCalledWith(850);
      expect(screen.getByText('Excellent!')).toBeInTheDocument();
      expect(screen.getByText('You\'re a prompt engineering master!')).toBeInTheDocument();
    });

    it('shows score progress bar with correct width', () => {
      const submission: DailySubmission = {
        userPrompt: 'My guess',
        score: 650,
        submittedAt: new Date().toISOString(),
      };
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
      />);
      
      const progressBar = document.querySelector('[style*="width: 65%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('applies correct color class based on score range', () => {
      const testCases = [
        { score: 950, expectedClass: 'bg-purple-500' },
        { score: 850, expectedClass: 'bg-green-500' },
        { score: 750, expectedClass: 'bg-blue-500' },
        { score: 650, expectedClass: 'bg-indigo-500' },
        { score: 450, expectedClass: 'bg-orange-500' },
        { score: 250, expectedClass: 'bg-red-500' },
      ];
      
      testCases.forEach(({ score, expectedClass }) => {
        const { container } = render(<UserInputSection 
          {...mockProps} 
          hasSubmitted={true} 
          submission={{ userPrompt: 'Test', score, submittedAt: new Date().toISOString() }}
        />);
        
        const progressBar = container.querySelector(`.${expectedClass}`);
        expect(progressBar).toBeInTheDocument();
      });
    });
  });

  describe('Original Prompt Reveal', () => {
    it('shows original prompt after submission', () => {
      const submission: DailySubmission = {
        userPrompt: 'My guess',
        score: 700,
        submittedAt: new Date().toISOString(),
      };
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
      />);
      
      expect(screen.getByText('The Original Prompt')).toBeInTheDocument();
      expect(screen.getByText(mockProps.originalPrompt)).toBeInTheDocument();
      expect(screen.getByText('Compare this with your guess to see how close you were!')).toBeInTheDocument();
    });
  });

  describe('Submission Details', () => {
    it('displays submission timestamp', () => {
      const submittedAt = '2025-08-12T10:30:00Z';
      const submission: DailySubmission = {
        userPrompt: 'My guess',
        score: 800,
        submittedAt,
      };
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
      />);
      
      expect(screen.getByText('Submitted:')).toBeInTheDocument();
      expect(screen.getByText(new Date(submittedAt).toLocaleString())).toBeInTheDocument();
    });

    it('shows challenge ID', () => {
      const submission: DailySubmission = {
        userPrompt: 'My guess',
        score: 750,
        submittedAt: new Date().toISOString(),
      };
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
        challengeId="day-42"
      />);
      
      expect(screen.getByText('Challenge #42')).toBeInTheDocument();
    });

    it('displays encouragement message', () => {
      const submission: DailySubmission = {
        userPrompt: 'My guess',
        score: 600,
        submittedAt: new Date().toISOString(),
      };
      
      render(<UserInputSection 
        {...mockProps} 
        hasSubmitted={true} 
        submission={submission}
      />);
      
      expect(screen.getByText('Come back tomorrow for a new prompt challenge and keep improving your skills!')).toBeInTheDocument();
    });
  });

  describe('Integration with API', () => {
    it('simulates complete submission flow with API call', async () => {
      const mockSubmitGuess = vi.mocked(DailyPromptsApiService.submitGuess);
      const mockSubmissionResponse = {
        success: true,
        submission: {
          userPrompt: 'My test prompt',
          score: 820,
          submittedAt: new Date().toISOString(),
        },
        scoreBreakdown: {
          similarity: 700,
          keywordMatch: 850,
          creativityBonus: 900,
          lengthOptimization: 850,
          total: 820,
        },
        message: 'Great job!',
      };
      
      mockSubmitGuess.mockResolvedValueOnce(mockSubmissionResponse);
      
      const onSubmit = vi.fn(async () => {
        const response = await DailyPromptsApiService.submitGuess('My test prompt');
        return response;
      });
      
      const { rerender } = render(<UserInputSection 
        {...mockProps} 
        userAnswer="My test prompt"
        onSubmit={onSubmit}
      />);
      
      // Click submit button
      const submitButton = screen.getByText('Submit Answer');
      fireEvent.click(submitButton);
      
      // Wait for API call
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
      
      // Simulate state update after successful submission
      rerender(<UserInputSection 
        {...mockProps}
        userAnswer="My test prompt"
        hasSubmitted={true}
        submission={mockSubmissionResponse.submission}
      />);
      
      // Verify score is displayed
      expect(screen.getByText('820/1000')).toBeInTheDocument();
      expect(screen.getByText('✓ Submitted')).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
      const mockSubmitGuess = vi.mocked(DailyPromptsApiService.submitGuess);
      mockSubmitGuess.mockRejectedValueOnce(new Error('Network error'));
      
      const onSubmit = vi.fn(async () => {
        try {
          await DailyPromptsApiService.submitGuess('My test prompt');
        } catch (error) {
          throw error;
        }
      });
      
      render(<UserInputSection 
        {...mockProps} 
        userAnswer="My test prompt"
        onSubmit={onSubmit}
      />);
      
      const submitButton = screen.getByText('Submit Answer');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
      
      // Verify component remains in editable state after error
      expect(submitButton).toBeInTheDocument();
      expect(screen.queryByText('✓ Submitted')).not.toBeInTheDocument();
    });
  });
});