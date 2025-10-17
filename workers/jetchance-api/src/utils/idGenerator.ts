/**
 * ID Generator utilities for Cloudflare Workers
 * All IDs are UUIDs for simplicity and security
 */

/**
 * Generate a UUID v4
 * Used for all entities: users, operators, customers, flights, bookings, etc.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
