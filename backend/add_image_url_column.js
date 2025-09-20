const db = require('./config/database-sqlite');

async function addImageUrlColumn() {
  try {
    console.log('=== Adding aircraft_image_url column to flights table ===');
    
    // Add aircraft_image_url column to flights table
    await db.query('ALTER TABLE flights ADD COLUMN aircraft_image_url TEXT');
    console.log('✅ Added aircraft_image_url column to flights table');
    
    console.log('✅ Database updated successfully for image storage');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️  aircraft_image_url column already exists');
      console.log('✅ Database ready for image storage');
      process.exit(0);
    } else {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }
}

addImageUrlColumn();