# 13 — Playwright E2E Plan

## 1. Nguyên tắc

Playwright chỉ test critical flow, không test mọi chi tiết UI.

Mục tiêu:

```text
Nếu E2E pass, demo có xác suất fail thấp hơn rõ rệt.
```

## 2. E2E file structure

```text
tests/e2e/
├── auth.spec.ts
├── staff-operation.spec.ts
├── admin-assignment.spec.ts
├── pt-flow.spec.ts
├── member-nutrition.spec.ts
└── admin-dashboard.spec.ts
```

## 3. Test accounts

Cần seed hoặc mock accounts:

| Role | Email |
|---|---|
| Admin | `admin@gymmaster.test` |
| Staff | `staff@gymmaster.test` |
| PT | `pt@gymmaster.test` |
| Member | `member@gymmaster.test` |

## 4. Critical E2E cases

### `auth.spec.ts`

```text
TC-FE-AUTH-01: Login success
TC-FE-AUTH-02: Wrong password shows error
TC-FE-AUTH-03: Admin redirect
TC-FE-AUTH-04: Staff redirect
TC-FE-AUTH-05: PT redirect
TC-FE-AUTH-06: Member redirect
```

### `staff-operation.spec.ts`

```text
TC-FE-STAFF-01: Staff searches member
TC-FE-STAFF-02: Staff opens member detail
TC-FE-STAFF-03: Staff sells package
TC-FE-STAFF-04: Staff renews membership
TC-FE-STAFF-05: Staff checks in member
```

### `admin-assignment.spec.ts`

```text
TC-FE-ADMIN-01: Admin opens member detail
TC-FE-ADMIN-02: Admin assigns PT
TC-FE-ADMIN-03: Assignment appears in member profile
```

### `pt-flow.spec.ts`

```text
TC-FE-PT-01: PT views assigned members
TC-FE-PT-02: PT opens member 360 profile
TC-FE-PT-03: PT creates workout plan
TC-FE-PT-04: PT adds trainer note
TC-FE-PT-05: PT cannot access unassigned member
```

### `member-nutrition.spec.ts`

```text
TC-FE-MEMBER-01: Member views membership
TC-FE-MEMBER-02: Member opens meal journal
TC-FE-MEMBER-03: Member adds meal log
TC-FE-MEMBER-04: Daily calorie summary updates
```

### `admin-dashboard.spec.ts`

```text
TC-FE-DASH-01: Admin dashboard loads
TC-FE-DASH-02: Revenue card visible
TC-FE-DASH-03: Check-in stats visible
TC-FE-DASH-04: Audit log page loads
```

## 5. Playwright rules

- Dùng data-testid cho element quan trọng.
- Không rely vào text dễ đổi nếu không cần.
- Seed data trước test nếu dùng backend thật.
- Test nên độc lập, không phụ thuộc thứ tự nếu có thể.
- Dùng screenshot/video trace khi fail.

## 6. Data-testid convention

```text
login-email-input
login-password-input
login-submit-button
member-search-input
sell-package-submit-button
checkin-submit-button
assign-pt-submit-button
meal-log-submit-button
dashboard-revenue-card
```
