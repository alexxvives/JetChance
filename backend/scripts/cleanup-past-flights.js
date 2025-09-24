const Database = require('better-sqlite3');
const path = require('path');

async function cleanupPastFlights() {
  const dbPath = path.join(__dirname, '..', 'chancefly.db');
  const db = new Database(dbPath);
  
  console.log('🧹 Cleaning up past flights from database...');
  
  try {
    // Begin transaction
    db.exec('BEGIN TRANSACTION');
    
    // First, let's see how many past flights we have
    const pastFlightsCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM flights 
      WHERE departure_datetime < datetime('now')
      AND status NOT IN ('completed', 'cancelled')
    `).get();
    
    console.log(`📊 Found ${pastFlightsCount.count} past flights that need cleanup`);
    
    if (pastFlightsCount.count > 0) {
      // Option 1: Mark past flights as 'completed' instead of deleting them
      const updateResult = db.prepare(`
        UPDATE flights 
        SET status = 'completed',
            available_seats = 0
        WHERE departure_datetime < datetime('now')
        AND status NOT IN ('completed', 'cancelled')
      `).run();
      
      console.log(`✅ Updated ${updateResult.changes} past flights to 'completed' status`);
      
      // Optional: Show some examples of updated flights
      const updatedFlights = db.prepare(`
        SELECT flight_number, origin_city, destination_city, departure_datetime, status
        FROM flights 
        WHERE status = 'completed'
        AND departure_datetime < datetime('now')
        ORDER BY departure_datetime DESC
        LIMIT 5
      `).all();
      
      console.log('\n📋 Sample updated flights:');
      updatedFlights.forEach(flight => {
        console.log(`- ${flight.flight_number}: ${flight.origin_city} → ${flight.destination_city} (${new Date(flight.departure_datetime).toLocaleDateString()}) - ${flight.status}`);
      });
    }
    
    // Commit transaction
    db.exec('COMMIT');
    console.log('✅ Past flights cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    db.exec('ROLLBACK');
    throw error;
  } finally {
    db.close();
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupPastFlights()
    .then(() => {
      console.log('✅ Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupPastFlights };