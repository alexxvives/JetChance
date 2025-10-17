const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/jetchance.db');

console.log('\n=== TABLAS EN jetchance.db ===\n');

db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  const tables = rows.map(r => r.name);
  console.log('Tablas encontradas:', tables);
  console.log('\n=== ESTRUCTURAS DE TABLAS ===\n');
  
  let pending = tables.length;
  
  tables.forEach(tableName => {
    db.all(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, result) => {
      if (err) {
        console.error(`Error en ${tableName}:`, err);
      } else if (result[0]) {
        console.log(`\n--- ${tableName.toUpperCase()} ---`);
        console.log(result[0].sql);
      }
      
      pending--;
      if (pending === 0) {
        db.close();
      }
    });
  });
});
