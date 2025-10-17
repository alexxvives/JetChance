/**
 * API Configuration
 * 
 * Since the Worker is now configured to respond on the same domain at /api/*,
 * we use relative URLs in production and localhost for development.
 */

// For production: use relative URL (same domain)
// For development: use localhost
export const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:4000/api' 
  : '/api';

export default API_BASE_URL;
