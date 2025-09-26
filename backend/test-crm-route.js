const express = require('express');
const { query, run, db } = require('./config/database-sqlite');
const { authenticate, authorize } = require('./middleware/auth');

const app = express();

// Test CRM endpoint
app.get('/test-crm', authenticate, authorize(['super-admin']), async (req, res) => {
  try {
    console.log('🏢 Testing CRM endpoint');

    // Simple test - just return a basic message first
    res.json({
      message: "CRM endpoint is working",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test CRM error:', error);
    res.status(500).json({
      error: 'Test CRM failed',
      details: error.message
    });
  }
});

app.listen(4001, () => {
  console.log('Test server running on port 4001');
});

module.exports = app;