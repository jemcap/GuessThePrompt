# Practice Scoring Frontend Integration Guide

This document explains how to integrate the AI-powered practice scoring endpoint with your frontend application.

## Overview

The practice scoring system uses TensorFlow.js Universal Sentence Encoder to intelligently evaluate user responses against expected prompt components. Think of it as a smart tutor that understands meaning, not just exact word matches.

### What We Built

- **Backend Endpoint**: `/api/v1/practice/evaluate` - Scores user answers using AI
- **Health Check**: `/api/v1/practice/health` - Verifies scoring service is ready
- **Smart Analysis**: Semantic similarity scoring with detailed component feedback

## Step 1: Create the API Service Layer

Create a service to communicate with the backend:

```javascript
// src/services/practiceApi.js
class PracticeApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3003/api/v1/practice';
  }

  /**
   * Check if the scoring service is ready
   * Call this before allowing users to practice
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send user answers for scoring
   * @param {Object} userInputs - User's answers for all 6 components
   * @param {Object} expectedAnswers - Expected answers from practicePrompts.json
   */
  async evaluateAnswers(userInputs, expectedAnswers) {
    try {
      const response = await fetch(`${this.baseUrl}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInputs,
          expectedAnswers
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answers');
      }

      return data;
    } catch (error) {
      console.error('Evaluation failed:', error);
      throw error;
    }
  }
}

export const practiceApiService = new PracticeApiService();
```

## Step 2: Update Your Practice Component

Integrate the API into your existing practice component:

```javascript
// In your Practice.jsx component
import { practiceApiService } from '../services/practiceApi';

