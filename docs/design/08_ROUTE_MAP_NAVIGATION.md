# 08 — Route Map & Role-based Navigation

> Repo-local status: Frontend target route map derived from `docs/init` roles and use cases. Routes in this file are planned until implemented in code. Login must not include role selection.

## 1. Route map

```text
/login

/admin/dashboard
/admin/users
/admin/staff
/admin/members
/admin/trainers
/admin/packages
/admin/memberships
/admin/payments
/admin/assignments
/admin/audit-logs

/staff/dashboard
/staff/members
/staff/members/[id]
/staff/sell-package
/staff/renew-package
/staff/check-in
/staff/payments

/pt/dashboard
/pt/members
/pt/members/[id]
/pt/members/[id]/workout
/pt/members/[id]/notes
/pt/members/[id]/progress
/pt/members/[id]/nutrition

/member/dashboard
/member/membership
/member/check-in
/member/workout
/member/notes
/member/progress
/member/nutrition
/member/nutrition/meal-journal
```

## 2. Admin navigation

```text
Dashboard
Users
Staff
Members
PTs
Packages
Memberships
Payments
PT Assignment
Audit Logs
```

## 3. Staff navigation

```text
Today Operations
Member Search
Sell/Renew Package
Check-in
Payments
```

## 4. PT navigation

```text
Dashboard
Assigned Members
Workout Plans
Trainer Notes
Progress
Nutrition
```

## 5. Member navigation

```text
Dashboard
Membership
Check-in / QR
Workout
Progress
Meal Journal
Calorie Summary
```

## 6. Permission rule

Route guard phải kiểm tra role trước khi render page.

Nếu không có quyền:

```text
Redirect hoặc hiển thị PermissionDenied.
Không chỉ ẩn menu.
```
