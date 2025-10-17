/**
 * API Configuration
 * 
 * Always uses Cloudflare Worker in production domain:
 * - Production build: /api (relative URL on www.jetchance.com)
 * - Development: /api (connects to www.jetchance.com/api via CORS)
 * 
 * Benefits:
 * - Simple: No local backend needed
 * - Consistent: Same API in dev and prod
 * - Fast: Cloudflare's global CDN
 * - Free tier: 100k requests/day (more than enough for development)
 */

export const API_BASE_URL = '/api';

export default API_BASE_URL;
