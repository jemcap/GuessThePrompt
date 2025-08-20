// Test script for guest scoring flow
const API_BASE = 'http://localhost:3003/api/v1';

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testGuestFlow() {
  console.log('🧪 Testing Guest Scoring Flow\n');
  
  const sessionId = generateUUID();
  console.log('📝 Generated session ID:', sessionId);
  
  try {
    // Step 1: Get today's prompt
    console.log('\n1️⃣ Fetching today\'s prompt...');
    const promptResponse = await fetch(`${API_BASE}/daily-prompts/today`);
    const promptData = await promptResponse.json();
    
    if (!promptData.success) {
      throw new Error('Failed to fetch prompt');
    }
    
    const promptId = promptData.data.prompt.id;
    console.log('✅ Got prompt ID:', promptId);
    console.log('   Category:', promptData.data.prompt.category);
    console.log('   Difficulty:', promptData.data.prompt.difficulty);
    
    // Step 2: Submit guest score
    console.log('\n2️⃣ Submitting guest score...');
    console.log('   Using promptId:', promptId);
    console.log('   Using sessionId:', sessionId);
    
    const scoreResponse = await fetch(`${API_BASE}/daily-prompts/score-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userPrompt: 'Write a Python function to analyze CSV data with statistics',
        promptId: promptId,
        sessionId: sessionId
      })
    });
    
    if (!scoreResponse.ok) {
      const errorData = await scoreResponse.json();
      throw new Error(`Scoring failed: ${errorData.error || scoreResponse.statusText}`);
    }
    
    const scoreData = await scoreResponse.json();
    console.log('✅ Score received!');
    console.log('   Score:', scoreData.data.score);
    console.log('   Similarity:', scoreData.data.similarity + '%');
    console.log('   Feedback:', scoreData.data.feedback);
    console.log('   Can transfer:', scoreData.data.canTransferScore);
    
    // Step 3: Try to score again (should fail)
    console.log('\n3️⃣ Testing duplicate submission (should fail)...');
    const duplicateResponse = await fetch(`${API_BASE}/daily-prompts/score-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userPrompt: 'Another attempt',
        promptId: promptId,
        sessionId: sessionId
      })
    });
    
    if (duplicateResponse.ok) {
      console.log('❌ Duplicate was allowed (unexpected)');
    } else {
      const errorData = await duplicateResponse.json();
      console.log('✅ Duplicate blocked:', errorData.error);
    }
    
    console.log('\n✨ Guest flow test completed successfully!');
    console.log('\nNext step would be registration with sessionId:', sessionId);
    console.log('This would transfer the score to the new user account.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testGuestFlow();