# Quick Reference Guide

## 🎯 What Was Implemented

### Two Registration Types

| Type | Sports | URL | Form Fields |
|------|--------|-----|-------------|
| **Captain** | Football, Basketball | `/register` | fullName, email, password, teamName, sport |
| **Player** | Tennis, Padel | `/join-player` | username, email, password, sport |

---

## 🔗 Key URLs

### Frontend Routes
```
/                    → Home page (with both registration buttons)
/register           → Captain registration (Football/Basketball)
/join-player        → Player registration (Tennis/Padel)
/login              → Login page
/dashboard/admin    → Admin dashboard
```

### Backend API Endpoints
```
GET  /api/sports?teamEnabled=true     → Football, Basketball
GET  /api/sports?teamEnabled=false    → Tennis, Padel

POST /api/captain-application/apply   → Submit captain application
POST /api/player-application/apply    → Submit player application

GET  /api/admin/captain-applications  → List pending captains
PUT  /api/admin/captain-applications/{id}/approve
PUT  /api/admin/captain-applications/{id}/reject

GET  /api/admin/player-applications   → List pending players
PUT  /api/admin/player-applications/{id}/approve
PUT  /api/admin/player-applications/{id}/reject
```

---

## 🎨 UI Features

### Info Banners
- **Captain Form:** "Captain applications are for **Football and Basketball** teams only"
- **Player Form:** "This application is for **Tennis and Padel** players only"

### Sport Selection
- Visual card-based selection (no dropdowns)
- Shows sport icon, name, and player count
- Checkmark appears on selected sport
- Hover effects for better UX

---

## 📧 Email Flow

### Captain Flow
1. Submit application → "Application Received" email
2. Admin reviews → "Approved" or "Rejected" email
3. Login with credentials

### Player Flow
1. Submit application → "Application Received" email
2. Admin reviews → "Approved" or "Rejected" email
3. Login with credentials

---

## 💻 Testing Commands

### Start Backend
```bash
cd backend
mvnw spring-boot:run
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Check Backend Logs
Look for: `"Database initialization completed - sports updated."`

---

## 🔍 What to Look For

### Captain Form (`/register`)
✅ Info banner mentions Football/Basketball  
✅ Exactly 2 sport cards shown  
✅ Cards have Football and Basketball icons  
✅ Team name field present  

### Player Form (`/join-player`)
✅ Info banner mentions Tennis/Padel  
✅ Exactly 2 sport cards shown  
✅ Cards have Tennis and Padel icons  
✅ No team name field  
✅ Username field instead of full name  

### Admin Dashboard
✅ Two sections: "Captain Applications" and "Player Applications"  
✅ Each section has separate table  
✅ Approve/Reject buttons work  
✅ Rejection allows optional reason  

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Wrong sports showing | Restart backend (DatabaseInitializer will fix) |
| CSS not loading | Check import in JoinAsPlayer.jsx |
| Route 404 | Restart frontend dev server |
| Emails not sending | Check application.properties SMTP config |
| Sports cards empty | Verify sports in MongoDB have iconFileId |

---

## 📊 Database Check

### Verify Sports Configuration
```javascript
// In MongoDB
db.sports.find({})

// Expected:
// Football: teamEnabled = true
// Basketball: teamEnabled = true
// Tennis: teamEnabled = false
// Padel: teamEnabled = false
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] Database initialized (check logs)
- [ ] Captain form shows Football/Basketball only
- [ ] Player form shows Tennis/Padel only
- [ ] Info banners display correctly
- [ ] Sport cards show icons
- [ ] Selection works with checkmarks
- [ ] Forms submit successfully
- [ ] Emails send correctly
- [ ] Admin can approve/reject both types

---

## 📝 Remember

1. **teamEnabled flag** controls which sports show where
2. **DatabaseInitializer** runs automatically on startup
3. Both forms use **same CSS file** (JoinAsCaptain.css)
4. Sport filtering uses **query parameter**: `?teamEnabled=true/false`
5. Players use **username** field, captains use **fullName**

---

## 🎉 Success Criteria

✅ Clear separation between team sports and individual sports  
✅ No confusion about which form to use  
✅ Beautiful, consistent UI across both forms  
✅ Complete admin management system  
✅ Full email notification workflow  
✅ Production-ready implementation  
