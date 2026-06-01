# GymMaster API Endpoint Reference

**Version**: 1.0.0  
**Last Updated**: 2026-05-30  
**Base URL**: /api  

---

## Conventions

### Response Format
`json
{
  "success": true,
  "data": { /* response payload */ }
}
`

### Error Format
`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
`

### Paginated Response
`json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "pageSize": 20,
      "pageNumber": 1,
      "totalItems": 150,
      "totalPages": 8
    }
  }
}
`

### Authentication
- **Type**: Bearer Token (JWT)
- **Header**: Authorization: Bearer {accessToken}
- **Access Token**: 15 min expiry
- **Refresh Token**: 7 day expiry

### HTTP Methods
| Method | Usage |
|--------|-------|
| GET | Read/retrieve resources |
| POST | Create resources |
| PUT | Update resources |
| DELETE | Soft-delete resources |

### Common Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| VALIDATION_ERROR | 400 | Request body validation failed |
| FORBIDDEN | 403 | Insufficient role/permissions |
| UNAUTHORIZED | 401 | Missing/invalid token |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate/conflict error |

---

## AUTHENTICATION (/api/auth)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 1 | POST | /api/auth/login | None | All | Login with email/username + password, returns JWT tokens |
| 2 | POST | /api/auth/refresh | None | All | Refresh access token using refresh token |
| 3 | POST | /api/auth/logout | JWT | All | Logout (client-side token invalidation) |
| 4 | GET | /api/auth/me | JWT | All | Get current authenticated user profile |

### Request/Response Examples

**POST /api/auth/login**
`json
// Request
{ "emailOrUsername": "admin@gym.com", "password": "SecurePass123" }

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": { "userId": 1, "email": "admin@gym.com", "role": "Admin", "name": "John Doe" }
  }
}

// Response 401
{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email/username or password" } }
`

**POST /api/auth/refresh**
`json
// Request
{ "refreshToken": "eyJhbGci..." }

// Response 200
{
  "success": true,
  "data": { "accessToken": "eyJhbGci..." }
}
`

**GET /api/auth/me**
`json
// Response 200
{
  "success": true,
  "data": {
    "userId": 1, "email": "admin@gym.com", "username": "admin",
    "role": "Admin", "name": "John Doe", "isLocked": false,
    "lastLoginAt": "2026-05-30T08:30:00Z"
  }
}
`

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| INVALID_CREDENTIALS | 401 | Wrong email/username or password |
| ACCOUNT_LOCKED | 403 | User account is locked |
| INVALID_TOKEN | 401 | Token invalid or malformed |
| TOKEN_EXPIRED | 401 | Access token expired |
| REFRESH_TOKEN_EXPIRED | 401 | Refresh token expired |
| RATE_LIMIT_EXCEEDED | 429 | Too many failed attempts |

---

## USER MANAGEMENT (/api/users)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 5 | GET | /api/users | JWT | Admin | Search & list users with pagination |
| 6 | GET | /api/users/{userId} | JWT | Admin | Get user details |
| 7 | POST | /api/users | JWT | Admin | Create new user account |
| 8 | PUT | /api/users/{userId} | JWT | Admin | Update user account |
| 9 | PUT | /api/users/{userId}/lock | JWT | Admin | Lock user account |
| 10 | PUT | /api/users/{userId}/unlock | JWT | Admin | Unlock user account |
| 11 | DELETE | /api/users/{userId} | JWT | Admin | Soft-delete user account |

### Query Parameters (GET /api/users)
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| pageSize | int | No | Default: 20, Max: 100 |
| pageNumber | int | No | Default: 1 |
| role | string | No | Filter by role |
| isLocked | bool | No | Filter by lock status |
| search | string | No | Search by email, username, name |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| USER_NOT_FOUND | 404 | User not found |
| DUPLICATE_EMAIL | 409 | Email already in use |
| DUPLICATE_USERNAME | 409 | Username already in use |
| INVALID_ROLE | 400 | Invalid role specified |
| PASSWORD_TOO_SHORT | 400 | Password < 8 characters |
| CANNOT_LOCK_ADMIN | 400 | Cannot lock last admin |

---

