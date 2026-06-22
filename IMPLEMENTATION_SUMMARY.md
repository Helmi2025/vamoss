# Implementation Summary: Sport-Based Registration System

## Overview
This implementation adds sport-based restrictions for team/captain functionality and introduces a separate player application system for individual sports.

---

## Backend Changes

### 1. Entity Updates

#### `Sport.java`
- Added `teamEnabled` boolean field (default: `true`)
- Team sports (Football, Basketball): `teamEnabled = true`
- Individual sports (Tennis, Padel): `teamEnabled = false`

#### `Player.java`
- Added `sportId` field for individual player sport selection
- Added `appliedAt` field for application timestamp
- Added getter/setter methods for new fields

---

### 2. DTOs

#### New Files Created:
- `PlayerApplicationRequest.java` - Request DTO for player applications
  - Fields: username, email, password, confirmPassword, sportId
  - Validation annotations included

- `PendingPlayerDto.java` - Response DTO for admin view
  - Fields: userId, fullName, email, sportName, sportId, appliedAt, accountStatus

#### Updated Files:
- `PendingCaptainDto.java` - Added `accountStatus` field
- `SportDto.java` - Added `teamEnabled` field

---

### 3. Services

#### New: `PlayerApplicationService.java`
Methods:
- `apply(PlayerApplicationRequest)` - Process player applications
- `getPendingApplications()` - Get all pending player applications
- `approve(String userId)` - Approve player application
- `reject(String userId, String reason)` - Reject player application

#### Updated: `SportService.java`
- Added `getAllSports(Boolean teamEnabled)` - Filter sports by team capability
- Modified `createSport()` to auto-set `teamEnabled` based on sport name

#### Updated: `EmailService.java`
New email methods:
- `sendPlayerApplicationReceived()` - Confirmation email when player applies
- `sendPlayerApplicationApproved()` - Approval email
- `sendPlayerApplicationRejected()` - Rejection email with optional reason

#### Updated: `AdminService.java`
New methods:
- `getPendingPlayers()` - Get pending player applications
- `approvePlayer(String userId)` - Approve player
- `rejectPlayer(String userId, String reason)` - Reject player

---

### 4. Controllers

#### New: `PlayerApplicationController.java`
Endpoints:
- `POST /api/player-application/apply` - Submit player application (public)

#### Updated: `AdminController.java`
New endpoints:
- `GET /api/admin/player-applications` - List pending player applications
- `PUT /api/admin/player-applications/{userId}/approve` - Approve player
- `PUT /api/admin/player-applications/{userId}/reject` - Reject player

#### Updated: `SportController.java`
- Modified `GET /api/sports` to accept optional `?teamEnabled=true|false` query parameter

---

### 5. Email Templates

Created:
- `player-application-received.html` - Confirmation email
- `player-application-approved.html` - Approval email
- `player-application-rejected.html` - Rejection email

---

### 6. Database Initialization

#### New: `DatabaseInitializer.java`
- Runs on application startup
- Updates existing sports with correct `teamEnabled` flag:
  - Football, Basketball → `teamEnabled = true`
  - Tennis, Padel → `teamEnabled = false`

---

## Frontend Changes

### 1. New Components

#### `JoinAsPlayer.jsx`
- Player registration form
- Fetches only individual sports (`?teamEnabled=false`)
- Fields: username, email, password, confirmPassword, sportId
- Success screen after submission
- Form validation matching backend requirements

#### `PlayerApplications.jsx` (Admin Dashboard)
- Table view of pending player applications
- Approve/Reject buttons with confirmation modals
- Optional rejection reason textarea
- Real-time application count

---

### 2. Updated Components

#### `App.jsx`
- Added route: `/join-player` → `<JoinAsPlayer />`
- Imported `JoinAsPlayer` component

#### `Home.jsx`
- Added "Join as Player" button in hero section
- Button styled with `btn-secondary` class

#### `JoinAsCaptain.jsx`
- Updated to fetch only team sports (`?teamEnabled=true`)

#### `AdminDashboard.jsx`
- Added `'player-applications'` to `VALID_SECTIONS`
- Imported `PlayerApplications` component
- Added section to `SECTIONS` object

#### `AdminSidebar.jsx`
- Added "Player Applications" menu item

---

### 3. Styling

#### `Home.css`
- Added `.btn-secondary` styling for player registration button

---

## API Endpoints Summary

### Public Endpoints
```
GET  /api/sports                          - Get all sports (optional: ?teamEnabled=true|false)
POST /api/captain-application/apply       - Submit captain application
POST /api/player-application/apply        - Submit player application
POST /api/auth/login                      - Login
```

