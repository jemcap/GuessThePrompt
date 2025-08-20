// Simple test to see backend response format
async function simpleTest() {
  console.log('🔍 Simple Backend Test\n');
  
  // Test with UUID format for both IDs
  const response = await fetch('http://localhost:3003/api/v1/daily-prompts/score-guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userPrompt: 'Write a Python function to analyze data',
      promptId: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: '550e8400-e29b-41d4-a716-446655440001'
    })
  });
  
  const result = await response.json();
  console.log('Response status:', response.status);
  console.log('Response data:', JSON.stringify(result, null, 2));
}

simpleTest().catch(console.error);