## STAFF MANAGEMENT (/api/staff)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 12 | GET | /api/staff | JWT | Admin | Search & list staff |
| 13 | GET | /api/staff/{staffId} | JWT | Admin | Get staff details with operation history |
| 14 | POST | /api/staff | JWT | Admin | Create new staff account |
| 15 | PUT | /api/staff/{staffId} | JWT | Admin | Update staff profile |
| 16 | PUT | /api/staff/{staffId}/lock | JWT | Admin | Lock staff account |
| 17 | PUT | /api/staff/{staffId}/unlock | JWT | Admin | Unlock staff account |
| 18 | DELETE | /api/staff/{staffId} | JWT | Admin | Soft-delete staff account |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| STAFF_NOT_FOUND | 404 | Staff not found |
| DUPLICATE_EMAIL | 409 | Email already in use |
| DUPLICATE_PHONE | 409 | Phone already in use |

---

## MEMBER MANAGEMENT (/api/members)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 19 | GET | /api/members | JWT | Admin, Staff | Search & list members with membership status |
| 20 | GET | /api/members/{memberId} | JWT | Admin, Staff, PT(assigned), Member(self) | Get member 360° profile |
| 21 | POST | /api/members | JWT | Admin, Staff | Create new member profile |
| 22 | PUT | /api/members/{memberId} | JWT | Admin, Staff | Update member profile |
| 23 | DELETE | /api/members/{memberId} | JWT | Admin | Soft-delete member profile |

### Query Parameters (GET /api/members)
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| search | string | No | Search by name, phone, email, memberCode |
| membershipStatus | string | No | Active, Expired, ExpiringSoon, None |

### 360° Profile Response Includes
- Current membership status, package, expiry
- Active PT assignment
- Recent check-ins (last 10)
- Progress summary (latest weight, measurements)

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| MEMBER_NOT_FOUND | 404 | Member not found |
| DUPLICATE_PHONE | 409 | Phone already in use |
| FORBIDDEN | 403 | PT accessing unassigned member |

---

## PT MANAGEMENT (/api/pts)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 24 | GET | /api/pts | JWT | Admin | Search & list PTs with assignment load |
| 25 | GET | /api/pts/{ptId} | JWT | Admin | Get PT details with assignments |
| 26 | GET | /api/pts/me | JWT | PT | Get current PT's own profile |
| 27 | POST | /api/pts | JWT | Admin | Create new PT account |
| 28 | PUT | /api/pts/{ptId} | JWT | Admin | Update PT profile |
| 29 | PUT | /api/pts/{ptId}/lock | JWT | Admin | Lock PT account |
| 30 | PUT | /api/pts/{ptId}/unlock | JWT | Admin | Unlock PT account |
| 31 | PUT | /api/pts/me | JWT | PT | PT updates own profile (limited fields) |
| 32 | DELETE | /api/pts/{ptId} | JWT | Admin | Soft-delete PT account |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| PT_NOT_FOUND | 404 | PT not found |
| PT_AT_CAPACITY | 400 | PT reached max assignment capacity |
| PT_INACTIVE | 400 | PT account not active |

---

## MEMBERSHIP PACKAGE (/api/packages)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 33 | GET | /api/packages | JWT | Admin, Staff | Search & list packages |
| 34 | GET | /api/packages/available | JWT | Member (or public) | Get active packages for purchase |
| 35 | GET | /api/packages/{packageId} | JWT | Admin | Get package details with stats |
| 36 | POST | /api/packages | JWT | Admin | Create new membership package |
| 37 | PUT | /api/packages/{packageId} | JWT | Admin | Update membership package |
| 38 | PUT | /api/packages/{packageId}/deactivate | JWT | Admin | Deactivate package |
| 39 | PUT | /api/packages/{packageId}/reactivate | JWT | Admin | Reactivate package |
| 40 | DELETE | /api/packages/{packageId} | JWT | Admin | Delete package (no memberships only) |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| PACKAGE_NOT_FOUND | 404 | Package not found |
| PACKAGE_INACTIVE | 400 | Cannot sell inactive package |
| PACKAGE_HAS_MEMBERSHIPS | 400 | Cannot delete with active memberships |

---

## MEMBERSHIP SELLING & RENEWAL (/api/memberships)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 41 | GET | /api/members/{memberId}/memberships | JWT | Admin, Staff, Member(self) | Get member's membership history |
| 42 | POST | /api/memberships/sell | JWT | Admin, Staff | Sell membership package to member |
| 43 | POST | /api/memberships/{membershipId}/renew | JWT | Admin, Staff | Renew membership |
| 44 | GET | /api/memberships/expiring | JWT | Admin, Staff | Get memberships expiring soon |
| 45 | GET | /api/memberships/stats | JWT | Admin | Get membership statistics for dashboard |
| 46 | POST | /api/payments/{paymentId}/confirm | JWT | Admin, Staff | Confirm payment as paid |
| 47 | POST | /api/payments/{paymentId}/cancel | JWT | Admin | Cancel pending payment |

