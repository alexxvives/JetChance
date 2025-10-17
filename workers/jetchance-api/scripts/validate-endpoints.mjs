#!/usr/bin/env node
/**
 * Endpoint Validation Script
 * Validates that all frontend API calls have corresponding Worker endpoints
 * Run before deployment to catch missing endpoints
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const FRONTEND_DIR = '../../frontend/src';
const HANDLERS_DIR = './src/handlers';

// Extract all fetch() calls from frontend code
function extractFetchCalls(dir, basePath = '') {
  const endpoints = new Set();
  const files = readdirSync(dir);

  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      extractFetchCalls(fullPath, join(basePath, file));
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(extname(file))) {
      const content = readFileSync(fullPath, 'utf-8');
      
      // Match fetch calls with /api/ endpoints
      const fetchRegex = /fetch\s*\(\s*`?\$\{[^}]+\}\/([^`'"]+)`?|fetch\s*\(\s*['"`]\/api\/([^'"`,\s]+)/g;
      let match;
      
      while ((match = fetchRegex.exec(content)) !== null) {
        const endpoint = match[1] || match[2];
        if (endpoint && endpoint.startsWith('api/')) {
          // Remove query parameters and normalize
          const normalized = endpoint.replace(/\?.*$/, '').replace(/\/:[^/]+/g, '/:id');
          endpoints.add('/' + normalized);
        } else if (endpoint) {
          const normalized = endpoint.replace(/\?.*$/, '').replace(/\/:[^/]+/g, '/:id');
          endpoints.add('/api/' + normalized);
        }
      }
    }
  }

  return endpoints;
}

// Extract implemented endpoints from Worker handlers
function extractWorkerEndpoints() {
  const endpoints = new Set();
  
  // From index.ts routing
  const indexContent = readFileSync('./src/index.ts', 'utf-8');
  
  // Known base routes from index.ts
  const baseRoutes = [
    '/api/auth/',
    '/api/flights/',
    '/api/bookings',
    '/api/users/',
    '/api/operators/',
    '/api/payments/',
    '/api/airports',
    '/api/notifications'
  ];
  
  baseRoutes.forEach(route => {
    endpoints.add(route.replace(/\/$/, ''));
  });
  
  // Parse each handler file for sub-routes
  const handlers = readdirSync(HANDLERS_DIR);
  
  for (const handler of handlers) {
    if (!handler.endsWith('.ts')) continue;
    
    const handlerName = handler.replace('.ts', '');
    const content = readFileSync(join(HANDLERS_DIR, handler), 'utf-8');
    
    // Extract route patterns
    const routePatterns = [
      /if\s*\(.*path\s*===\s*['"]([^'"]+)['"]/g,
      /if\s*\(.*path\.startsWith\(['"]([^'"]+)['"]\)/g,
      /case\s+['"]([^'"]+)['"]/g,
    ];
    
    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const subPath = match[1];
        endpoints.add(`/api/${handlerName}${subPath}`);
      }
    }
  }
  
  return endpoints;
}

// Main validation
console.log('🔍 Validating API endpoints...\n');

const frontendEndpoints = extractFetchCalls(FRONTEND_DIR);
const workerEndpoints = extractWorkerEndpoints();

console.log(`📱 Frontend calls: ${frontendEndpoints.size} unique endpoints`);
console.log(`⚙️  Worker implements: ${workerEndpoints.size} endpoints\n`);

// Find missing endpoints
const missing = [];
const implemented = [];

for (const endpoint of frontendEndpoints) {
  // Normalize for comparison
  const normalized = endpoint
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/\/\d+/g, '/:id') // Replace numeric IDs
    .replace(/\/[a-f0-9-]{36}/g, '/:id'); // Replace UUIDs
  
  // Check if endpoint exists (exact or base match)
  const exists = Array.from(workerEndpoints).some(workerEp => {
    return normalized === workerEp || 
           normalized.startsWith(workerEp + '/') ||
           workerEp.startsWith(normalized);
  });
  
  if (exists) {
    implemented.push(endpoint);
  } else {
    missing.push(endpoint);
  }
}

// Report results
if (missing.length === 0) {
  console.log('✅ All frontend endpoints are implemented in Worker!\n');
  process.exit(0);
} else {
  console.log('❌ MISSING ENDPOINTS DETECTED:\n');
  
  // Group by base path
  const grouped = {};
  missing.forEach(ep => {
    const base = ep.split('/').slice(0, 3).join('/');
    if (!grouped[base]) grouped[base] = [];
    grouped[base].push(ep);
  });
  
  Object.entries(grouped).forEach(([base, endpoints]) => {
    console.log(`\n📁 ${base}`);
    endpoints.forEach(ep => console.log(`   - ${ep}`));
  });
  
  console.log(`\n\n⚠️  Total missing: ${missing.length} endpoints`);
  console.log('❗ Fix these before deploying to production!\n');
  
  process.exit(1);
}
