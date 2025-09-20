const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./chancefly.db');

db.all('SELECT id, role, email FROM users', (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('All users:');
        rows.forEach(row => {
            console.log(`${row.id}: ${row.role} (${row.email})`);
        });
    }
    
    db.close();
});