### Sell/Request
`json
// POST /api/memberships/sell
{ "memberId": 101, "packageId": 3, "startDate": "2026-05-30", "paymentMethod": "Cash" }

// Response 201
{
  "success": true,
  "data": {
    "membershipId": 55, "memberId": 101, "packageName": "Premium 12 Months",
    "startDate": "2026-05-30", "endDate": "2027-05-30", "status": "Active",
    "price": 5000000,
    "payment": { "paymentId": 110, "amount": 5000000, "method": "Cash", "status": "Paid" }
  }
}
`

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| PACKAGE_INACTIVE | 400 | Cannot sell inactive package |
| PAYMENT_ALREADY_PAID | 400 | Cannot cancel paid payment |
| MEMBERSHIP_NOT_FOUND | 404 | Membership not found |

---

## CHECK-IN (/api/checkin)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 48 | POST | /api/checkin | JWT | Member, Admin, Staff | Perform check-in (self/assisted/override) |
| 49 | GET | /api/checkin/my-history | JWT | Member | Get own check-in history |
| 50 | GET | /api/members/{memberId}/checkins | JWT | Admin, Staff | Get member's check-in history |
| 51 | GET | /api/checkin/today | JWT | Admin, Staff | Get today's check-in summary |
| 52 | PUT | /api/checkin/{checkInId}/correct | JWT | Admin | Correct a check-in record |

### Request Examples
`json
// Self check-in
{ "memberCode": "MEM-20260527-0001" }

// Assisted check-in
{ "memberId": 101, "overrideReason": null }

// Override check-in
{ "memberId": 101, "overrideReason": "VIP member override" }
`

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| MEMBERSHIP_EXPIRED | 400 | Membership expired |
| DAILY_LIMIT_REACHED | 400 | Daily check-in limit reached |
| DUPLICATE_CHECKIN | 400 | Checked in within 30 min |
| OVERRIDE_REASON_REQUIRED | 400 | Override reason required |

---

## PT ASSIGNMENT (/api/pt-assignments)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 53 | GET | /api/pt-assignments | JWT | Admin | Search & list PT assignments |
| 54 | GET | /api/pts/{ptId}/assignments | JWT | Admin, PT(self) | Get PT's current & historical assignments |
| 55 | GET | /api/members/{memberId}/pt | JWT | Admin, Staff, PT(assigned), Member(self) | Get member's current & past PT |
| 56 | POST | /api/pt-assignments | JWT | Admin | Create PT assignment |
| 57 | PUT | /api/pt-assignments/{assignmentId}/end | JWT | Admin | End PT assignment |
| 58 | POST | /api/pt-assignments/reassign | JWT | Admin | Reassign member to different PT |
| 59 | GET | /api/pt-assignments/capacity-check | JWT | Admin | Quick check PT capacity |

### Reassign
`json
// POST /api/pt-assignments/reassign
{ "memberId": 101, "newPTId": 7, "notes": "Advanced training program" }

// Response 200
{
  "success": true,
  "data": {
    "previousAssignment": { "assignmentId": 16, "endedAt": "2026-05-30T11:00:00Z" },
    "newAssignment": { "assignmentId": 17, "ptId": 7, "ptName": "Le Thi PT2", "isActive": true }
  }
}
`

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| PT_AT_CAPACITY | 400 | PT reached max capacity |
| ASSIGNMENT_NOT_FOUND | 404 | Assignment not found |
| ASSIGNMENT_ALREADY_ENDED | 400 | Already ended |
| CANNOT_REASSIGN_SAME_PT | 400 | Already assigned to this PT |

---

## WORKOUT PLAN (/api/workout-plans)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 60 | GET | /api/members/{memberId}/workout-plans | JWT | PT(assigned), Member(self) | Get member's workout plans |
| 61 | POST | /api/members/{memberId}/workout-plans | JWT | PT(assigned) | Create workout plan for member |
| 62 | PUT | /api/workout-plans/{planId} | JWT | PT(owner) | Update workout plan |
| 63 | PUT | /api/workout-plans/{planId}/publish | JWT | PT(owner) | Publish workout plan |
| 64 | PUT | /api/workout-plans/{planId}/complete | JWT | PT(owner) | Complete workout plan |
| 65 | POST | /api/workout-plans/{planId}/duplicate | JWT | PT | Duplicate plan for another member |

