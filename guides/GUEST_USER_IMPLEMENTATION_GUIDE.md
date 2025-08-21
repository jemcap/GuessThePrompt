# Guest User Implementation Guide

## Overview

This guide documents the **fully implemented** backend functionality for supporting guest users who can try the game before registering. The implementation allows users to:

1. Access daily prompts without authentication
2. Submit prompts for scoring without registration
3. See their scores without saving them temporarily in Redis
4. Be prompted to register to save progress
5. Automatically transfer guest scores to their account upon registration

## Implementation Status: ✅ COMPLETE

All backend functionality is implemented and ready for frontend integration.

### Quick Start for Frontend Developers

1. **Base API URL**: `http://localhost:3003/api/v1`
2. **No authentication needed** for guest features
3. **Session ID**: Generate a UUID on frontend for each guest
4. **Rate limits**: 10 scoring attempts per 5 minutes per IP for guests
5. **Score transfer**: Automatic when registering with sessionId

## Architecture Changes

### Flow Diagram
```
Guest User Flow with Score Transfer:
1. Frontend generates unique sessionId (UUID)
2. GET /api/daily-prompts/today (public) → Get today's prompt
3. User types their guess
4. POST /api/daily-prompts/score-guest (with sessionId) → Get score + store temporarily
5. Modal shows score + registration prompt
6. User registers → POST /api/auth/register (with sessionId)
7. Backend automatically transfers guest score to new user account
8. User is marked as having submitted for the day
9. Frontend can then use authenticated endpoints

Authenticated User Flow (unchanged):
1. GET /api/daily-prompts/today → Get today's prompt + submission status
2. POST /api/daily-prompts/submit → Submit and save score
3. Progress is tracked in database
```

## Backend Implementation Details

### Base URL
```
http://localhost:3003/api/v1
```

### 1. Modified Endpoints

#### `GET /api/v1/daily-prompts/today` (Modified)
**Purpose:** Get today's daily prompt (works for both guests and authenticated users)
**Authentication:** Optional
**Rate Limiting:** 200 requests per 15 minutes per IP

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "prompt": {
      "id": "prompt-uuid",
      "aiOutput": "Generated content to guess from...",
      "difficulty": 3,
      "category": "Creative Writing",
      "outputType": "text",
      "maxScore": 1000,
      "originalPrompt": "Write a story about..." // Now included for all users
    },
    // Only included if authenticated:
    "hasSubmitted": false,
    "submission": null
  }
}
```

### 2. New Endpoints

#### `POST /api/v1/daily-prompts/score-guest` (New)
**Purpose:** Score guest submissions and store temporarily for potential transfer
**Authentication:** None required
**Rate Limiting:** 10 requests per 5 minutes per IP
**Validation:** Joi schema validation for all fields
**Storage:** Redis with 24-hour expiry

**Request Body:**
```json
{
  "userPrompt": "User's guess prompt",
  "promptId": "prompt-uuid",
  "sessionId": "guest-session-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 857,
    "maxScore": 1000,
    "similarity": 85.7,
    "feedback": "Great job! You captured most key elements.",
    "breakdown": {
      "similarity": 857,
      "bonus": 0,
      "penalties": 0
    },
    "prompt": {
      "id": "prompt-uuid",
      "category": "Creative Writing",
      "difficulty": 3,
      "originalPrompt": "Write a story about..."
    },
    "canTransferScore": true,
    "sessionId": "guest-session-uuid"
  }
}
```

**Important Features:**
- Stores score temporarily in Redis (24-hour expiry)
- Prevents multiple scoring attempts per session per day
- Only allows scoring today's prompt
- Score can be transferred to user account upon registration

#### `POST /api/v1/auth/register` (Modified)
**Purpose:** Register a new user account with optional guest score transfer
**Changes:** Now accepts optional `sessionId` parameter to transfer guest scores

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "sessionId": "guest-session-uuid"  // Optional
}
```

**Response (with score transfer):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "newuser",
    "createdAt": "2025-01-19T10:00:00.000Z"
  },
  "transferredScore": {
    "submissionId": "submission-uuid",
    "score": 857,
    "message": "Your trial score has been saved to your account!"
  }
}
```

### 3. Guest Score Service

#### New Service: `guestScoreService.js`
**Purpose:** Manages temporary storage and transfer of guest scores

**Key Methods:**
- `storeGuestScore(sessionId, scoreData)` - Store score in Redis temporarily
- `getGuestScore(sessionId)` - Retrieve stored guest score
- `transferGuestScoreToUser(userId, sessionId)` - Transfer guest score to user account
- `hasGuestScoredToday(sessionId)` - Check if guest already scored today
- `cleanupGuestScore(sessionId)` - Remove temporary score data

**Storage Strategy:**
- **Primary:** Redis with 24-hour expiration (`guest_score:sessionId`)
- **Fallback:** Database temporary storage (if Redis unavailable)
- **Cleanup:** Automatic expiry + manual cleanup after transfer

### 4. Security Measures

#### Rate Limiting
```javascript
// Guest scoring: 10 attempts per 5 minutes per IP
const guestScoringLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many scoring attempts. Please try again in a few minutes or register for unlimited attempts.',
    retryAfter: 300
  }
});

