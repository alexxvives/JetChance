const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Create notifications table
const createNotificationsTable = `
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    flight_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES operators(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
  )
`;

db.serialize(() => {
  console.log('🔧 Creating notifications table...');
  
  db.run(createNotificationsTable, (err) => {
    if (err) {
      console.error('❌ Error creating notifications table:', err);
    } else {
      console.log('✅ Notifications table created successfully');
    }
  });

  // Create index for faster queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`, (err) => {
    if (err) {
      console.error('❌ Error creating index:', err);
    } else {
      console.log('✅ Created index on user_id');
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at)`, (err) => {
    if (err) {
      console.error('❌ Error creating index:', err);
    } else {
      console.log('✅ Created index on read_at');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err);
  } else {
    console.log('✅ Database connection closed');
  }
});