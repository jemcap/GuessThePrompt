// Test script to verify practice API integration
const API_BASE_URL = "http://localhost:3003/api/v1/practice";

async function testHealthEndpoint() {
  console.log('🏥 Testing health endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('Health Check Response:', data);
    return data.success && data.data?.ready;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testEvaluateEndpoint() {
  console.log('🤖 Testing evaluate endpoint...');
  
  const testRequest = {
    userInputs: {
      role: "technical documentation writer",
      task: "write clear JSDoc comments",
      context: "JavaScript function for other developers",
      reasoning: "help team understand function usage",
      outputFormat: "structured JSDoc with examples",
      stopConditions: "end of comment block"
    },
    expectedAnswers: {
      role: "technical documentation writer",
      task: "write JSDoc documentation for a factorial function", 
      context: "JavaScript function that needs clear documentation for other developers",
      reasoning: "proper documentation helps team members understand function purpose and usage",
      outputFormat: "JSDoc comment block with description, parameters, return value, errors, and examples",
      stopConditions: "closing comment marker"
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRequest),
    });

    const data = await response.json();
    console.log('Evaluate Response Status:', response.status);
    console.log('Evaluate Response Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ API working correctly!');
      console.log('📊 Total Score:', data.data.totalScore);
      console.log('🎯 Component Scores:', data.data.componentScores);
      console.log('✓ Feedback:', data.data.feedback);
    } else {
      console.log('❌ API returned error:', data.error || 'Unknown error');
    }

    return data;
  } catch (error) {
    console.error('❌ Evaluate request failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Practice API Tests\n');
  
  const healthOk = await testHealthEndpoint();
  console.log('');
  
  if (healthOk) {
    console.log('✅ Health check passed, testing evaluate endpoint...\n');
    await testEvaluateEndpoint();
  } else {
    console.log('❌ Health check failed, skipping evaluate test');
    console.log('💡 Make sure your backend server is running with the TensorFlow.js model loaded');
  }
  
  console.log('\n🏁 Tests completed');
}

// Run the tests
runTests().catch(console.error);