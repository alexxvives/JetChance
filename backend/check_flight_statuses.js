const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./chancefly.db');

// Check all flights and their statuses
db.all('SELECT id, status, origin_code, destination_code FROM flights ORDER BY created_at DESC', (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('All flights in database:');
        rows.forEach(row => {
            console.log(`${row.id}: ${row.status} (${row.origin_code} → ${row.destination_code})`);
        });
        
        const approvedFlights = rows.filter(f => f.status === 'approved');
        const pendingFlights = rows.filter(f => f.status === 'pending');
        
        console.log(`\nSummary:`);
        console.log(`- Total flights: ${rows.length}`);
        console.log(`- Approved flights: ${approvedFlights.length}`);
        console.log(`- Pending flights: ${pendingFlights.length}`);
        
        if (pendingFlights.length > 0) {
            console.log('\nPending flights that should NOT be visible to customers:');
            pendingFlights.forEach(flight => {
                console.log(`- ${flight.id}: ${flight.origin_code} → ${flight.destination_code}`);
            });
        }
    }
    
    db.close();
});