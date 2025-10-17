#!/usr/bin/env node
/**
 * Pre-Deployment Validation Script
 * Runs all validation checks before allowing deployment
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🚀 JetChance Pre-Deployment Validation\n');
console.log('=' .repeat(50) + '\n');

let hasErrors = false;

// 1. Validate endpoints
console.log('1️⃣  Validating API endpoints...');
try {
  execSync('node scripts/validate-endpoints.mjs', { stdio: 'inherit' });
  console.log('   ✅ All endpoints validated\n');
} catch (error) {
  console.log('   ❌ Endpoint validation failed\n');
  hasErrors = true;
}

// 2. TypeScript compilation check
console.log('2️⃣  Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compiled successfully\n');
} catch (error) {
  console.log('   ❌ TypeScript compilation errors detected');
  console.log(error.stdout?.toString() || '');
  hasErrors = true;
}

// 3. Validate wrangler.jsonc configuration
console.log('3️⃣  Validating wrangler configuration...');
try {
  const wranglerConfig = readFileSync('./wrangler.jsonc', 'utf-8');
  
  // Remove comments and parse
  const jsonContent = wranglerConfig.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const config = JSON.parse(jsonContent);
  
  const checks = [
    { key: 'name', value: config.name, expected: 'jetchance-api' },
    { key: 'routes', exists: config.routes?.length > 0 },
    { key: 'database', exists: config.d1_databases?.length > 0 },
    { key: 'r2_buckets', exists: config.r2_buckets?.length > 0 },
  ];
  
  const failed = checks.filter(c => 
    (c.value && c.value !== c.expected) || 
    (c.exists !== undefined && !c.exists)
  );
  
  if (failed.length > 0) {
    console.log('   ❌ Configuration issues:');
    failed.forEach(f => console.log(`      - ${f.key}`));
    hasErrors = true;
  } else {
    console.log('   ✅ Wrangler configuration valid\n');
  }
} catch (error) {
  console.log('   ❌ Failed to parse wrangler.jsonc:', error.message);
  hasErrors = true;
}

// 4. Check environment variables
console.log('4️⃣  Checking required environment variables...');
try {
  const wranglerConfig = readFileSync('./wrangler.jsonc', 'utf-8');
  const jsonContent = wranglerConfig.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const config = JSON.parse(jsonContent);
  
  const requiredVars = ['JWT_SECRET', 'CORS_ORIGINS'];
  const envVars = config.vars || {};
  
  const missing = requiredVars.filter(v => !envVars[v]);
  
  if (missing.length > 0) {
    console.log('   ⚠️  Missing environment variables:');
    missing.forEach(v => console.log(`      - ${v}`));
  } else {
    console.log('   ✅ All required environment variables set\n');
  }
} catch (error) {
  console.log('   ⚠️  Could not validate environment variables\n');
}

// 5. Check for localhost references
console.log('5️⃣  Checking for localhost references...');
try {
  const result = execSync('grep -r "localhost:4000" src/ || true', { encoding: 'utf-8' });
  if (result.trim()) {
    console.log('   ❌ Found localhost references:');
    console.log(result);
    hasErrors = true;
  } else {
    console.log('   ✅ No localhost references found\n');
  }
} catch (error) {
  // grep not available on Windows, skip
  console.log('   ⚠️  Skipped (grep not available)\n');
}

// Final summary
console.log('=' .repeat(50));
if (hasErrors) {
  console.log('\n❌ DEPLOYMENT BLOCKED - Fix errors above before deploying\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL CHECKS PASSED - Ready to deploy!\n');
  console.log('Run: npx wrangler deploy\n');
  process.exit(0);
}
