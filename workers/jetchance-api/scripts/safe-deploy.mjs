#!/usr/bin/env node
/**
 * Safe Deployment Script
 * Runs all validations and deploys only if everything passes
 */

import { execSync } from 'child_process';

console.log('🛡️  JetChance Safe Deployment\n');

// Run pre-deployment checks
console.log('Running pre-deployment validation...\n');

try {
  execSync('node scripts/pre-deploy.mjs', { stdio: 'inherit' });
} catch (error) {
  console.log('\n❌ Pre-deployment checks failed. Deployment aborted.\n');
  process.exit(1);
}

// If we got here, all checks passed
console.log('\n🚀 Deploying to Cloudflare Workers...\n');

try {
  execSync('npx wrangler deploy', { stdio: 'inherit' });
  console.log('\n✅ Deployment successful!\n');
  console.log('🌐 Worker is live at: https://www.jetchance.com/api/*\n');
} catch (error) {
  console.log('\n❌ Deployment failed. Check error above.\n');
  process.exit(1);
}
