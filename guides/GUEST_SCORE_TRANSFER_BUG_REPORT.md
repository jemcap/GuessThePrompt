# 🐛 Guest Score Transfer Bug Report - Frontend Context

**Date:** August 21, 2025  
**Issue:** Guest score transfer not working during registration  
**Severity:** High  
**Status:** Under Investigation  

## 📋 Issue Summary

After implementing enhanced guest score transfer for login endpoints, the guest score transfer functionality for **registration** appears to have stopped working. However, the **login** guest score transfer is working correctly with the new enhancements.

## 🔍 Root Cause Analysis

### **What Changed Recently:**
1. ✅ **Enhanced login endpoint** with intelligent guest score transfer validation
2. ✅ **Fixed daily prompts validation** schema (unrelated to guest scores)
3. ✅ **Added comprehensive status tracking** for login transfers
4. ❌ **Registration code was NOT modified** - it should still work

### **Most Likely Causes (In Priority Order):**

#### **1. 🎯 Missing Guest Score Data (90% Likely)**
**Problem:** No guest score exists to transfer during registration.

**Technical Details:**
- Guest scores must be created via `/api/v1/daily-prompts/score-guest` endpoint
- Guest scores are stored in Redis with 24-hour TTL
- If no guest score was created, or it expired, registration transfer will find nothing

**Frontend Impact:**
- Registration appears to "fail" to transfer score
- But actually, there was no score to transfer in the first place

#### **2. ⏰ Data Expiry (Redis TTL)**
**Problem:** Guest scores expire after 24 hours.

**Technical Details:**
```javascript
// Guest scores have 24-hour expiration
GUEST_SCORE_EXPIRY = 24 * 60 * 60; // seconds
```

**Frontend Impact:**
- If user creates guest score, waits >24 hours, then registers
- Score will be gone from Redis
- Registration will not find any score to transfer

#### **3. 🆔 Prompt ID Mismatch**
**Problem:** Guest score tied to different prompt than current day.

**Technical Details:**
- Daily prompts change at 00:01 UTC each day
- Guest scores are tied to specific `promptId`
- If guest score created yesterday but user registers today = ID mismatch

**Frontend Impact:**
- Guest score exists in Redis but for wrong prompt
- Transfer logic can't find score for today's prompt

#### **4. 🔧 Shared Service Side Effects (10% Likely)**
**Problem:** Enhanced login logic affected shared guest score service.

**Technical Details:**
- Both login and registration use same `guestScoreService.transferGuestScoreToUser()`
- Enhanced validation in shared service might be too strict
- Registration might be hitting new validation that didn't exist before

## 📊 Current System Behavior

### **Working Flows:**
- ✅ **Login with guest score transfer** (newly enhanced)
- ✅ **Login without guest score** (standard flow)
- ✅ **Guest score creation** (score-guest endpoint)
- ✅ **Registration without guest score** (standard flow)

### **Broken Flow:**
- ❌ **Registration with guest score transfer**

### **API Endpoints Status:**
| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/v1/auth/login` | ✅ Working | Enhanced with intelligent validation |
| `POST /api/v1/auth/register` | ⚠️ Partial | Works without sessionId, fails to transfer with sessionId |
| `POST /api/v1/daily-prompts/score-guest` | ❓ Unknown | Needs verification |
| `GET /api/v1/daily-prompts/today` | ✅ Working | Provides current prompt data |

## 🧪 Testing Protocol for Frontend

### **Step 1: Verify Guest Score Creation**
Test if guest scores are being created properly.

```javascript
// 1. Get today's prompt
const promptResponse = await fetch('/api/v1/daily-prompts/today');
const promptData = await promptResponse.json();
const promptId = promptData.data.prompt.id;

// 2. Create guest score
const sessionId = generateUUID(); // Your UUID generation function
localStorage.setItem('guestSessionId', sessionId);

const guestScoreResponse = await fetch('/api/v1/daily-prompts/score-guest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userPrompt: "Test prompt for debugging",
    promptId: promptId, // Use actual prompt ID
    sessionId: sessionId
  })
});

const guestScoreResult = await guestScoreResponse.json();
console.log('Guest Score Creation:', guestScoreResult);

// Expected: { success: true, data: { score: X, canTransferScore: true } }
```

### **Step 2: Test Registration Transfer (Immediately)**
After creating guest score, immediately test registration.

```javascript
// 3. Register with same sessionId (do this IMMEDIATELY after step 2)
const registrationResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "test@example.com",
    username: "testuser123",
    password: "TestPassword123!",
    sessionId: sessionId // Same sessionId from step 2
  })
});

const registrationResult = await registrationResponse.json();
console.log('Registration Result:', registrationResult);

// Expected: { success: true, user: {...}, transferredScore: {...} }
// Actual (broken): { success: true, user: {...} } - missing transferredScore
```

### **Step 3: Verify Data Timing**
Test if timing affects the transfer.

```javascript
// Test A: Immediate transfer (should work)
createGuestScore() → register() // Within seconds

// Test B: Delayed transfer (might fail)
createGuestScore() → wait 1+ hours → register() // Might hit Redis TTL

