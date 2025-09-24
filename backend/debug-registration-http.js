const http = require('http');

async function testOperatorRegistration() {
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

    const postData = JSON.stringify(operatorData);
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    if (response.status === 201) {
      console.log('✅ Registration successful!');
      console.log('👤 Created user:', JSON.stringify(response.data.user, null, 2));
      console.log('🔑 Access token received:', response.data.tokens?.accessToken ? 'Yes' : 'No');
    } else {
      console.log(`❌ Registration failed with status ${response.status}`);
      console.log('📋 Error response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('📋 Full error:', error);
  }
}

// Run the test
testOperatorRegistration();