const db = require('./config/database-sqlite');

async function addAircraftNameColumn() {
  try {
    console.log('=== Adding aircraft_name column to flights table ===');
    
    // Add aircraft_name column to flights table
    await db.query('ALTER TABLE flights ADD COLUMN aircraft_name TEXT');
    console.log('✅ Added aircraft_name column to flights table');
    
    // Update existing flights to have aircraft names based on their aircraft_id
    const existingFlights = await db.query(`
      SELECT f.id, f.aircraft_id, a.manufacturer, a.model 
      FROM flights f 
      LEFT JOIN aircraft a ON f.aircraft_id = a.id
    `);
    
    console.log(`Found ${existingFlights.rows.length} existing flights to update`);
    
    for (const flight of existingFlights.rows) {
      const aircraftName = flight.manufacturer && flight.model 
        ? `${flight.manufacturer} ${flight.model}` 
        : 'Private Jet';
      
      await db.query(
        'UPDATE flights SET aircraft_name = $1 WHERE id = $2',
        [aircraftName, flight.id]
      );
      
      console.log(`Updated flight ${flight.id} with aircraft name: ${aircraftName}`);
    }
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️  aircraft_name column already exists, updating existing flights...');
      
      // Just update existing flights
      const existingFlights = await db.query(`
        SELECT f.id, f.aircraft_id, a.manufacturer, a.model 
        FROM flights f 
        LEFT JOIN aircraft a ON f.aircraft_id = a.id
        WHERE f.aircraft_name IS NULL OR f.aircraft_name = ''
      `);
      
      console.log(`Found ${existingFlights.rows.length} flights to update`);
      
      for (const flight of existingFlights.rows) {
        const aircraftName = flight.manufacturer && flight.model 
          ? `${flight.manufacturer} ${flight.model}` 
          : 'Private Jet';
        
        await db.query(
          'UPDATE flights SET aircraft_name = $1 WHERE id = $2',
          [aircraftName, flight.id]
        );
        
        console.log(`Updated flight ${flight.id} with aircraft name: ${aircraftName}`);
      }
      
      console.log('✅ Update completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }
}

addAircraftNameColumn();