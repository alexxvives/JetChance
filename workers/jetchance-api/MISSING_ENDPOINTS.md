# Missing Endpoints Analysis

## Critical Missing Endpoints

These endpoints are called by the frontend but don't exist in the Worker:

### 1. Quotes API (CRITICAL - Used by Admin & Landing Pages)
- `POST /api/quotes` - Create new quote
- `GET /api/quotes` - Get all quotes (admin)
- `GET /api/quotes/unseen-count` - Count unseen quotes
- `GET /api/quotes/not-contacted-count` - Count not contacted quotes
- `POST /api/quotes/mark-seen` - Mark quotes as seen

**Impact**: Quote/lead capture forms don't work (critical business function)

### 2. File Upload API (CRITICAL - Used by Operators)
- `POST /api/upload/aircraft-image` - Upload aircraft images to R2

**Impact**: Operators can't create flights with images

### 3. Email API (CRITICAL - Used for Notifications)
- `POST /api/send-email` - Send email notifications

**Impact**: No email notifications for quotes

### 4. Bookings API Extensions (HIGH)
- `GET /api/bookings/crm` - Get CRM data for admin
- `GET /api/bookings/:id/flight` - Get booking with flight details

**Impact**: Admin CRM dashboard doesn't work, operator booking details fail

### 5. Profile API (MEDIUM)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile` - Update profile (duplicate?)

**Impact**: Users can't view/edit their profiles

### 6. Admin Stats API (MEDIUM)
- `GET /api/admin/system-stats` - System statistics
- `GET /api/admin/r2-stats` - R2 storage statistics

**Impact**: Admin dashboard stats widgets don't work

## Action Plan

1. **Create quotes handler** - Handle quote/lead capture
2. **Create upload handler** - R2 image uploads
3. **Create email handler** - Email notifications
4. **Extend bookings handler** - Add /crm and /:id/flight endpoints
5. **Create profile handler** - User profile management
6. **Create admin stats handler** - Dashboard statistics
