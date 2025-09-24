const db = require('./config/database-sqlite');

const testNewTableStructure = async () => {
  try {
    console.log('🧪 Testing new table structure...');

    // Test 1: Check if tables exist
    console.log('\n1. Checking table existence...');
    const tables = await db.query(`SELECT name FROM sqlite_master WHERE type='table'`);
    const tableNames = tables.rows.map(row => row.name);
    
    console.log('✅ Tables found:', tableNames);
    
    const requiredTables = ['auth_users', 'customers', 'operators_new'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables);
      return;
    }
    
    console.log('✅ All required tables exist');

    // Test 2: Check if we can query migrated data
    console.log('\n2. Checking migrated data...');
    
    const authUsers = await db.query('SELECT COUNT(*) as count FROM auth_users');
    console.log('✅ Auth users count:', authUsers.rows[0].count);
    
    const customers = await db.query('SELECT COUNT(*) as count FROM customers');
    console.log('✅ Customers count:', customers.rows[0].count);
    
    const operators = await db.query('SELECT COUNT(*) as count FROM operators_new');
    console.log('✅ Operators count:', operators.rows[0].count);

    // Test 3: Test a customer view query
    console.log('\n3. Testing customer view query...');
    const customerData = await db.query(`
      SELECT 
        au.id, au.email, au.role,
        c.first_name, c.last_name
      FROM auth_users au
      JOIN customers c ON au.id = c.auth_user_id
      WHERE au.role = 'customer'
      LIMIT 1
    `);
    
    if (customerData.rows.length > 0) {
      console.log('✅ Customer query successful:', customerData.rows[0]);
    } else {
      console.log('⚠️ No customers found');
    }

    // Test 4: Test an operator view query
    console.log('\n4. Testing operator view query...');
    const operatorData = await db.query(`
      SELECT 
        au.id, au.email, au.role,
        o.company_name, o.is_individual, o.status
      FROM auth_users au
      JOIN operators_new o ON au.id = o.auth_user_id
      WHERE au.role = 'operator'
      LIMIT 1
    `);
    
    if (operatorData.rows.length > 0) {
      console.log('✅ Operator query successful:', operatorData.rows[0]);
    } else {
      console.log('⚠️ No operators found');
    }

    // Test 5: Test flights with new operator join
    console.log('\n5. Testing flights with new operator join...');
    const flightData = await db.query(`
      SELECT 
        f.id, f.flight_number,
        o.company_name as operator_name
      FROM flights f
      JOIN operators_new o ON f.new_operator_id = o.id
      LIMIT 1
    `);
    
    if (flightData.rows.length > 0) {
      console.log('✅ Flight-operator join successful:', flightData.rows[0]);
    } else {
      console.log('⚠️ No flights found with operators');
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testNewTableStructure();