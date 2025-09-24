// Test operator registration with new table structure
const fetch = require('node-fetch');

const testOperatorRegistration = async () => {
  try {
    console.log('🧪 Testing operator registration with new table structure...');
    
    // Test data for operator registration
    const operatorData = {
      email: `test.operator.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'operator',
      companyName: 'Test Aviation Company',
      signupCode: 'code'
    };

    console.log('📤 Sending registration request:', operatorData);

    const response = await fetch('http://localhost:4001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operatorData)
    });

    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Operator registration successful!');
      console.log('🎯 User ID:', result.user.id);
      console.log('🎯 Email:', result.user.email);
      console.log('🎯 Role:', result.user.role);
      console.log('🎯 Company:', result.user.companyName);
      return result;
    } else {
      console.log('❌ Operator registration failed');
      console.error('Error:', result);
      return null;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return null;
  }
};

const testCustomerRegistration = async () => {
  try {
    console.log('\n🧪 Testing customer registration with new table structure...');
    
    // Test data for customer registration
    const customerData = {
      email: `test.customer.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      firstName: 'John',
      lastName: 'Doe'
    };

    console.log('📤 Sending registration request:', customerData);

    const response = await fetch('http://localhost:4001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData)
    });

    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Customer registration successful!');
      console.log('🎯 User ID:', result.user.id);
      console.log('🎯 Email:', result.user.email);
      console.log('🎯 Role:', result.user.role);
      console.log('🎯 Name:', result.user.firstName, result.user.lastName);
      return result;
    } else {
      console.log('❌ Customer registration failed');
      console.error('Error:', result);
      return null;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return null;
  }
};

const testLogin = async (email, password) => {
  try {
    console.log(`\n🧪 Testing login for ${email}...`);
    
    const loginData = { email, password };

    const response = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Login successful!');
      return result;
    } else {
      console.log('❌ Login failed');
      console.error('Error:', result);
      return null;
    }

  } catch (error) {
    console.error('❌ Login test failed with error:', error);
    return null;
  }
};

const runTests = async () => {
  console.log('🏁 Starting registration and login tests...\n');
  
  // Test operator registration
  const operatorResult = await testOperatorRegistration();
  
  // Test customer registration
  const customerResult = await testCustomerRegistration();
  
  // Test login for both if registration was successful
  if (operatorResult) {
    await testLogin(operatorResult.user.email, 'TestPassword123!');
  }
  
  if (customerResult) {
    await testLogin(customerResult.user.email, 'TestPassword123!');
  }
  
  console.log('\n🏁 All tests completed!');
};

// Run tests
runTests().catch(console.error);