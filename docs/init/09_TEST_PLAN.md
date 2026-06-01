# 09 — Test Plan

# GymMaster — Test Strategy

---

# 1. Test Objectives

- Đảm bảo core workflow chạy được.
- Đảm bảo business rules không bị vi phạm.
- Đảm bảo role-based access hoạt động đúng.
- Đảm bảo dashboard lấy dữ liệu từ workflow thật.
- Đảm bảo demo final ổn định.

---

# 2. Test Types

| Type | Description |
|---|---|
| Manual Test | Test UI flow bằng tay. |
| API Test | Test endpoint bằng Postman/Thunder Client nếu có API riêng. |
| Unit Test | Test logic business quan trọng nếu có backend/service layer. |
| Integration Test | Test flow nhiều module liên quan. |
| UAT | Test theo kịch bản người dùng cuối. |

---

# 3. Core Test Scenarios

## Authentication

| TC ID | Scenario | Expected |
|---|---|---|
| TC-001 | Login valid account | Login success |
| TC-002 | Login wrong password | Show error |
| TC-003 | Locked user login | Access denied |
| TC-004 | Logout | Session ended |

## Membership

| TC ID | Scenario | Expected |
|---|---|---|
| TC-201 | Sell package to member | Payment + membership created |
| TC-202 | Sell inactive package | Rejected |
| TC-203 | Renew membership | End date updated |
| TC-204 | Payment pending | Membership pending |

## Check-in

| TC ID | Scenario | Expected |
|---|---|---|
| TC-301 | Active member check-in | Check-in created |
| TC-302 | Expired member check-in | Rejected or warning based on team rule |
| TC-303 | Invalid QR/card | Rejected |
| TC-304 | Check-in shown in dashboard | Dashboard updated |

## PT Assignment

| TC ID | Scenario | Expected |
|---|---|---|
| TC-401 | Assign PT to member | Assignment created |
| TC-402 | Assign new PT when old active exists | Old assignment closed, new created |
| TC-403 | PT views assigned member | Data shown |
| TC-404 | PT views unassigned member | Access denied |

## Calorie Tracking

| TC ID | Scenario | Expected |
|---|---|---|
| TC-601 | Set calorie target | Target saved |
| TC-602 | Add meal log from food item | Meal saved, summary updated |
| TC-603 | Add custom food | Custom food saved |
| TC-604 | Invalid quantity | Validation error |
| TC-605 | View daily summary | Correct consumed/remaining calories |
| TC-606 | PT views member calorie history | Data shown only for assigned member |
| TC-607 | Image recognition suggests food names | Suggestions shown for user confirmation |
| TC-608 | User edits wrong recognition result | Corrected food item saved |
| TC-609 | Recognition service fails | Manual meal log fallback works |

---

# 4. UAT Demo Script

1. Admin logs in.
2. Admin creates package.
3. Admin creates/finds member.
4. Admin sells package.
5. Member logs in.
6. Member checks in.
7. Admin assigns PT.
8. PT logs in.
9. PT creates workout plan.
10. PT adds trainer note.
11. Member views 360° profile.
12. Member adds meal log.
13. Member views daily calorie summary.
14. Admin views dashboard.
15. Admin views audit log.

---

# 5. Defect Log Template

| Defect ID | Feature | Description | Severity | Owner | Status | Fixed In |
|---|---|---|---|---|---|---|
| BUG-001 |  |  | Low/Medium/High | TBD | Open |  |