// Public endpoints: 200 requests per 15 minutes per IP
const publicEndpointLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 900
  }
});
```

#### Data Protection
- Guest scores are never saved to database
- No user tracking or analytics stored for guests
- Rate limiting prevents abuse
- CORS properly configured for frontend access

### 4. Middleware Updates

#### Optional Authentication
The existing `auth.optional` middleware was already implemented and works perfectly:

```javascript
const optionalAuth = async (req, res, next) => {
  // Tries to authenticate if token present
  // Continues without error if no token
  // Sets req.user only if valid token
};
```

### 5. Error Handling

#### Guest Endpoint Errors
```javascript
// Input validation
if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
  throw new AppError('User prompt is required and cannot be empty', 400);
}

// Rate limiting
{
  error: 'Too many scoring attempts. Please try again in a few minutes or register for unlimited attempts.',
  retryAfter: 300
}

// Scoring errors
catch (error) {
  logger.error('Error scoring guest prompt:', error);
  throw new AppError('Failed to calculate score. Please try again.', 500);
}
```

## Frontend Integration Guide

### 1. Complete API Reference

#### Base Configuration
```javascript
const API_BASE_URL = 'http://localhost:3003/api/v1';

// Axios or fetch configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies
});
```

### 2. API Usage Examples

#### Get Today's Prompt (Public)
```javascript
// No authentication required
const getTodaysPrompt = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-prompts/today`);
    const data = await response.json();
    
    // Available for all users (guest and authenticated)
    console.log(data.data.prompt.aiOutput); // The AI-generated text to guess
    console.log(data.data.prompt.originalPrompt); // The original prompt (for scoring)
    
    // Only available for authenticated users
    if (data.data.hasSubmitted) {
      console.log(data.data.submission); // Previous submission details
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching prompt:', error);
    throw error;
  }
};
```

#### Score Guest Prompt with Session Management
```javascript
// Generate or get existing session ID
const getGuestSessionId = () => {
  let sessionId = localStorage.getItem('guestSessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guestSessionId', sessionId);
  }
  return sessionId;
};

const scoreGuess = async (userPrompt, promptId) => {
  try {
    const sessionId = getGuestSessionId();
    
    const response = await fetch(`${API_BASE_URL}/daily-prompts/score-guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPrompt: userPrompt.trim(),
        promptId: promptId,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many attempts. Please register for unlimited scoring!');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.message.includes('already scored today')) {
          throw new Error('You\'ve already scored today! Register to track your progress and play again tomorrow.');
        }
      }
      throw new Error('Failed to score prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Scoring error:', error);
    throw error;
  }
};

#### Register with Score Transfer
```javascript
const registerWithScoreTransfer = async (email, username, password) => {
  try {
    const sessionId = localStorage.getItem('guestSessionId');
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
        password,
        sessionId // Include session ID for score transfer
      })
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const result = await response.json();
    
    // Clear guest session after successful registration
    localStorage.removeItem('guestSessionId');
    
    if (result.transferredScore) {
      console.log('Score transferred:', result.transferredScore.message);
      // Show success message to user about score transfer
    }

    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
```

### 3. Error Handling Guide

```javascript
// Comprehensive error handling for guest flow
const handleGuestScoring = async (userPrompt, promptId) => {
  try {
    const result = await scoreGuess(userPrompt, promptId);
    return { success: true, data: result.data };
  } catch (error) {
    // Parse error response
    if (error.message.includes('already scored today')) {
      return {
        success: false,
        error: 'ALREADY_SCORED',
        message: 'You\'ve already tried today\'s prompt! Create an account to play unlimited times.',
        showRegistration: true
      };
    }
    
    if (error.message.includes('Too many attempts')) {
      return {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many attempts. Please wait 5 minutes or register for unlimited access.',
        showRegistration: true,
        retryAfter: 300 // seconds
      };
    }
    
    if (error.message.includes('empty')) {
      return {
        success: false,
        error: 'INVALID_INPUT',
        message: 'Please enter your guess before submitting.'
      };
    }
    
    // Generic error
    return {
      success: false,
      error: 'SCORING_FAILED',
      message: 'Unable to score your guess. Please try again.'
    };
  }
};
```

