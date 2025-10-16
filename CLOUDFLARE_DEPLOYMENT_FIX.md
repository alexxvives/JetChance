# Cloudflare Pages Deployment Configuration Guide

## Problem Fixed 🎉
The deployed version was trying to connect to `localhost:4000` instead of the production Cloudflare Workers API.

## Solution

### 1. Environment Variables in Cloudflare Pages

You need to configure environment variables in your Cloudflare Pages dashboard:

1. Go to **Cloudflare Dashboard** → **Pages** → **Your Project (jetchance-frontend)**
2. Navigate to **Settings** → **Environment Variables**
3. Add the following **Production** environment variable:

```
Variable name: VITE_API_URL
Value: https://jetchance-api.workers.dev/api
```

4. Click **Save**
5. **Redeploy** your site for changes to take effect

### 2. Local Development vs Production

**Local Development** (uses `frontend/.env`):
```bash
VITE_API_URL=http://localhost:4000/api
```

**Production** (configured in Cloudflare Pages):
```bash
VITE_API_URL=https://jetchance-api.workers.dev/api
```

### 3. How Vite Handles Environment Variables

- **Development**: Reads from `.env` file
- **Production Build**: Uses environment variables from Cloudflare Pages dashboard
- The prefix `VITE_` makes variables accessible in your frontend code via `import.meta.env.VITE_API_URL`

### 4. Verify Configuration

After setting the environment variable in Cloudflare Pages:

1. Trigger a new deployment (or use **Retry deployment**)
2. Test registration at your deployed site
3. Check browser console - should see API calls to `https://jetchance-api.workers.dev/api/auth/register`

### 5. Current API Endpoints

**Development (Local)**:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000/api

**Production (Cloudflare)**:
- Frontend: https://jetchance.alexxvives.workers.dev (or your custom domain)
- Backend: https://jetchance-api.workers.dev/api

## CORS Configuration

Make sure your Cloudflare Worker (`workers/jetchance-api/wrangler.jsonc`) has the correct CORS origin:

```json
"vars": {
  "CORS_ORIGINS": "https://jetchance.alexxvives.workers.dev"
}
```

If you're using a custom domain, update this to match your frontend URL.

## Steps to Deploy Fix

1. ✅ Created `.env.production` file (reference only - Cloudflare Pages doesn't read this)
2. ⏳ **YOU NEED TO DO**: Configure `VITE_API_URL` in Cloudflare Pages dashboard
3. ⏳ **YOU NEED TO DO**: Redeploy the frontend on Cloudflare Pages
4. ✅ Test user registration

## Testing Checklist

After deployment:
- [ ] User registration works
- [ ] User login works
- [ ] API calls go to `jetchance-api.workers.dev`
- [ ] No CORS errors in console
- [ ] Images load correctly from R2

## Troubleshooting

If you still see "Failed to fetch" errors:

1. **Check Network Tab**: See what URL is being called
2. **Check CORS**: Ensure Worker allows your frontend domain
3. **Check Worker Logs**: Go to Cloudflare Dashboard → Workers → jetchance-api → Logs
4. **Verify Environment Variable**: In Pages settings, ensure VITE_API_URL is set correctly
