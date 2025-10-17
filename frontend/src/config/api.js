/**
 * API Configuration
 * 
 * Worker is configured to respond on www.jetchance.com/api/*
 * Always use production Worker API for consistency
 */

// Production: relative URL (same domain)
// Development: use production Worker directly
export const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'https://www.jetchance.com/api' 
  : '/api';

export default API_BASE_URL;