### 4. Modal Implementation
When guest scoring is successful, show modal with:
- Score and feedback
- Registration call-to-action
- Benefits of creating account (unlimited attempts, progress tracking, leaderboards)

### 5. State Management with Score Transfer
```javascript
const [isGuest, setIsGuest] = useState(!user);
const [guestScore, setGuestScore] = useState(null);
const [showRegistrationModal, setShowRegistrationModal] = useState(false);
const [hasGuestScored, setHasGuestScored] = useState(false);

// Guest scoring flow with transfer capability
const handleGuestSubmit = async (userPrompt) => {
  try {
    const result = await scoreGuess(userPrompt, prompt.id);
    setGuestScore(result.data);
    setHasGuestScored(true);
    setShowRegistrationModal(true);
  } catch (error) {
    // Handle specific error cases
    if (error.message.includes('already scored today')) {
      // Show message about daily limit for guests
      setShowRegistrationModal(true);
    } else if (error.message.includes('Too many attempts')) {
      // Show registration-focused error message
      setShowRegistrationModal(true);
    } else {
      // Handle other errors
      console.error('Scoring failed:', error);
    }
  }
};

// Registration with score transfer
const handleRegisterWithTransfer = async (formData) => {
  try {
    const result = await registerWithScoreTransfer(
      formData.email, 
      formData.username, 
      formData.password
    );

    if (result.transferredScore) {
      // Show success message about transferred score
      toast.success(result.transferredScore.message);
      // Update UI to show user is now logged in with their score
      setUser(result.user);
      setIsGuest(false);
      // Redirect to dashboard or prompt page
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

## Testing Guide

### 1. Quick Test Scripts

#### Test with cURL Commands

```bash
# 1. Get today's prompt (no auth needed)
curl -X GET http://localhost:3003/api/v1/daily-prompts/today

# 2. Score as guest (save the sessionId from response)
curl -X POST http://localhost:3003/api/v1/daily-prompts/score-guest \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt": "Write a story about a magical coffee shop",
    "promptId": "YOUR_PROMPT_ID_HERE",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'

# 3. Try to score again with same sessionId (should fail)
curl -X POST http://localhost:3003/api/v1/daily-prompts/score-guest \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt": "Another attempt",
    "promptId": "YOUR_PROMPT_ID_HERE",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'

# 4. Register with score transfer
curl -X POST http://localhost:3003/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 2. Manual Testing

#### Guest Flow Test
1. Open app without authentication
2. Navigate to daily prompt
3. Enter a guess and submit
4. Verify modal shows with score
5. Verify registration prompt appears

#### Rate Limiting Test
1. Make 11 guest scoring requests rapidly
2. Verify 11th request returns 429 error
3. Wait 5 minutes and verify requests work again

#### Authentication Flow Test
1. Start as guest, get score
2. Register account
3. Verify authenticated endpoints now work
4. Verify progress is tracked

### 3. JavaScript Test Script

