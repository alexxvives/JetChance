// Developer Notes - ChanceFly Local Development Setup
===============================================

## 🛠️ Local Development Workflow

### Start Local Development:
1. Backend (API): cd workers/chancefly-api && wrangler dev --local --port 8787
2. Frontend (React): cd frontend && npm run dev

### How it works:
- Frontend runs on http://localhost:5173 (Vite dev server)
- Backend runs on http://127.0.0.1:8787 (Workers local runtime)
- .env.local points frontend to local API
- .env points to production API (for deployments)

### Database Access:
- Local development uses the SAME production D1 database
- No need for separate local database setup
- Changes to data are real and persist

### Deployment:
- Any git push to main branch auto-deploys to production
- Or use: wrangler deploy (backend) / wrangler pages deploy dist (frontend)

### URLs:
- Local Frontend: http://localhost:5173
- Local Backend API: http://127.0.0.1:8787/api
- Production Frontend: https://chancefly.pages.dev
- Production Backend: https://chancefly-api.alexxvives.workers.dev/api

## 🎯 Sample Data Available:
- Users: test@example.com (password123) and operator@example.com (operator123)
- Flights: 5 sample flights from various routes
- All data is shared between local and production environments