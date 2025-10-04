// Sequential ID generator for JetChance
// Generates clean, sequential IDs: US000001, OP000001, FL000001, etc.

const Database = require('better-sqlite3');
const path = require('path');

class SimpleIDGenerator {
  static getDatabase() {
    const dbPath = path.join(__dirname, '../jetchance.db');
    return new Database(dbPath);
  }

  // Generate sequential user ID: US000001, US000002, etc.
  static generateUserId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM users ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'US' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Generate sequential operator ID: OP000001, OP000002, etc.
  static generateOperatorId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM operators ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'OP' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Generate sequential customer ID: CU000001, CU000002, etc.
  static generateCustomerId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM customers ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'CU' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Generate sequential flight ID: FL000001, FL000002, etc.
  static generateFlightId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM flights ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'FL' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Generate sequential booking ID: BK000001, BK000002, etc.
  static generateBookingId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM bookings ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'BK' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Generate sequential notification ID: NT000001, NT000002, etc.
  static generateNotificationId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM notifications ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'NT' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Generate payment ID: PM000001, PM000002, etc.
  static generatePaymentId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM payments ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'PM' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Generate passenger ID: PS000001, PS000002, etc.
  static generatePassengerId() {
    const db = this.getDatabase();
    try {
      const result = db.prepare('SELECT id FROM passengers ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1').get();
      const nextNumber = result ? parseInt(result.id.substring(2)) + 1 : 1;
      return 'PS' + String(nextNumber).padStart(6, '0');
    } finally {
      db.close();
    }
  }

  // Legacy method for backward compatibility
  static generateRandomId(prefix = '') {
    console.warn('generateRandomId is deprecated. Use specific sequential ID generators instead.');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? prefix + result : result;
  }
}

module.exports = SimpleIDGenerator;
