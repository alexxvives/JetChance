# JetChance - Deployment Checklist

## 🚨 NEVER Deploy Without These Checks

### ✅ Pre-Deployment Validation (MANDATORY)

```powershell
cd workers/jetchance-api
npm run validate
```

This checks:
1. All frontend API calls have Worker endpoints
2. TypeScript compiles without errors
3. Configuration is valid
4. No localhost references remain

### ✅ Database Migration (If Schema Changed)

```powershell
npx wrangler d1 execute jetchance_db --remote --file=schema.sql
```

### ✅ Safe Deployment

```powershell
npm run safe-deploy
```

This runs ALL validations then deploys if everything passes.

## ❌ Common Mistakes

### ❌ DON'T: Deploy without validation
```powershell
npx wrangler deploy  # ❌ WRONG - bypasses checks
```

### ✅ DO: Use safe-deploy script
```powershell
npm run safe-deploy  # ✅ CORRECT - validates first
```

### ❌ DON'T: Add frontend API calls without Worker endpoint
Adding `fetch('/api/new-feature')` in frontend without creating the handler will break production!

### ✅ DO: Create endpoint first, then use it
1. Create handler in `src/handlers/`
2. Register in `src/index.ts`
3. Run `npm run validate:endpoints`
4. Then add frontend code

## 📋 Deployment Process

1. **Make changes**
2. **Run validation**: `npm run validate`
3. **Fix any errors**
4. **Deploy**: `npm run safe-deploy`
5. **Verify in production**

## 🛡️ Validation Scripts

- `npm run validate:endpoints` - Check all API endpoints exist
- `npm run validate` - Run all pre-deployment checks
- `npm run safe-deploy` - Validate + Deploy

## 📚 Full Documentation

See [DEPLOYMENT.md](./workers/jetchance-api/DEPLOYMENT.md) for complete deployment guide.

## 🚀 Quick Deploy (After Validation Passes)

```powershell
cd workers/jetchance-api
npm run safe-deploy
```

Worker URL: https://www.jetchance.com/api/*
