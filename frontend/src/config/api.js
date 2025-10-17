/**
 * API Configuration
 * 
 * Production: Uses relative URLs (/api) - Worker on same domain
 * Development: Set VITE_USE_LOCAL_API=true in .env.local to use local backend
 */

// Check if we should use local API (only in development)
const useLocalAPI = import.meta.env.VITE_USE_LOCAL_API === 'true';

export const API_BASE_URL = useLocalAPI
  ? 'http://localhost:4000/api'  // Local Node.js backend
  : '/api';  // Production Worker (www.jetchance.com/api/*)

export default API_BASE_URL;
