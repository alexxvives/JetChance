// Helper functions for managing operator flight counts
const Database = require('better-sqlite3');
const path = require('path');

class OperatorFlightCounter {
  static getDatabase() {
    const dbPath = path.join(__dirname, '../jetchance.db');
    return new Database(dbPath);
  }

  // Update operator's total_flights count based on actual flights in database
  static async updateOperatorFlightCount(operatorId) {
    const db = this.getDatabase();
    try {
      // Count actual flights for this operator
      const flightCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM flights 
        WHERE operator_id = ?
      `).get(operatorId);

      // Update operator's total_flights
      db.prepare(`
        UPDATE operators 
        SET total_flights = ?, updated_at = ?
        WHERE id = ?
      `).run(flightCount.count, new Date().toISOString(), operatorId);

      console.log(`✅ Updated operator ${operatorId} flight count to ${flightCount.count}`);
      return flightCount.count;
    } finally {
      db.close();
    }
  }

  // Increment operator's flight count (when flight is created)
  static async incrementFlightCount(operatorId) {
    const db = this.getDatabase();
    try {
      db.prepare(`
        UPDATE operators 
        SET total_flights = total_flights + 1, updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), operatorId);

      console.log(`✅ Incremented flight count for operator ${operatorId}`);
    } finally {
      db.close();
    }
  }

  // Decrement operator's flight count (when flight is deleted)
  static async decrementFlightCount(operatorId) {
    const db = this.getDatabase();
    try {
      db.prepare(`
        UPDATE operators 
        SET total_flights = CASE 
          WHEN total_flights > 0 THEN total_flights - 1 
          ELSE 0 
        END,
        updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), operatorId);

      console.log(`✅ Decremented flight count for operator ${operatorId}`);
    } finally {
      db.close();
    }
  }

  // Recalculate all operator flight counts (useful for data consistency)
  static async recalculateAllFlightCounts() {
    const db = this.getDatabase();
    try {
      const operators = db.prepare('SELECT id FROM operators').all();
      
      for (const operator of operators) {
        await this.updateOperatorFlightCount(operator.id);
      }
      
      console.log(`✅ Recalculated flight counts for ${operators.length} operators`);
    } finally {
      db.close();
    }
  }
}

module.exports = OperatorFlightCounter;