### Admin Endpoints (Requires ADMIN role)
```
GET  /api/admin/captain-applications              - List pending captain applications
PUT  /api/admin/captain-applications/{id}/approve - Approve captain
PUT  /api/admin/captain-applications/{id}/reject  - Reject captain

GET  /api/admin/player-applications               - List pending player applications
PUT  /api/admin/player-applications/{id}/approve  - Approve player
PUT  /api/admin/player-applications/{id}/reject   - Reject player
```

---

## User Flows

### Captain Application Flow
1. User visits `/register` (Join as Captain)
2. Selects from Football or Basketball only
3. Enters: fullName, email, password, teamName, sportId
4. Application submitted → Status: `PENDING_REVIEW`
5. Receives "application received" email
6. Admin approves/rejects from admin dashboard
7. Receives approval/rejection email
8. If approved: Can login with status `ACTIVE`

### Player Application Flow
1. User visits `/join-player` (Join as Player)
2. Selects from Tennis or Padel only
3. Enters: username, email, password, sportId
4. Application submitted → Status: `PENDING_REVIEW`
5. Receives "application received" email
6. Admin approves/rejects from admin dashboard
7. Receives approval/rejection email
8. If approved: Can login with status `ACTIVE`

---

## Testing Checklist

### Backend Tests
- [ ] Captain application only shows Football & Basketball
- [ ] Player application only shows Tennis & Padel
- [ ] Player application creates Player entity with correct fields
- [ ] Email service sends player notification emails
- [ ] Admin can view pending player applications
- [ ] Admin can approve player applications
- [ ] Admin can reject player applications with reason
- [ ] Database initializer sets teamEnabled correctly on startup

### Frontend Tests
- [ ] Home page shows "Join as Player" button
- [ ] Join as Captain form only shows Football & Basketball
- [ ] Join as Player form only shows Tennis & Padel
- [ ] Player form validates all required fields
- [ ] Success screen shows after player application
- [ ] Admin dashboard shows "Player Applications" menu item
- [ ] Player applications table displays correctly
- [ ] Approve/reject modals work correctly
- [ ] Application count badge updates

### Integration Tests
- [ ] Submit captain application → Verify email sent
- [ ] Submit player application → Verify email sent
- [ ] Approve captain → Verify approval email sent
- [ ] Approve player → Verify approval email sent
- [ ] Reject captain → Verify rejection email sent
- [ ] Reject player → Verify rejection email sent
- [ ] Login with pending account → Shows "under review" message
- [ ] Login with inactive account → Shows access denied message
- [ ] Login with active account → Success

---

## Database Schema Changes

### `sports` collection
```javascript
{
  _id: ObjectId,
  sportName: String,
  iconFileId: String,
  scoringRule: String,
  maxPlayers: Number,
  teamEnabled: Boolean  // NEW FIELD
}
```

### `users` collection (Player documents)
```javascript
{
  _id: ObjectId,
  userId: String,
  email: String,
  passwordHash: String,
  fullName: String,      // Now used as username for players
  phoneNumber: String,
  role: "PLAYER",
  accountStatus: String,  // PENDING_REVIEW, ACTIVE, INACTIVE
  playerId: String,
  teamId: String,         // null for individual players
  captainId: String,      // null for individual players
  sportId: String,        // NEW FIELD - for individual players
  appliedAt: DateTime     // NEW FIELD
}
```

---

## Notes

1. **Sport Names Matter**: The `DatabaseInitializer` uses exact sport names ("Football", "Basketball", "Tennis", "Padel"). Ensure these match your database.

2. **Existing Sports**: On first run after deployment, the initializer will update all existing sports with the correct `teamEnabled` flag.

3. **Email Configuration**: Ensure SMTP settings are configured in `application.properties` for email notifications to work.

4. **Frontend API URL**: Verify `app.base-url` in backend and API base URL in frontend match your deployment environment.

5. **Role-Based Access**: Player applications use the same RBAC system as captain applications. Players with `PENDING_REVIEW` status cannot login.

---

## Future Enhancements

- Add player dashboard functionality
- Allow players to view their sport schedules
- Add tournament registration for players
- Add player statistics tracking
- Add player-to-player messaging
- Add search/filter in admin applications view
- Add bulk approve/reject functionality

---

## Deployment Steps

1. **Backend**:
   ```bash
   cd backend
   mvnw clean package -DskipTests
   java -jar target/demo-0.0.1-SNAPSHOT.jar
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   npm run preview
   ```

3. **Verify**:
   - Check application startup logs for "Database initialization completed"
   - Test captain registration (should only show Football & Basketball)
   - Test player registration (should only show Tennis & Padel)
   - Test admin approval workflows

---

## Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check backend logs for exceptions
3. Verify MongoDB connection
4. Verify email service configuration
5. Check that sports exist in database with correct names