---

## TRAINER NOTES (/api/trainer-notes)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 66 | GET | /api/members/{memberId}/trainer-notes | JWT | PT(assigned), Member(self) | Get trainer notes for member |
| 67 | POST | /api/members/{memberId}/trainer-notes | JWT | PT(assigned) | Add trainer note |
| 68 | PUT | /api/trainer-notes/{noteId} | JWT | PT(owner) | Update trainer note (within 24h) |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| WORKOUT_PLAN_NOT_FOUND | 404 | Plan not found |
| PT_NOT_ASSIGNED | 403 | PT not assigned to member |
| PLAN_ALREADY_COMPLETED | 400 | Cannot modify completed plan |
| NOTE_IMMUTABLE | 400 | Note older than 24h |

---

## PROGRESS TRACKING (/api/progress)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 69 | POST | /api/members/{memberId}/progress/weight | JWT | Member(self), PT(assigned) | Record body weight |
| 70 | POST | /api/members/{memberId}/progress/measurements | JWT | Member(self), PT(assigned) | Record body measurements |
| 71 | POST | /api/members/{memberId}/progress/photos | JWT | Member(self), PT(assigned) | Upload progress photo (multipart) |
| 72 | GET | /api/members/{memberId}/progress/weight | JWT | Member(self), PT(assigned), Admin | Get weight history |
| 73 | GET | /api/members/{memberId}/progress/photos | JWT | Member(self), PT(assigned), Admin | Get progress photo gallery |
| 74 | GET | /api/pts/me/progress-summary | JWT | PT | PT progress summary for all assigned members |
| 75 | GET | /api/progress/{recordId} | JWT | Member(self), PT(assigned), Admin | Get single progress record |
| 76 | DELETE | /api/progress/{recordId} | JWT | Creator | Delete progress record (within 24h) |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| PROGRESS_RECORD_NOT_FOUND | 404 | Record not found |
| PHOTO_TOO_LARGE | 400 | Photo > 10MB |
| RECORD_TOO_OLD | 400 | Record older than 24h |
| INVALID_WEIGHT | 400 | Weight must be 1-500 kg |

---

## CALORIE TRACKING & MEAL JOURNAL (/api/meals, /api/foods)

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 77 | GET | /api/foods/search | JWT | Member, PT, Admin | Search food database |
| 78 | GET | /api/foods/custom | JWT | Member | Get custom foods |
| 79 | POST | /api/foods | JWT | Member(custom), Admin(global) | Add food item |
| 80 | POST | /api/meals | JWT | Member | Log a meal entry |
| 81 | GET | /api/meals/today | JWT | Member | Get today's meal log & calorie summary |
| 82 | GET | /api/meals/history | JWT | Member, PT(assigned) | Get meal history |
| 83 | PUT | /api/calorie-target | JWT | Member, PT(assigned) | Set/update daily calorie target |
| 84 | GET | /api/meals/calorie-chart | JWT | Member, PT(assigned) | Get 30-day calorie chart data |
| 85 | PUT | /api/meals/{mealId} | JWT | Member(own) | Update meal log |
| 86 | DELETE | /api/meals/{mealId} | JWT | Member(own) | Delete meal log |
| 87 | GET | /api/pts/me/members/{memberId}/nutrition | JWT | PT(assigned) | PT views member's nutrition |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| FOOD_NOT_FOUND | 404 | Food not found |
| MEAL_NOT_FOUND | 404 | Meal not found |
| INVALID_CALORIES | 400 | Calories 1-9999 |
| INVALID_MEAL_TYPE | 400 | Must be Breakfast/Lunch/Dinner/Snack |
| FUTURE_DATE | 400 | Cannot log future date |

---

## DASHBOARD & AUDIT LOG

| # | Method | Endpoint | Auth | Actors | Description |
|---|--------|----------|------|--------|-------------|
| 88 | GET | /api/dashboard/admin | JWT | Admin | Full admin dashboard |
| 89 | GET | /api/dashboard/staff | JWT | Staff | Limited staff dashboard |
| 90 | GET | /api/audit-logs | JWT | Admin | Search audit logs with filtering |
| 91 | GET | /api/audit-logs/actions | JWT | Admin | Get list of audit action types |
| 92 | GET | /api/audit-logs/export | JWT | Admin | Export audit logs (CSV/JSON) |
| 93 | GET | /api/audit-logs/{auditLogId} | JWT | Admin | Get single audit log detail |

