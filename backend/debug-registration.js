// Test operator registration to debug the 500 error
const fetch = require('node-fetch');

const testOperatorRegistration = async () => {
  try {
    console.log('🧪 Testing operator registration to debug 500 error...');
    
    const operatorData = {
      email: `debug.operator.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'operator',
      companyName: 'Debug Aviation Company',
      signupCode: 'code'
    };

    console.log('📤 Sending registration request:', JSON.stringify(operatorData, null, 2));

    const response = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operatorData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.text();
    console.log('📥 Raw response:', result);

    try {
      const parsedResult = JSON.parse(result);
      console.log('📥 Parsed response:', JSON.stringify(parsedResult, null, 2));
    } catch (e) {
      console.log('⚠️ Could not parse response as JSON');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

testOperatorRegistration();