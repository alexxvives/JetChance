const Database = require('better-sqlite3');
const db = new Database('./jetchance.db', { readonly: true });

console.log('\n=== TABLAS EN jetchance.db ===\n');

const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
console.log('Tablas encontradas:', tables.map(t => t.name));
console.log('\n=== ESTRUCTURAS DE TABLAS ===\n');

tables.forEach(table => {
  const result = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table.name);
  if (result) {
    console.log(`\n--- ${table.name.toUpperCase()} ---`);
    console.log(result.sql);
  }
});

db.close();