// Test C: Cross-day transfer (will fail)
createGuestScore() → wait until next day → register() // Different promptId
```

### **Step 4: Debug Response Patterns**

**Expected Registration Response (Working):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user_123",
    "email": "test@example.com",
    "username": "testuser123"
  },
  "transferredScore": {
    "submissionId": "submission_456",
    "score": 847,
    "message": "Your trial score has been saved to your account!"
  }
}
```

**Actual Registration Response (Broken):**
```json
{
  "success": true,
  "message": "Registration successful", 
  "user": {
    "id": "user_123",
    "email": "test@example.com",
    "username": "testuser123"
  }
  // Missing: transferredScore object
}
```

## 🛠️ Frontend Debugging Checklist

### **Pre-Registration Checks:**
- [ ] Verify `guestSessionId` exists in localStorage
- [ ] Confirm guest score was created successfully (got success response)
- [ ] Check that guest score was created today (not yesterday)
- [ ] Ensure registration happens soon after guest score creation (< 1 hour)

### **Registration Request Validation:**
- [ ] `sessionId` parameter is included in registration request
- [ ] `sessionId` is valid UUID format
- [ ] `sessionId` matches the one used for guest score creation

### **Response Analysis:**
- [ ] Registration returns `success: true`
- [ ] Check if `transferredScore` object exists in response
- [ ] If missing `transferredScore`, check browser console for any errors
- [ ] Verify no 4xx/5xx errors during registration

### **Error Scenarios to Test:**
```javascript
// Scenario 1: No guest score created
register({ sessionId: "new-uuid-never-used" })
// Expected: registration succeeds, no transferredScore

// Scenario 2: Invalid sessionId format  
register({ sessionId: "invalid-format" })
// Expected: 400 validation error

// Scenario 3: Expired guest score
createGuestScore() → wait 25+ hours → register()
// Expected: registration succeeds, no transferredScore

// Scenario 4: Wrong prompt day
createGuestScore() → next day → register() 
// Expected: registration succeeds, no transferredScore
```

## 🔧 Temporary Workarounds

### **Option 1: Login Flow (Recommended)**
If registration transfer is broken, guide users to login flow:

```javascript
// Instead of: Guest Score → Register
// Use: Guest Score → Register (basic) → Login (with transfer)

// 1. User creates guest score
createGuestScore(sessionId);

// 2. User registers WITHOUT sessionId
register({ email, username, password }); // No sessionId

// 3. User immediately logs in WITH sessionId  
login({ email, password, sessionId }); // This works with enhanced logic
```

### **Option 2: Retry Logic**
Implement retry mechanism for registration:

```javascript
const registerWithRetry = async (userData) => {
  const result = await register(userData);
  
  if (result.success && !result.transferredScore && userData.sessionId) {
    // Registration succeeded but no score transfer
    // Try login immediately to trigger transfer
    return await login({ 
      email: userData.email, 
      password: userData.password,
      sessionId: userData.sessionId 
    });
  }
  
  return result;
};
```

## 🚨 Critical Testing Notes

### **Data Dependencies:**
1. **Fresh Session IDs:** Always use new UUID for each test
2. **Same-Day Testing:** Create guest score and register on same day
3. **Immediate Testing:** Don't wait hours between guest score and registration
4. **Valid Prompt IDs:** Use actual prompt ID from today's prompt endpoint

### **Redis Considerations:**
- Guest scores stored in Redis with 24-hour TTL
- Redis connection issues might affect storage/retrieval
- Server logs show "Redis not available" warnings - might be related

### **Environment Factors:**
- Server timezone vs user timezone differences
- Daily prompt creation timing (00:01 UTC)
- Development vs production Redis configurations

## 📞 Backend Investigation Status

### **Code Analysis:**
- ✅ Registration function code is unchanged and should work
- ✅ Guest score service has proper validation logic
- ⚠️ Enhanced login logic might have side effects on shared service
- ❓ Need to verify guest score creation endpoint is working

### **Next Steps for Backend:**
1. Test complete flow with curl/Postman
2. Add debug logging to registration transfer process
3. Verify Redis data persistence and retrieval
4. Check if enhanced login validation affects registration logic

## 🎯 Recommendations for Frontend

### **Immediate Actions:**
1. **Test the complete flow** with fresh data (same day, immediate registration)
2. **Implement login workaround** as backup (register → login with sessionId)
3. **Add debug logging** to see exactly where transfer fails
4. **Monitor console errors** during registration process

### **User Experience:**
- Show loading state during registration transfer
- Provide clear messaging if transfer fails but registration succeeds
- Offer option to "save trial score" via login if registration doesn't transfer

### **Communication with Users:**
```javascript
// If registration succeeds but no score transfer:
"Account created successfully! Please log in to save your trial score."

// If guest score exists but registration fails:
"Registration successful! Your trial score will be saved to your account."
```

## 📋 Expected Timeline

- **Immediate:** Frontend can implement login workaround
- **Short-term (1-2 days):** Backend investigation and fix
- **Medium-term:** Full testing and verification of both flows

---

**Contact:** Backend team for technical investigation  
**Priority:** High - affects user onboarding experience  
**Workaround Available:** Yes - use login flow for score transfer
