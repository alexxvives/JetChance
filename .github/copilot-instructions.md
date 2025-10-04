# JetChance AI Coding Agent Instructions

## Project Overview
JetChance is a React + Node.js platform connecting customers with private jet charter operators, featuring role-based authentication and bilingual support (English/Spanish).

## Core Architecture

### Frontend (`/frontend`)
- **React + Vite** with TailwindCSS
- **Role-based routing**: `/dashboard` dynamically shows different components based on `user.role`
- **Translation system**: Context-based with `useTranslation()` hook, all UI text should use `t('key.path')`
- **Authentication flow**: Login → Dashboard (role-specific redirect)

### Backend (`/backend` + `/workers/jetchance-api`)
- **Dual API support**: Legacy Node.js backend + modern Cloudflare Workers API
- **Database**: SQLite (backend) and Cloudflare D1 (workers)
- **Role system**: `customer`, `operator`, `admin`, `super-admin` with separate profile tables

### Key Components
- **Dashboard.jsx**: Main router that directs users to role-specific dashboards
- **CustomFlightRequestModal.jsx**: Lead capture form for sales team follow-up
- **FlightCardsAlt.jsx**: Customer flight catalog with search and booking features
- **AirportAutocomplete.jsx**: Location picker with custom airport creation (lat/lng support)

## Critical Patterns

### 1. Role-Based Access
```jsx
// Dashboard.jsx pattern - ALWAYS follow this structure
if (currentUser?.role === 'admin' || currentUser?.role === 'super-admin') {
  return <AdminDashboard user={currentUser} />;
}
if (currentUser?.role === 'operator') {
  return <SafeOperatorDashboard user={currentUser} />;
}
// Default to customer dashboard
```

### 2. API Integration
```jsx
// Check API availability before making calls
if (shouldUseRealAPI()) {
  const response = await flightsAPI.getFlights(filters);
  // Handle real API
} else {
  // Handle mock data
}
```

### 3. Translation Keys
- **Always add new UI text to both** `/frontend/src/locales/en.json` and `/frontend/src/locales/es.json`
- **Use nested structure**: `"auth.login.title"` not flat keys
- **Reference with**: `{t('auth.login.title')}`

### 4. Modal Patterns
```jsx
// Standard modal with translations and state management
const [showModal, setShowModal] = useState(false);
<CustomModal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)} 
/>
```

## Development Workflow

### Adding New Features
1. **Identify user role** - which dashboard needs the feature?
2. **Add translations first** - both en.json and es.json
3. **Create component** - follow existing patterns with proper error handling
4. **Integrate with API** - check shouldUseRealAPI() for dual backend support
5. **Test role-based access** - ensure proper authentication flow

### Flight Management
- **Empty leg flights**: Current system with pricing and availability
- **Regular jet requests**: Lead capture only (no pricing) → sales team follow-up
- **Dual backend**: Always check `shouldUseRealAPI()` before API calls

### Database Schema
- **Users table**: Core auth (id, email, password_hash, role)
- **Role-specific tables**: customers, operators with foreign key to users.id
- **Flights table**: Separate from aircraft (simplified model)

## Common Issues
- **User object validation**: Always check `user && user.id` before API calls
- **Translation missing**: Ensure all text uses translation keys
- **API switching**: Use `shouldUseRealAPI()` consistently across components
- **Route protection**: Wrap admin/operator routes with `<ProtectedRoute>`

## File Locations
- **Main router**: `/frontend/src/App.jsx`
- **Dashboard logic**: `/frontend/src/pages/Dashboard.jsx`
- **Flight catalog**: `/frontend/src/components/FlightCardsAlt.jsx`
- **API utilities**: `/frontend/src/api/flightsAPI.js`
- **Translation files**: `/frontend/src/locales/{en,es}.json`