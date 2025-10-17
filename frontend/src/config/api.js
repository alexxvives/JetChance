/**
 * API Configuration
 * 
 * Worker is configured to respond on www.jetchance.com/api/*
 * Use relative URLs in production for same-domain requests
 */

// For production: use relative URL (same domain)
// For development: use localhost
export const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:4000/api' 
  : '/api';

export default API_BASE_URL;
