const Database = require('better-sqlite3');
const db = new Database('./jetchance.db');

console.log('🔄 Sincronizando airports...');

// SQLite no permite DROP COLUMN, así que recreamos la tabla
db.exec(`
  -- Crear tabla temporal con estructura correcta
  CREATE TABLE airports_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  );
  
  -- Copiar datos (solo columnas que existen en ambas)
  INSERT INTO airports_new (id, code, name, city, country, latitude, longitude, created_at, status)
  SELECT id, code, name, city, country, latitude, longitude, created_at, status
  FROM airports;
  
  -- Eliminar tabla vieja
  DROP TABLE airports;
  
  -- Renombrar nueva tabla
  ALTER TABLE airports_new RENAME TO airports;
`);

console.log('✅ Airports actualizado - columnas created_by, reviewed_by, reviewed_at eliminadas');

db.close();
