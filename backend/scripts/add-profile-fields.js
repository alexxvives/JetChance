const { query, run } = require('../config/database-sqlite');

const addProfileFields = async () => {
  try {
    console.log('🚀 Adding profile fields to database...');

    // Add new fields to users table
    const userFields = [
      'phone TEXT',
      'address TEXT',
      'date_of_birth DATE',
      'notification_email BOOLEAN DEFAULT true',
      'notification_sms BOOLEAN DEFAULT true',
      'notification_marketing BOOLEAN DEFAULT true'
    ];

    for (const field of userFields) {
      try {
        await run(`ALTER TABLE users ADD COLUMN ${field}`);
        console.log(`✅ Added ${field} to users table`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`⏭️ Column ${field.split(' ')[0]} already exists in users table`);
        } else {
          console.error(`❌ Error adding ${field} to users table:`, error.message);
        }
      }
    }

    // Add company_address to operators table
    try {
      await run('ALTER TABLE operators ADD COLUMN company_address TEXT');
      console.log('✅ Added company_address TEXT to operators table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('⏭️ Column company_address already exists in operators table');
      } else {
        console.error('❌ Error adding company_address to operators table:', error.message);
      }
    }

    // Add operator_id without UNIQUE constraint first
    try {
      await run('ALTER TABLE operators ADD COLUMN operator_id TEXT');
      console.log('✅ Added operator_id TEXT to operators table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('⏭️ Column operator_id already exists in operators table');
      } else {
        console.error('❌ Error adding operator_id to operators table:', error.message);
      }
    }

    // Generate operator IDs for existing operators that don't have one
    const operatorResult = await query('SELECT id FROM operators WHERE operator_id IS NULL OR operator_id = ""');
    const operators = operatorResult.rows;
    
    for (let i = 0; i < operators.length; i++) {
      const operatorId = `OP${String(i + 1).padStart(3, '0')}`;
      await run('UPDATE operators SET operator_id = ? WHERE id = ?', [operatorId, operators[i].id]);
      console.log(`✅ Generated operator ID ${operatorId} for operator ${operators[i].id}`);
    }

    console.log('✅ Profile fields migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run the migration
if (require.main === module) {
  addProfileFields().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { addProfileFields };