const Practice = () => {
  // Your existing state
  const [userInputs, setUserInputs] = useState({
    role: '',
    task: '',
    context: '',
    reasoning: '',
    outputFormat: '',
    stopConditions: ''
  });

  // Add new state for AI scoring
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoringError, setScoringError] = useState(null);
  const [serviceReady, setServiceReady] = useState(false);
  const [detailedResults, setDetailedResults] = useState(null);

  // Check if scoring service is ready when component mounts
  useEffect(() => {
    checkScoringService();
  }, []);

  const checkScoringService = async () => {
    try {
      const health = await practiceApiService.checkHealth();
      setServiceReady(health.success && health.data.ready);
      
      if (!health.success) {
        setScoringError('Scoring service is not available');
      }
    } catch (error) {
      setScoringError('Failed to connect to scoring service');
      setServiceReady(false);
    }
  };

  // Updated validation function using AI scoring
  const validateAnswers = async () => {
    if (!selectedGroup || !serviceReady) return;
    
    const currentPrompt = promptGroups[selectedGroup].prompts[currentPromptIndex];
    const expectedAnswers = currentPrompt.components;

    try {
      setIsSubmitting(true);
      setScoringError(null);

      // Call our AI scoring endpoint
      const response = await practiceApiService.evaluateAnswers(
        userInputs,
        expectedAnswers
      );

      if (response.success) {
        const { totalScore, componentScores, feedback, detailedAnalysis, summary } = response.data;
        
        // Update your existing state
        setScore(totalScore);
        setFeedback(feedback);
        setDetailedResults({
          componentScores,
          detailedAnalysis,
          summary
        });
        setShowResults(true);
        
        console.log('AI Scoring Results:', response.data);
      }
    } catch (error) {
      console.error('Scoring error:', error);
      setScoringError(error.message);
      
      // Fallback to your original keyword matching if AI fails
      fallbackValidation();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keep your original validation as fallback
  const fallbackValidation = () => {
    // Your existing keyword matching logic here
    console.log('Using fallback scoring method');
    
    const currentPrompt = promptGroups[selectedGroup].prompts[currentPromptIndex];
    const correctAnswers = currentPrompt.components;
    const newFeedback = {};
    let correctCount = 0;

    Object.keys(userInputs).forEach(key => {
      const userAnswer = userInputs[key].toLowerCase().trim();
      const correctAnswer = correctAnswers[key].toLowerCase();
      
      const keywords = correctAnswer.split(' ').filter(word => word.length > 3);
      const matchedKeywords = keywords.filter(keyword => 
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

  // Rest of your component...
};
```

## Step 3: Enhanced Results Display

Show detailed AI analysis to users:

```javascript
// Enhanced results section in your JSX
{showResults && detailedResults && (
  <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-white">
        Your Score: {score}%
      </h3>
      <div className="text-right">
        <p className="text-sm text-gray-400">
          Components Passed: {detailedResults.summary.passedComponents}/6
        </p>
        <p className="text-xs text-gray-500">
          (70% similarity threshold)
        </p>
      </div>
    </div>
    
    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
      <p className="text-blue-200">
        {detailedResults.summary.overallFeedback}
      </p>
    </div>
    
    {/* Component-by-component breakdown */}
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white mb-3">Detailed Analysis</h4>
      
      {Object.entries(detailedResults.componentScores).map(([component, score]) => (
        <div key={component} className="border border-gray-600 rounded-lg p-4 bg-gray-750">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-white capitalize text-lg">
              {component.replace(/([A-Z])/g, ' $1').trim()}
            </h5>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white">{score}%</span>
              {feedback[component] ? (
                <div className="flex items-center gap-1">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-green-300 text-sm">Passed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-red-400 text-xl">✗</span>
                  <span className="text-red-300 text-sm">Needs Work</span>
                </div>
              )}
            </div>
          </div>
          
          {/* AI-generated feedback for this component */}
          <div className="mb-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              {detailedResults.detailedAnalysis[component].feedback}
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  score >= 70 ? 'bg-green-500' : 
                  score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span className="text-yellow-400">50%</span>
              <span className="text-green-400">70%</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Similarity score for debugging/transparency */}
          <p className="text-xs text-gray-500 mt-2">
            Semantic similarity: {(detailedResults.detailedAnalysis[component].similarity * 100).toFixed(1)}%
          </p>
        </div>
      ))}
    </div>
    
    {/* Action buttons */}
    <div className="mt-8 flex gap-3">
      <button
        onClick={nextPrompt}
        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
      >
        Next Prompt
      </button>
      <button
        onClick={resetPrompt}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
      >
        Try Again
      </button>
    </div>
  </div>
)}
```

## Step 4: Handle Loading States and Errors

Add proper UI feedback for better user experience:

```javascript
// In your submit button area
<div className="mt-6 flex gap-3">
  {!showResults ? (
    <button
      onClick={validateAnswers}
      disabled={
        Object.values(userInputs).some(v => !v.trim()) || 
        isSubmitting || 
        !serviceReady
      }
      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Analyzing with AI...</span>
        </div>
      ) : !serviceReady ? (
        'AI Scoring Unavailable'
      ) : (
        '🤖 Check Answers (AI Powered)'
      )}
    </button>
  ) : (
    // Results are shown above
    null
  )}
</div>

{/* Error display */}
{scoringError && (
  <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
    <div className="flex items-start gap-3">
      <span className="text-red-400 text-xl">⚠️</span>
      <div>
        <h4 className="text-red-300 font-medium">AI Scoring Error</h4>
        <p className="text-red-200 text-sm mt-1">{scoringError}</p>
        <p className="text-red-100 text-xs mt-2">
          Don't worry! We've switched to our backup scoring method.
        </p>
      </div>
    </div>
  </div>
)}

{/* Service status indicator */}
{!serviceReady && !isSubmitting && (
  <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
    <div className="flex items-start gap-3">
      <div className="animate-pulse text-yellow-400 text-xl">🔄</div>
      <div>
        <h4 className="text-yellow-300 font-medium">AI Service Initializing</h4>
        <p className="text-yellow-200 text-sm mt-1">
          The AI scoring service is starting up. This usually takes 5-10 seconds.
        </p>
        <button 
          onClick={checkScoringService}
          className="text-yellow-200 underline text-sm mt-2 hover:text-yellow-100"
        >
          Check Again
        </button>
      </div>
    </div>
  </div>
)}
```

## Step 5: Advanced Integration Features

### Periodic Health Checks

```javascript
// Check service health periodically, not on every request
useEffect(() => {
  const interval = setInterval(() => {
    if (!serviceReady) {
      checkScoringService();
    }
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
}, [serviceReady]);
```

### Performance Optimization

```javascript
// Debounce rapid requests
const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

const validateAnswers = async () => {
  const now = Date.now();
  if (now - lastSubmissionTime < 2000) {
    console.log('Please wait before submitting again');
    return;
  }
  setLastSubmissionTime(now);
  
  // ... rest of validation logic
};
```

### Error Recovery Strategy

```javascript
const handleScoring = async () => {
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    try {
      // Try AI scoring
      const result = await practiceApiService.evaluateAnswers(userInputs, expectedAnswers);
      return result;
    } catch (error) {
      attempts++;
      console.warn(`AI scoring attempt ${attempts} failed:`, error);
      
      if (attempts === maxAttempts) {
        console.log('All AI scoring attempts failed, using fallback');
        fallbackValidation();
        return;
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
```

## API Response Structure

### Health Check Response
```javascript
{
  "success": true,
  "data": {
    "ready": true,
    "service": "TensorFlow.js Universal Sentence Encoder",
    "timestamp": "2025-08-22T15:25:30.516Z",
    "cacheStats": {
      "size": 1,
      "maxSize": 1000,
      "hitRate": "Not tracked"
    }
  }
}
```

### Evaluation Response
```javascript
{
  "success": true,
  "data": {
    "totalScore": 78,                    // Overall percentage score
    "componentScores": {                 // Individual component scores
      "role": 91,
      "task": 72,
      "context": 81,
      "reasoning": 63,
      "outputFormat": 83,
      "stopConditions": 81
    },
    "feedback": {                        // Pass/fail for each component (70% threshold)
      "role": true,
      "task": true,
      "context": true,
      "reasoning": false,
      "outputFormat": true,
      "stopConditions": true
    },
    "detailedAnalysis": {               // Detailed feedback for each component
      "role": {
        "score": 91,
        "similarity": 0.9053,
        "feedback": "Perfect! You identified the exact persona needed."
      },
      // ... other components
    },
    "summary": {                        // Overall assessment
      "passedComponents": 5,
      "totalComponents": 6,
      "overallFeedback": "🌟 Great work! You have a solid understanding of prompt structure."
    }
  }
}
```

## Testing Your Integration

### 1. Backend Testing
```bash
# Start your backend
npm start

# Test health endpoint
curl -X GET http://localhost:3003/api/v1/practice/health

# Test evaluation endpoint
curl -X POST http://localhost:3003/api/v1/practice/evaluate \
  -H "Content-Type: application/json" \
  -d '{"userInputs": {...}, "expectedAnswers": {...}}'
```

### 2. Frontend Testing
```javascript
// Test in browser console
import { practiceApiService } from './services/practiceApi';

// Test health check
await practiceApiService.checkHealth();

// Test evaluation
await practiceApiService.evaluateAnswers({
  role: "test role",
  task: "test task",
  context: "test context",
  reasoning: "test reasoning",
  outputFormat: "test format",
  stopConditions: "test conditions"
}, {
  role: "expected role",
  task: "expected task", 
  context: "expected context",
  reasoning: "expected reasoning",
  outputFormat: "expected format",
  stopConditions: "expected conditions"
});
```

## Key Benefits

### For Users:
- **Smarter Scoring**: Understands "email writer" matches "professional email writer"
- **Better Learning**: Specific tips for improving each component
- **Immediate Feedback**: Detailed analysis shows exactly what to improve

### For Developers:
- **Graceful Degradation**: Falls back to keyword matching if AI fails
- **Performance**: Local AI processing, no external API costs
- **Reliability**: Comprehensive error handling and status checking

## Troubleshooting

### Common Issues:

1. **"AI Scoring Unavailable"**
   - Backend server not running
   - TensorFlow.js model failed to load
   - Network connection issues

2. **Slow First Request**
   - Normal! TensorFlow.js model loads on first use (~5-10 seconds)
   - Subsequent requests are fast (~100-200ms)

3. **Inconsistent Scores**
   - AI uses semantic similarity, not exact matching
   - Scores may vary slightly between runs (this is normal)
   - Falls back to keyword matching if AI fails

### Debug Tips:
```javascript
// Add debug logging
console.log('Service ready:', serviceReady);
console.log('User inputs:', userInputs);
console.log('Expected answers:', expectedAnswers);
console.log('API response:', response);
```

## Next Steps

1. **Start Simple**: Integrate the basic API service first
2. **Test Thoroughly**: Verify both success and error cases  
3. **Enhance UI**: Add the detailed results display
4. **Add Polish**: Include loading states and error handling
5. **Monitor**: Watch for any performance or reliability issues

The system is now ready to give users intelligent, educational feedback on their prompt engineering skills!