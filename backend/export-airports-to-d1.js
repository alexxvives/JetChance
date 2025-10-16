const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Connect to local database
const db = new Database('jetchance.db');

console.log('🚀 Exporting airports from local database to D1 SQL format...\n');

// Get all airports
const airports = db.prepare(`
  SELECT 
    code, 
    name, 
    city, 
    country, 
    latitude, 
    longitude, 
    status,
    created_at
  FROM airports
  ORDER BY country, city, code
`).all();

console.log(`📊 Found ${airports.length} airports to export\n`);

// Generate SQL file
let sql = `-- Airport Data Export for JetChance D1
-- Exported: ${new Date().toISOString()}
-- Total airports: ${airports.length}
-- ========================================================================
-- This file contains all airports from the production database
-- Run with: wrangler d1 execute jetchance_db --file=./airports-export.sql
-- ========================================================================

`;

// Group by country for better organization
const byCountry = {};
airports.forEach(airport => {
  if (!byCountry[airport.country]) {
    byCountry[airport.country] = [];
  }
  byCountry[airport.country].push(airport);
});

// Generate INSERT statements by country
Object.keys(byCountry).sort().forEach(country => {
  const countryAirports = byCountry[country];
  sql += `\n-- ${country} (${countryAirports.length} airports)\n`;
  
  countryAirports.forEach(airport => {
    // Escape single quotes in names
    const name = airport.name.replace(/'/g, "''");
    const city = airport.city.replace(/'/g, "''");
    
    sql += `INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES `;
    sql += `('${airport.code}', '${name}', '${city}', '${airport.country}', `;
    sql += `${airport.latitude || 'NULL'}, ${airport.longitude || 'NULL'}, `;
    sql += `'${airport.status}', CURRENT_TIMESTAMP);\n`;
  });
});

// Add summary at the end
sql += `\n-- ========================================================================\n`;
sql += `-- Export complete: ${airports.length} airports\n`;
sql += `-- Distribution by country:\n`;
Object.keys(byCountry).sort().forEach(country => {
  sql += `--   ${country}: ${byCountry[country].length} airports\n`;
});
sql += `-- ========================================================================\n`;

// Save to workers directory
const outputPath = path.join(__dirname, '..', 'workers', 'chancefly-api', 'airports-export.sql');
fs.writeFileSync(outputPath, sql);

console.log('✅ Export completed successfully!\n');
console.log(`📁 File saved to: ${outputPath}\n`);
console.log('📊 Distribution by country:');
Object.keys(byCountry).sort().forEach(country => {
  console.log(`   ${country}: ${byCountry[country].length} airports`);
});

console.log('\n🚀 To import to Cloudflare D1, run:');
console.log('   cd workers/chancefly-api');
console.log('   wrangler d1 execute jetchance_db --file=./airports-export.sql\n');

// Show some sample airports
console.log('📋 Sample airports (first 10):');
airports.slice(0, 10).forEach(airport => {
  console.log(`   ${airport.code} - ${airport.name} (${airport.city}, ${airport.country})`);
});

db.close();
