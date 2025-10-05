# JetChance Notification System Documentation

## Overview
The JetChance platform uses a real-time notification system to keep operators and admins informed about important account and flight-related events.

## Database Schema

```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

## Notification Triggers

### 1. Operator Registration (NEW)
**Event:** When a new operator account is created
**Trigger:** `POST /api/auth/register` with role='operator'
**Recipients:** All admins and super-admins
**Title:** `"New Operator Registration"`
**Message:** `"New operator account registered: [COMPANY_NAME] ([EMAIL])"`
**Icon:** 👤 Blue (new user)

---

### 2. Flight Submission for Review
**Event:** When an operator creates a new flight
**Trigger:** `POST /api/flights`
**Recipient:** The operator who created the flight
**Title:** `"Flight Submitted for Review"`
**Message:** `"Your flight [ORIGIN] → [DESTINATION] has been successfully submitted for admin review."`
**Icon:** 📤 Blue (submission)

---

### 3. Flight Approval
**Event:** When an admin approves a flight
**Trigger:** `PATCH /api/flights/:id/approve` with status='approved'
**Recipient:** The operator who owns the flight
**Title:** `"Flight Approved! ✅"`
**Message:** `"Great news! Your flight [ORIGIN] → [DESTINATION] has been approved and is now live for customers to book."`
**Icon:** ✅ Green (approved)

---

### 4. Flight Decline
**Event:** When an admin declines a flight
**Trigger:** `PATCH /api/flights/:id/approve` with status='declined'
**Recipient:** The operator who owns the flight
**Title:** `"Flight Declined ❌"`
**Message:** `"Your flight [ORIGIN] → [DESTINATION] was declined. Reason: [REASON]"`
**Icon:** ❌ Red (declined)

---

### 5. Flight Deletion by Admin
**Event:** When a super-admin deletes another operator's flight
**Trigger:** `DELETE /api/flights/:id` (by admin/super-admin)
**Recipient:** The operator who owns the deleted flight
**Title:** `"Flight Deleted by Administration"`
**Message:** `"Your flight [ORIGIN] → [DESTINATION] ([FLIGHT_ID]) has been deleted by administration."`
**Icon:** 🗑️ Red (deletion)

---

### 6. Account Deletion (NEW)
**Event:** When a user deletes their own account
**Trigger:** `DELETE /api/profile`
**Recipients:** All admins and super-admins
**Title:** `"Operator Account Deleted"` or `"Customer Account Deleted"`
**Message:** `"[ROLE] account deleted: [NAME] ([EMAIL])"`
**Icon:** 🗑️ Red (deletion)

---

### 7. Flight Booking Received (NEW)
**Event:** When a customer books a flight
**Trigger:** `POST /api/bookings`
**Recipients:** 
- The operator who owns the flight
- All admins and super-admins
**Titles:** 
- Operator: `"New Booking Received! 🎉"`
- Admins: `"New Booking Created 🎉"`
**Messages:** 
- Operator: `"You have a new booking for your flight [ORIGIN] → [DESTINATION]. Booking ID: [BOOKING_ID]. Passengers: [COUNT]"`
- Admins: `"New booking received for flight [ORIGIN] → [DESTINATION]. Booking ID: [BOOKING_ID]. Passengers: [COUNT]"`
**Icon:** 🎉 Green (new booking)

---

## Frontend Implementation

### Real-time Updates
- Notifications are fetched every 30 seconds in the SafeOperatorDashboard
- Unread count is displayed in the notification bell icon
- Notifications dropdown shows the latest 50 notifications

### API Endpoints Used
- `GET /api/notifications` - Fetch user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Notification Display
Location: `SafeOperatorDashboard.jsx`
- Bell icon with unread count badge
- Dropdown with notification list
- Color-coded based on type
- Timestamp in relative format (e.g., "2 hours ago")

## Profile Account Deletion

### Feature Location
Component: `Profile.jsx`

### UI Flow
1. User navigates to Profile page
2. Scrolls to "Danger Zone" section at bottom
3. Clicks "Delete Account" button
4. Confirmation modal appears requiring user to type "DELETE"
5. Upon confirmation, account and all related data are deleted:
   - User record
   - Role-specific record (operator/customer)
   - All notifications
   - All flights (for operators)
6. User is logged out and redirected to home page

### Security
- Requires explicit confirmation (typing "DELETE")
- Requires authentication (Bearer token)
- Cascading deletion of related records
- Admin notification for audit trail

## Backend Implementation

### Notification Helper Function
Location: `backend/routes/notifications.js`

```javascript
const createNotification = async (userId, title, message) => {
  const notificationId = SimpleIDGenerator.generateNotificationId();
  const sql = `
    INSERT INTO notifications (id, user_id, title, message, created_at)
    VALUES (?, ?, ?, ?, ?)
  `;
  const stmt = db.prepare(sql);
  stmt.run(notificationId, userId, title, message, new Date().toISOString());
  return notificationId;
};
```

**Usage:**
```javascript
await createNotification(userId, 'Title', 'Message');
```

**Note:** The `db` instance is imported at the module level, so there's no need to pass it as a parameter.

### Error Handling
All notification creation is wrapped in try-catch blocks to ensure that notification failures don't break core functionality (flight creation, approval, etc.).

## Future Enhancements
- [ ] Add `type` column to database for better categorization
- [ ] Email notifications for critical events
- [ ] SMS notifications (optional)
- [ ] Notification preferences per user
- [ ] Real-time WebSocket updates instead of polling
- [ ] Push notifications for mobile app
