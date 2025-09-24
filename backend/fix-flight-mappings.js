const db = require('./config/database-sqlite');

const fixFlightOperatorMappings = async () => {
  try {
    console.log('🔧 Fixing flight operator mappings...');

    // Get all flights with their current operator mappings
    const flights = await db.query('SELECT id, operator_id, new_operator_id FROM flights');
    console.log(`Found ${flights.rows.length} flights to check`);

    for (const flight of flights.rows) {
      console.log(`Flight ${flight.id}: operator_id=${flight.operator_id}, new_operator_id=${flight.new_operator_id}`);
      
      // Find the old operator record
      const oldOperator = await db.query('SELECT user_id FROM operators WHERE id = ?', [flight.operator_id]);
      
      if (oldOperator.rows.length > 0) {
        const userId = oldOperator.rows[0].user_id;
        
        // Find the corresponding new operator record
        const newOperator = await db.query('SELECT id FROM operators_new WHERE auth_user_id = ?', [userId]);
        
        if (newOperator.rows.length > 0) {
          const newOperatorId = newOperator.rows[0].id;
          console.log(`  → Mapping ${flight.operator_id} (user: ${userId}) to ${newOperatorId}`);
          
          // Update the flight's new_operator_id
          await db.run('UPDATE flights SET new_operator_id = ? WHERE id = ?', [newOperatorId, flight.id]);
          console.log(`  ✅ Updated flight ${flight.id}`);
        } else {
          console.log(`  ⚠️ No new operator found for user ${userId}`);
        }
      } else {
        console.log(`  ⚠️ Old operator ${flight.operator_id} not found`);
      }
    }

    // Test the fix
    console.log('\n🧪 Testing flight-operator join after fix...');
    const testQuery = await db.query(`
      SELECT 
        f.id, f.flight_number,
        o.company_name as operator_name
      FROM flights f
      JOIN operators_new o ON f.new_operator_id = o.id
      LIMIT 3
    `);
    
    console.log(`✅ Found ${testQuery.rows.length} flights with proper operator joins:`);
    testQuery.rows.forEach(row => {
      console.log(`  - Flight ${row.id}: ${row.operator_name}`);
    });

    console.log('\n🎉 Flight operator mappings fixed!');

  } catch (error) {
    console.error('❌ Error fixing mappings:', error);
  }
};

fixFlightOperatorMappings();