/**
 * ID Generator utilities for Cloudflare Workers
 */

/**
 * Generate a sequential flight ID for an operator
 * Format: FL00001, FL00002, etc.
 */
export async function generateFlightId(db: D1Database, operatorId: string): Promise<string> {
  // Get the current count of flights for this operator
  const result = await db.prepare(
    'SELECT COUNT(*) as count FROM flights WHERE operator_id = ?'
  ).bind(operatorId).first();
  
  const count = (result?.count as number) || 0;
  const nextNumber = count + 1;
  
  // Format as FL00001, FL00002, etc. (5 digits, zero-padded)
  const flightId = `FL${String(nextNumber).padStart(5, '0')}`;
  
  return flightId;
}

/**
 * Generate a sequential booking ID
 * Format: BK00001, BK00002, etc.
 */
export async function generateBookingId(db: D1Database): Promise<string> {
  const result = await db.prepare(
    'SELECT COUNT(*) as count FROM bookings'
  ).first();
  
  const count = (result?.count as number) || 0;
  const nextNumber = count + 1;
  
  const bookingId = `BK${String(nextNumber).padStart(5, '0')}`;
  
  return bookingId;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
