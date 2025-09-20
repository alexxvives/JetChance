const express = require('express');
const cors = require('cors');
const { query } = require('./config/database-sqlite');

const app = express();

app.use(cors());
app.use(express.json());

// Simple test endpoint to check approved flights
app.get('/test/approved-flights', async (req, res) => {
  try {
    console.log('Testing approved flights query...');
    
    const result = await query(`
      SELECT id, origin_code, destination_code, status 
      FROM flights 
      WHERE status = ?
    `, ['approved']);
    
    console.log('Query result:', result);
    
    res.json({
      success: true,
      count: result.rows.length,
      flights: result.rows
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = 4001;
app.listen(port, () => {
  console.log(`🔧 Debug server running on port ${port}`);
});