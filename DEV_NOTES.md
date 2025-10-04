# JetChance - Development Notes
========================================

## � **Current Architecture Overview**

### **Frontend:**
- **React 18** with Vite build system
- **Tailwind CSS** for styling  
- **React Router** for navigation
- **Heroicons** for icons
- **Context API** for state management (Auth, Translation)

### **Backend Options:**
- **Primary**: Local Express.js server on port 4000 with SQLite database
- **Secondary**: Cloudflare Workers API (for production scaling)
- **Database**: SQLite (local development) or D1 (Cloudflare production)

### **Deployment:**
- **Frontend**: Cloudflare Pages (`jetchance-frontend.pages.dev`)
- **Backend**: Can deploy to Cloudflare Workers if needed
- **Auto-deployment**: Git push to main triggers deployment

---

## 🛠️ **Local Development Setup**

### **Start Development Servers:**

#### Option 1: Local Express Backend (Recommended)
```bash
# Terminal 1 - Backend
cd backend
npm run dev        # Starts on http://localhost:4000

# Terminal 2 - Frontend  
cd frontend
npm run dev        # Starts on http://localhost:8000
```

#### Option 2: Cloudflare Workers Backend
```bash
# Terminal 1 - Backend
cd workers/jetchance-api
wrangler dev --local --port 8787

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### **Environment Configuration:**
- **Frontend**: Runs on `localhost:8000` by default
- **Backend**: Runs on `localhost:4000` by default
- Frontend automatically detects backend on `localhost:4000`
- Falls back to mock data if backend unavailable
- Production uses Cloudflare Workers API

### **Port Assumptions:**
- **Port 8000**: Assume JetChance frontend is running (no need to restart)
- **Port 4000**: Assume JetChance backend is running (no need to restart)
- If ports are occupied, the application is likely already running

### **Database:**
- **Local**: SQLite database (`backend/flights.db`)
- **Production**: Cloudflare D1 database
- Sample data included for testing

---

## 🔐 **Authentication & Test Accounts**

### **Test Credentials:**
```
Operator: operator@gmail.com / password
Customer: customer@gmail.com / password  
Admin: admin@jetchance.com / Admin123!
```

### **Authentication Flow:**
- JWT-based authentication
- Role-based access control (customer, operator, admin)
- Token stored in localStorage with auto-refresh

---

## 📁 **Updated Project Structure**

### **Frontend (`/frontend`):**
```
src/
├── components/           # Reusable components
│   ├── SafeOperatorDashboard.jsx   # Main operator dashboard (ACTIVE)
│   ├── AdminDashboard.jsx          # Admin interface
│   ├── FlightCards.jsx             # Multi-flight cards display
│   ├── LocationAutocomplete.jsx    # Airport/city search
│   ├── Navbar.jsx                  # Navigation component
│   └── ...
├── pages/               # Route components
│   ├── Dashboard.jsx    # User dashboard router
│   ├── CreateFlightPage.jsx        # Flight creation
│   ├── EditFlightPage.jsx          # Flight editing (NEW)
│   ├── FlightDetailsPage.jsx       # Flight details
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.jsx  # Authentication state
│   └── TranslationContext.jsx      # i18n support
├── utils/               # Utility functions
│   ├── flightDataUtils.js          # Price/data transformation (NEW)
│   └── mockFlightAPI.js            # Mock data fallback
├── api/                 # API integration
│   └── flightsAPI.js    # API client
└── data/
    └── airportsAndCities.js        # Location data
```

### **Backend (`/backend`):**
```
├── routes/              # Express routes
│   ├── flights.js       # Flight CRUD operations
│   ├── auth.js         # Authentication
│   ├── profile.js      # User profiles
│   └── ...
├── middleware/         # Express middleware
│   └── auth.js         # JWT authentication
├── config/             # Configuration
│   └── database-sqlite.js          # Database connection
└── uploads/            # File uploads
    └── aircraft/       # Aircraft images
```

---

## 🔧 **Recent Major Changes**

### **✅ Recently Fixed:**
1. **Edit Functionality**: Flight editing now works correctly
2. **Price Display**: Charter prices show consistently across dashboard
3. **City Auto-fill**: Airport selection auto-populates cities
4. **International Support**: Location search includes global airports
5. **Code Cleanup**: Removed 47 unused files and debug scripts

### **✅ Recent Improvements:**
- **Centralized Price Logic**: `flightDataUtils.js` handles all price calculations
- **Consistent Data Transformation**: Unified API response handling
- **Cleaner Codebase**: Removed test files, debug scripts, unused components
- **Better File Organization**: Clear separation of concerns

### **🔧 Current API Structure:**
```javascript
// Flight object structure (transformed)
{
  id: "FL123456",
  origin: "LAX",           // Airport code
  destination: "JFK",      // Airport code  
  departureTime: "2025-09-22T14:00",
  price: 8500,            // Charter price (primary display)
  seatsAvailable: 8,
  status: "approved",
  pricing: {
    originalPrice: 10000,  // Market rate
    emptyLegPrice: 8500,   // Charter price
    currency: "USD"
  }
}
```

---

## 🚀 **Deployment Status**

### **Live URLs:**
- **Frontend**: https://jetchance-frontend.pages.dev
- **Backend**: Local Express server (production can use Cloudflare Workers)

### **Deployment Process:**
1. **Automatic**: Push to `main` branch triggers Cloudflare Pages deployment
2. **Manual**: `wrangler pages deploy dist` (after `npm run build`)

### **Environment Variables:**
- Production automatically uses correct API endpoints
- Local development auto-detects available backend

---

## 🐛 **Common Issues & Solutions**

### **"Can't connect to backend":**
- Ensure backend server is running on port 4000
- Check for CORS issues in browser console
- Verify database file exists (`backend/flights.db`)

### **"Invalid token" errors:**
- Clear localStorage and re-login
- Check JWT secret in backend configuration

### **Price display issues:**
- All pricing now uses `flightDataUtils.js` utilities
- Charter price (emptyLegPrice) is primary display value

---

## 📋 **Development Workflow**

1. **Check if servers are running**:
   - Frontend: http://localhost:8000 (assume JetChance if occupied)
   - Backend: http://localhost:4000 (assume JetChance if occupied)
2. **Start servers only if needed** (backend + frontend)
3. **Test locally** with sample data
4. **Use operator@gmail.com** to test flight management
5. **Push to main** for automatic deployment
6. **Verify on production** URL

### **Database Changes:**
- Local: SQLite file is committed to repo with sample data
- Production: Manual migration required for schema changes

### **Adding Features:**
1. Add frontend components in `/src/components`
2. Add backend routes in `/routes`  
3. Update API client in `/api/flightsAPI.js`
4. Test locally before deploying

---

## 📚 **Key Dependencies**

### **Frontend:**
- React 18, React Router v6
- Tailwind CSS v4
- Heroicons, Lucide React
- Vite (build tool)

### **Backend:**
- Express.js, SQLite
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- express-validator, multer

---

*Last Updated: September 22, 2025*
*Status: ✅ Fully Functional - Edit features working, code cleaned up*