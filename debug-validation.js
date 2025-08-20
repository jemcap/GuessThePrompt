// Debug validation error
async function testValidation() {
  console.log('🔍 Testing validation with actual data formats\n');
  
  // Get today's prompt first
  const promptResponse = await fetch('http://localhost:3003/api/v1/daily-prompts/today');
  const promptData = await promptResponse.json();
  const actualPromptId = promptData.data.prompt.id;
  
  console.log('Actual prompt ID from API:', actualPromptId);
  console.log('ID length:', actualPromptId.length);
  console.log('ID format:', /^[a-z0-9]+$/.test(actualPromptId) ? 'alphanumeric' : 'other');
  
  // Test with various session ID formats
  const testCases = [
    {
      name: 'UUID sessionId',
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      promptId: actualPromptId
    },
    {
      name: 'CUID-like sessionId',
      sessionId: 'cjld2cjxh0000qzrmn831i7rn',
      promptId: actualPromptId
    },
    {
      name: 'UUID promptId',
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      promptId: '550e8400-e29b-41d4-a716-446655440001'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`   SessionId: ${testCase.sessionId}`);
    console.log(`   PromptId: ${testCase.promptId}`);
    
    try {
      const response = await fetch('http://localhost:3003/api/v1/daily-prompts/score-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: 'Test prompt for validation',
          promptId: testCase.promptId,
          sessionId: testCase.sessionId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('   ✅ Success!', data.data ? `Score: ${data.data.score}` : '');
      } else {
        console.log('   ❌ Failed:', data.error);
        if (data.details) {
          console.log('   Details:', data.details);
        }
      }
    } catch (error) {
      console.log('   💥 Network error:', error.message);
    }
  }
}

testValidation().catch(console.error);