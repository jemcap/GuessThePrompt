// Debug actual backend scoring response
async function debugScoring() {
  console.log('🔍 Testing Backend Scoring Response\n');
  
  // Test with identical prompts to see if we get 100% similarity
  const testPrompt = "Write a story about a magical coffee shop";
  
  try {
    // Get today's prompt first
    const promptResponse = await fetch('http://localhost:3003/api/v1/daily-prompts/today');
    const promptData = await promptResponse.json();
    const originalPrompt = promptData.data.prompt.originalPrompt;
    
    console.log('Original Prompt:', originalPrompt);
    console.log('Test Cases:\n');
    
    const testCases = [
      {
        name: 'Exact Match',
        userPrompt: originalPrompt // Use exact original prompt
      },
      {
        name: 'Close Match',
        userPrompt: originalPrompt.substring(0, Math.min(50, originalPrompt.length)) + '...'
      },
      {
        name: 'Different Prompt',
        userPrompt: 'Write a story about a magical coffee shop'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      console.log(`User Prompt: "${testCase.userPrompt}"`);
      
      // Test the backend scoring endpoint directly
      const response = await fetch('http://localhost:3003/api/v1/daily-prompts/score-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: testCase.userPrompt,
          promptId: promptData.data.prompt.id,
          sessionId: '550e8400-e29b-41d4-a716-' + Math.floor(Math.random() * 1000000000).toString().padStart(12, '0')
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Response:');
        console.log(`   Score: ${result.data.score}/${result.data.maxScore}`);
        console.log(`   Similarity: ${result.data.similarity}`);
        console.log(`   Breakdown:`, result.data.breakdown);
        console.log(`   Feedback: "${result.data.feedback}"`);
        
        // Check if similarity is in 0-1 or 0-100 format
        const similarityPercent = result.data.similarity > 1 
          ? result.data.similarity 
          : result.data.similarity * 100;
        console.log(`   Calculated %: ${similarityPercent.toFixed(1)}%`);
      } else {
        const error = await response.json();
        console.log('❌ Error:', error.error);
        if (error.details) console.log('   Details:', error.details);
      }
    }
  } catch (error) {
    console.error('💥 Failed:', error.message);
  }
}

debugScoring().catch(console.error);