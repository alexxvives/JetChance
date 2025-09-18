const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./config/database-sqlite');

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Delete existing test users first
    await db.run('DELETE FROM users WHERE email IN (?, ?)', ['test@example.com', 'operator@example.com']);
    
    // Create test customer
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash('password123', 12);
    
    await db.run(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'test@example.com', passwordHash, 'Test', 'User', 'customer', 1]
    );
    
    console.log('✅ Test customer account created:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role: customer');
    
    // Create test operator
    const operatorUserId = uuidv4();
    const operatorPasswordHash = await bcrypt.hash('operator123', 12);
    
    await db.run(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [operatorUserId, 'operator@example.com', operatorPasswordHash, 'Test', 'Operator', 'operator', 1]
    );
    
    // Create operator profile
    const operatorId = uuidv4();
    await db.run(
      `INSERT INTO operators (id, user_id, company_name, status)
       VALUES (?, ?, ?, ?)`,
      [operatorId, operatorUserId, 'Test Aviation Company', 'approved']
    );
    
    console.log('✅ Test operator account created:');
    console.log('   Email: operator@example.com');
    console.log('   Password: operator123');
    console.log('   Role: operator');
    
    console.log('\n🎉 Test users created successfully!');
    console.log('\nYou can now test the email-based authentication with:');
    console.log('Customer: test@example.com / password123');
    console.log('Operator: operator@example.com / operator123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestUsers();