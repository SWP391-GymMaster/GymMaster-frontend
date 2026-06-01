# 24 — Handoff Checklist

## 1. Handoff với Backend

Frontend cần backend cung cấp:

- API base URL
- auth endpoints
- refresh token behavior
- response format
- error format
- pagination format
- role permission rules
- enum values
- sample payloads
- seed accounts

## 2. API contract cần chốt sớm

```text
/auth/login
/auth/refresh
/auth/logout
/me

/users
/staff
/members
/trainers
/packages
/memberships
/payments
/checkins
/trainer-assignments
/workout-plans
/trainer-notes
/progress
/calorie-targets
/food-items
/meal-logs
/dashboard
/audit-logs
```

## 3. Handoff với QA/Test

Cần thống nhất:

- E2E test accounts
- seed data
- critical demo flow
- UAT checklist
- bug severity
- test environment URL

## 4. Handoff với Docs/BA

Cần cập nhật docs khi:

- route đổi
- role permission đổi
- form field đổi
- API contract đổi
- feature chuyển scope
- UI flow đổi

## 5. Demo readiness checklist

- [ ] Login 4 roles chạy.
- [ ] Staff flow chạy.
- [ ] Admin assignment chạy.
- [ ] PT flow chạy.
- [ ] Member meal journal chạy.
- [ ] Dashboard có dữ liệu.
- [ ] Audit log hiển thị.
- [ ] Playwright critical flows pass.
- [ ] Manual demo script pass.
