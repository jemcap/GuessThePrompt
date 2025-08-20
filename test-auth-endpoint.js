// Test what the authenticated endpoint expects
async function testAuthEndpoint() {
  console.log('🔍 Testing authenticated endpoint for comparison\n');
  
  // Get today's prompt first
  const promptResponse = await fetch('http://localhost:3003/api/v1/daily-prompts/today');
  const promptData = await promptResponse.json();
  
  console.log('Prompt data structure:');
  console.log(JSON.stringify(promptData, null, 2));
}

testAuthEndpoint().catch(console.error);