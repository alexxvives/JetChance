const Database = require('better-sqlite3');
const path = require('path');

async function addMultipleImagesSupport() {
  const dbPath = path.join(__dirname, '..', 'chancefly.db');
  const db = new Database(dbPath);
  
  console.log('🔧 Adding multiple images support to flights table...');
  
  try {
    // Begin transaction
    db.exec('BEGIN TRANSACTION');
    
    // Add images column to store JSON array of image URLs
    const addImagesColumn = `
      ALTER TABLE flights 
      ADD COLUMN images TEXT DEFAULT '[]'
    `;
    
    try {
      db.exec(addImagesColumn);
      console.log('✅ Added images column to flights table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ Images column already exists');
      } else {
        throw error;
      }
    }
    
    // Migrate existing aircraft_image_url values to images array
    const migrateExistingImages = `
      UPDATE flights 
      SET images = json_array(aircraft_image_url)
      WHERE aircraft_image_url IS NOT NULL 
        AND aircraft_image_url != ''
        AND (images IS NULL OR images = '[]')
    `;
    
    const result = db.exec(migrateExistingImages);
    console.log('✅ Migrated existing single images to images array');
    
    // Commit transaction
    db.exec('COMMIT');
    console.log('✅ Multiple images support added successfully!');
    
    // Display some sample data
    const sampleFlights = db.prepare(`
      SELECT id, flight_number, aircraft_image_url, images 
      FROM flights 
      WHERE images IS NOT NULL AND images != '[]'
      LIMIT 5
    `).all();
    
    console.log('\n📊 Sample flights with images:');
    sampleFlights.forEach(flight => {
      console.log(`- ${flight.flight_number}: ${flight.images}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding multiple images support:', error);
    db.exec('ROLLBACK');
    throw error;
  } finally {
    db.close();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addMultipleImagesSupport()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addMultipleImagesSupport };