### Audit Log Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| userId | int | Filter by user |
| action | string | Filter by action type |
| entityType | string | Filter by entity type |
| startDate | string | Filter from date |
| endDate | string | Filter to date |
| search | string | Search in details JSON |

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| AUDIT_LOG_NOT_FOUND | 404 | Log entry not found |
| EXPORT_TOO_LARGE | 400 | > 10,000 records |

---

## Audit Action Reference

### Authentication
LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT

### User Management
USER_CREATED, USER_UPDATED, USER_LOCKED, USER_UNLOCKED, USER_DELETED

### Member Management
MEMBER_CREATED, MEMBER_UPDATED, MEMBER_DELETED

### Staff Management
STAFF_CREATED, STAFF_UPDATED, STAFF_LOCKED, STAFF_UNLOCKED, STAFF_DELETED

### PT Management
PT_CREATED, PT_UPDATED, PT_LOCKED, PT_UNLOCKED, PT_DELETED  
PT_SELF_UPDATED

### Package Management
PACKAGE_CREATED, PACKAGE_UPDATED, PACKAGE_DEACTIVATED, PACKAGE_REACTIVATED

### Membership & Payment
MEMBERSHIP_SOLD, MEMBERSHIP_RENEWED, MEMBERSHIP_CANCELLED  
PAYMENT_RECORDED, PAYMENT_CONFIRMED, PAYMENT_CANCELLED

### PT Assignment
PT_ASSIGNED, PT_ASSIGNMENT_ENDED, PT_REASSIGNED

### Workout & Notes
WORKOUT_PLAN_CREATED, WORKOUT_PLAN_PUBLISHED, WORKOUT_PLAN_COMPLETED
WORKOUT_PLAN_UPDATED  
TRAINER_NOTE_CREATED, TRAINER_NOTE_UPDATED

### Progress
PROGRESS_WEIGHT_RECORDED, PROGRESS_MEASUREMENTS_RECORDED, PROGRESS_PHOTO_UPLOADED
PROGRESS_RECORD_DELETED

### Meal
MEAL_LOGGED, MEAL_UPDATED, MEAL_DELETED

### Food
FOOD_ADDED, FOOD_UPDATED

### Check-in
CHECKIN_OVERRIDE, CHECKIN_CORRECTED

---

## Summary Statistics

| Category | Endpoints |
|----------|-----------|
| Authentication | 4 |
| User Management | 7 |
| Staff Management | 7 |
| Member Management | 5 |
| PT Management | 9 |
| Membership Package | 8 |
| Membership Selling | 7 |
| Check-in | 5 |
| PT Assignment | 7 |
| Workout Plan | 6 |
| Trainer Notes | 3 |
| Progress Tracking | 8 |
| Calorie / Meal | 11 |
| Dashboard & Audit | 6 |
| **Total** | **93** |

---

## Role Access Matrix

| Endpoint Group | Admin | Staff | PT | Member |
|----------------|-------|-------|----|--------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Staff | ✅ | ❌ | ❌ | ❌ |
| Members (CRUD) | ✅ | ✅ | ❌ | ❌ |
| Members (Read) | ✅ | ✅ | ✅(assigned) | ✅(self) |
| PTs (CRUD) | ✅ | ❌ | ❌ | ❌ |
| PTs (Self) | ❌ | ❌ | ✅ | ❌ |
| Packages (CRUD) | ✅ | ❌ | ❌ | ❌ |
| Packages (Read) | ✅ | ✅ | ❌ | ✅ |
| Membership Sell | ✅ | ✅ | ❌ | ❌ |
| Check-in | ✅ | ✅ | ❌ | ✅(self) |
| PT Assignment | ✅ | ❌ | ❌ | ❌ |
| Workout Plans | ✅(read) | ❌ | ✅(own) | ✅(read) |
| Trainer Notes | ✅(read) | ❌ | ✅(own) | ✅(read) |
| Progress | ✅(read) | ❌ | ✅(assigned) | ✅(self) |
| Meals/Foods | ✅(food DB) | ❌ | ✅(read assigned) | ✅(self) |
| Dashboard | ✅(full) | ✅(limited) | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ |

**Legend**: ✅ = Access, ❌ = No Access

---

**Spec References**: SPEC-01 to SPEC-13  
**Maintained by**: BA Team  
**Last Updated**: 2026-05-30
