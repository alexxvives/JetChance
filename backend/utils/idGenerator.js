// Simple ID generator for ChanceFly
// Generates short, readable IDs instead of long UUIDs

class SimpleIDGenerator {
  // Generate simple user ID: USR001, USR002, etc.
  static generateUserId() {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    return `USR${timestamp}`;
  }

  // Generate simple operator ID: OP001, OP002, etc.
  static generateOperatorId() {
    const timestamp = Date.now().toString().slice(-6);
    return `OP${timestamp}`;
  }

  // Generate simple flight ID: FL001, FL002, etc.
  static generateFlightId() {
    const timestamp = Date.now().toString().slice(-6);
    return `FL${timestamp}`;
  }

  // Generate simple aircraft ID: AC001, AC002, etc.
  static generateAircraftId() {
    const timestamp = Date.now().toString().slice(-6);
    return `AC${timestamp}`;
  }

  // Generate simple booking ID: BK001, BK002, etc.
  static generateBookingId() {
    const timestamp = Date.now().toString().slice(-6);
    return `BK${timestamp}`;
  }

  // Generate random 6-character alphanumeric ID
  static generateRandomId(prefix = '') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? `${prefix}${result}` : result;
  }

  // Generate sequential-style ID with prefix
  static generateSequentialId(prefix, existingCount = 0) {
    const paddedNumber = String(existingCount + 1).padStart(3, '0');
    return `${prefix}${paddedNumber}`;
  }
}

module.exports = SimpleIDGenerator;