const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'chancefly.db');
const db = new Database(dbPath);

const query = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(params);
    return Promise.resolve({ rows });
  } catch (err) {
    return Promise.reject(err);
  }
};

const run = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(params);
    return Promise.resolve({ 
      lastID: result.lastInsertRowid, 
      changes: result.changes 
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

// Add query method to db object for backwards compatibility
db.query = query;

module.exports = {
  query,
  run,
  db
};