```javascript
// Complete test script for frontend developers
async function testGuestFlow() {
  const API_BASE = 'http://localhost:3003/api/v1';
  const sessionId = crypto.randomUUID();
  
  console.log('Starting guest flow test...');
  
  // Step 1: Get today's prompt
  console.log('\n1. Fetching today\'s prompt...');
  const promptResponse = await fetch(`${API_BASE}/daily-prompts/today`);
  const promptData = await promptResponse.json();
  console.log('Prompt received:', promptData.data.prompt);
  
  const promptId = promptData.data.prompt.id;
  
  // Step 2: Score as guest
  console.log('\n2. Submitting guest score...');
  const scoreResponse = await fetch(`${API_BASE}/daily-prompts/score-guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userPrompt: 'Write a story about a magical place',
      promptId: promptId,
      sessionId: sessionId
    })
  });
  
  if (scoreResponse.ok) {
    const scoreData = await scoreResponse.json();
    console.log('Score received:', scoreData.data);
  } else {
    console.error('Scoring failed:', await scoreResponse.text());
  }
  
  // Step 3: Try to score again (should fail)
  console.log('\n3. Testing duplicate submission...');
  const duplicateResponse = await fetch(`${API_BASE}/daily-prompts/score-guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userPrompt: 'Another attempt',
      promptId: promptId,
      sessionId: sessionId
    })
  });
  
  if (!duplicateResponse.ok) {
    console.log('Duplicate blocked as expected:', duplicateResponse.status);
  }
  
  // Step 4: Register with score transfer
  console.log('\n4. Registering with score transfer...');
  const registerResponse = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'SecurePass123!',
      sessionId: sessionId
    })
  });
  
  if (registerResponse.ok) {
    const registerData = await registerResponse.json();
    console.log('Registration successful:', registerData);
    if (registerData.transferredScore) {
      console.log('Score transferred!', registerData.transferredScore);
    }
  }
}

// Run the test
testGuestFlow().catch(console.error);
```

## Performance Considerations

### 1. Database Impact
- Guest scoring doesn't write to database
- Only reads prompt data (cached/optimized)
- No user tracking or analytics storage

### 2. Rate Limiting
- Prevents abuse of scoring service
- Encourages registration for heavy users
- Uses Redis for distributed rate limiting if available

### 3. Caching
- Daily prompts can be cached since they change once daily
- Scoring service uses efficient similarity algorithms
- Rate limiter uses Redis for better performance

## Monitoring and Analytics

### 1. Logging
```javascript
// Guest scoring attempts are logged
logger.info('Guest scoring attempt', {
  ip: req.ip,
  promptId: promptId,
  userAgent: req.get('User-Agent')
});

// Rate limit hits are logged
logger.warn('Rate limit exceeded for guest scoring', {
  ip: req.ip,
  url: req.originalUrl
});
```

### 2. Metrics to Track
- Guest scoring attempts per day
- Rate limit hits
- Conversion rate (guest to registered user)
- Popular prompts among guests

## Response Format Reference

### Successful Guest Score Response
```json
{
  "success": true,
  "data": {
    "score": 857,
    "maxScore": 1000,
    "similarity": 85.7,
    "feedback": "Great job! You captured most key elements.",
    "breakdown": {
      "similarity": 857,
      "bonus": 0,
      "penalties": 0
    },
    "prompt": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "category": "Creative Writing",
      "difficulty": 3,
      "originalPrompt": "Write a story about a magical coffee shop"
    },
    "canTransferScore": true,
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Error Response Formats
```json
// Rate limited
{
  "success": false,
  "error": "Too many scoring attempts. Please try again in a few minutes or register for unlimited attempts.",
  "retryAfter": 300
}

// Already scored today
{
  "success": false,
  "error": "You have already scored today. Register to track your progress and play again tomorrow!"
}

// Invalid input
{
  "success": false,
  "error": "User prompt is required and cannot be empty"
}
```

## Deployment Checklist

### Before Deployment
- [ ] Test all endpoints manually
- [ ] Verify rate limiting works
- [ ] Test CORS with frontend
- [ ] Check error handling
- [ ] Verify logging is working
- [ ] Ensure Redis is running for guest score storage
- [ ] Test score transfer on registration

### Environment Variables
No new environment variables required - existing configuration works.

### Database Changes
No database migrations required - uses existing prompt tables.

### Required Services
- Redis (for temporary guest score storage)
- PostgreSQL (existing database)

## Future Enhancements

### Potential Improvements
1. **Guest Analytics** - Track anonymous usage patterns
2. **Social Sharing** - Allow guests to share scores
3. **Progressive Registration** - Collect email first, full registration later
4. **Guest Leaderboards** - Anonymous daily/weekly leaderboards
5. **Enhanced Rate Limiting** - Different limits based on user behavior

### Security Enhancements
1. **CAPTCHA** - For repeated guest attempts
2. **Fingerprinting** - Better tracking of guest users
3. **Abuse Detection** - Automated blocking of malicious patterns

## Support and Troubleshooting

### Common Issues

1. **Rate Limiting Too Strict**
   - Adjust `guestScoringLimiter` max value
   - Consider implementing progressive limits

2. **CORS Issues**
   - Verify frontend origin in corsOptions
   - Check credentials: true setting

3. **Scoring Service Errors**
   - Check scoring service dependencies
   - Verify prompt data integrity

### Debugging Commands
```bash
# Check rate limiting status
redis-cli get "rate-limit:/api/daily-prompts/score-guest:IP_ADDRESS"

# Monitor guest scoring logs
tail -f logs/app.log | grep "guest scoring"

# Test endpoint availability
curl -I http://localhost:3003/api/daily-prompts/today
```

## Summary

This implementation provides a smooth onboarding experience while maintaining security and encouraging user registration.

### Key Features for Frontend
- ✅ Guest users can try the game without registration
- ✅ Scores are calculated using the same logic as registered users
- ✅ Guest scores automatically transfer when they register
- ✅ Rate limiting prevents abuse while encouraging registration
- ✅ Clear error messages guide users toward registration
- ✅ Session-based tracking without cookies or authentication

### Backend Status
All code is implemented and functional. The backend is ready to support the guest user feature on the frontend.