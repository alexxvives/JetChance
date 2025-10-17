# JetChance Deployment Guide - Production Ready

## ✅ Pre-Deployment Checklist

### 1. Run Validation Scripts

```powershell
# Validate all endpoints exist
npm run validate:endpoints

# Run full pre-deployment checks
npm run validate

# Safe deploy (runs validations + deploy)
npm run safe-deploy
```

### 2. Database Migration

The schema has been updated with new tables. Apply migrations:

```powershell
# Navigate to workers directory
cd workers/jetchance-api

# Apply schema updates to D1
npx wrangler d1 execute jetchance_db --remote --file=schema.sql
```

## 🚀 Deployment Process

### Option A: Safe Deploy (Recommended)

```powershell
npm run safe-deploy
```

This will:
1. ✅ Validate all frontend API calls have Worker endpoints
2. ✅ Check TypeScript compilation
3. ✅ Validate wrangler configuration
4. ✅ Deploy to Cloudflare Workers
5. ✅ Verify deployment

### Option B: Manual Deploy

```powershell
# 1. Run validations first
npm run validate

# 2. If all checks pass, deploy
npx wrangler deploy
```

## 📋 New Endpoints Added

### Critical Endpoints Implemented

1. **Quotes API** (`/api/quotes`)
   - `POST /api/quotes` - Create quote (public)
   - `GET /api/quotes` - Get all quotes (admin)
   - `GET /api/quotes/unseen-count` - Count unseen
   - `GET /api/quotes/not-contacted-count` - Count not contacted
   - `POST /api/quotes/mark-seen` - Mark as seen

2. **Upload API** (`/api/upload`)
   - `POST /api/upload/aircraft-image` - Upload to R2 (operator)

3. **Email API** (`/api/send-email`)
   - `POST /api/send-email` - Send notification (public)

4. **Profile API** (`/api/profile`)
   - `GET /api/profile` - Get user profile (authenticated)
   - `PUT /api/profile` - Update profile (authenticated)
   - `POST /api/profile` - Update profile (authenticated)
   - `POST /api/profile/password` - Change password

5. **Admin API** (`/api/admin`)
   - `GET /api/admin/system-stats` - System statistics
   - `GET /api/admin/r2-stats` - R2 storage stats

6. **Bookings Extensions**
   - `GET /api/bookings/crm` - Admin CRM data
   - `GET /api/bookings/:id/flight` - Booking with flight details
   - `GET /api/bookings/operator` - Operator CRM data

## 🔧 Database Schema Updates

New tables added:

```sql
-- Quotes table updated with new fields
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  return_date TEXT,
  passengers INTEGER NOT NULL,
  message TEXT,
  trip_type TEXT DEFAULT 'one-way',
  status TEXT DEFAULT 'pending',
  contacted INTEGER DEFAULT 0,
  seen INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email logs for tracking
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);
```

## 📊 Validation Script Details

### `validate-endpoints.mjs`
Scans frontend code for all `fetch()` calls and verifies corresponding Worker endpoints exist.

**What it checks:**
- Extracts all `/api/*` endpoints from frontend
- Compares with implemented Worker routes
- Reports missing endpoints by category
- **Exits with error if any endpoints are missing**

### `pre-deploy.mjs`
Comprehensive pre-deployment validation.

**What it checks:**
1. ✅ Endpoint validation (via validate-endpoints.mjs)
2. ✅ TypeScript compilation (`tsc --noEmit`)
3. ✅ Wrangler configuration (name, routes, D1, R2)
4. ✅ Environment variables (JWT_SECRET, CORS_ORIGINS)
5. ✅ No localhost references (if grep available)

### `safe-deploy.mjs`
Runs pre-deploy validation, then deploys if all checks pass.

## 🎯 Post-Deployment Verification

After deployment, verify these work:

1. **Landing Page Quote Form**
   ```
   https://www.jetchance.com
   Submit quote form → Should create quote in database
   ```

2. **Admin Dashboard**
   ```
   Login as admin@jetchance.com
   - Check system stats widget
   - Check quotes list
   - Check CRM data
   ```

3. **Operator Dashboard**
   ```
   Login as operator
   - Create new flight
   - Upload aircraft image (R2)
   - View bookings
   ```

4. **Customer Dashboard**
   ```
   Login as customer
   - View profile
   - Update profile
   - View bookings
   ```

## ⚠️ Known Limitations

### Email Service
Currently, emails are logged but NOT actually sent. To enable:

1. Choose email service (Resend, SendGrid, Mailgun, etc.)
2. Add API key to wrangler.jsonc:
   ```json
   "vars": {
     "RESEND_API_KEY": "re_xxxx"
   }
   ```
3. Uncomment email sending code in `src/handlers/email.ts`

### R2 Public URLs
R2 bucket must have public access enabled for aircraft images to be visible.

Configure in Cloudflare dashboard:
- Settings → R2 → AIRCRAFT_IMAGES → Custom Domains
- Or use public URL: `https://pub-ac9d99c78bee497299d7d2e44ec95be5.r2.dev`

## 🔍 Troubleshooting

### "Missing endpoints" error
Run `npm run validate:endpoints` to see which endpoints are missing.

### TypeScript errors
Run `npx tsc --noEmit` to see compilation errors.

### Database errors after deployment
Re-run schema migration:
```powershell
npx wrangler d1 execute jetchance_db --remote --file=schema.sql
```

### CORS errors in production
Verify `CORS_ORIGINS` in wrangler.jsonc includes:
```json
"CORS_ORIGINS": "https://www.jetchance.com,https://jetchance.pages.dev"
```

## 📝 Deployment Logs

Record each deployment:

```
Date: [YYYY-MM-DD]
Version: [git commit hash]
Changes: [Brief description]
Database migrations: [Yes/No]
Status: [Success/Failed]
Notes: [Any issues encountered]
```

## 🎉 Ready to Deploy!

If all validation scripts pass, you're ready to deploy:

```powershell
npm run safe-deploy
```

The Worker will be live at: `https://www.jetchance.com/api/*`
