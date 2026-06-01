# 08 — Tasks Backlog

# GymMaster — Backlog & Task Plan

---

# 1. Epic Overview

| Epic ID | Epic | Phase |
|---|---|---|
| EP-01 | Documentation & Planning | Phase 0 |
| EP-02 | Project Setup | Phase 0 |
| EP-03 | Authentication | Phase 1 |
| EP-04 | User/Staff/Member/PT Management | Phase 1 |
| EP-05 | Membership & Payment | Phase 1 |
| EP-06 | Check-in | Phase 1 |
| EP-07 | PT Assignment | Phase 1 |
| EP-08 | Workout & Notes | Phase 2 |
| EP-09 | Progress Tracking | Phase 2 |
| EP-10 | Calorie Tracking | Phase 2 |
| EP-11 | Dashboard & Audit Log | Phase 3 |
| EP-12 | Testing & Final Demo | Phase 3 |
| EP-13 | Image Food Recognition Assist | Enhancement |

---

# 2. Phase 0 Tasks

| Task ID | Task | Owner | SP | Status |
|---|---|---|---:|---|
| T-001 | Review and approve product scope | TBD | 3 | Todo |
| T-002 | Decide roles: 4 roles — Admin, Staff, PT, Member | Team | 2 | Done |
| T-003 | Decide tech stack: Next.js + ASP.NET Core 8 Web API + MySQL | Team | 5 | Done |
| T-004 | Finalize use case list | TBD | 5 | Todo |
| T-005 | Draft ERD | TBD | 5 | Todo |
| T-006 | Create GitHub repo | TBD | 2 | Todo |
| T-007 | Setup project skeleton | TBD | 5 | Todo |
| T-008 | Prepare initial wireframes | TBD | 8 | Todo |

---

# 3. Phase 1 Tasks

| Task ID | Task | Owner | SP | Status |
|---|---|---|---:|---|
| T-101 | Implement login/logout | TBD | 8 | Todo |
| T-102 | Implement role-based navigation | TBD | 5 | Todo |
| T-103 | Implement user management | TBD | 8 | Todo |
| T-104 | Implement member management | TBD | 8 | Todo |
| T-105 | Implement PT management | TBD | 5 | Todo |
| T-106 | Implement package management | TBD | 8 | Todo |
| T-107 | Implement sell package flow | TBD | 10 | Todo |
| T-108 | Implement renewal flow | TBD | 8 | Todo |
| T-109 | Implement check-in flow | TBD | 8 | Todo |
| T-110 | Implement PT assignment | TBD | 8 | Todo |
| T-111 | Implement basic audit logs | TBD | 5 | Todo |

---

# 4. Phase 2 Tasks

| Task ID | Task | Owner | SP | Status |
|---|---|---|---:|---|
| T-201 | Implement member 360° profile | TBD | 10 | Todo |
| T-202 | Implement PT assigned member list | TBD | 5 | Todo |
| T-203 | Implement workout plan | TBD | 10 | Todo |
| T-204 | Implement workout exercises | TBD | 8 | Todo |
| T-205 | Implement trainer notes | TBD | 8 | Todo |
| T-206 | Implement progress tracking | TBD | 10 | Todo |
| T-207 | Implement calorie target | TBD | 5 | Todo |
| T-208 | Implement food database | TBD | 8 | Todo |
| T-209 | Implement add custom food | TBD | 5 | Todo |
| T-210 | Implement meal journal | TBD | 8 | Todo |
| T-211 | Implement daily calorie summary | TBD | 5 | Todo |
| T-212 | Implement calorie history | TBD | 5 | Todo |

---

# 5. Phase 3 Tasks

| Task ID | Task | Owner | SP | Status |
|---|---|---|---:|---|
| T-301 | Implement revenue dashboard | TBD | 8 | Todo |
| T-302 | Implement payment status dashboard | TBD | 5 | Todo |
| T-303 | Implement check-in statistics | TBD | 5 | Todo |
| T-304 | Implement audit log screen | TBD | 5 | Todo |
| T-305 | Write test cases | TBD | 8 | Todo |
| T-306 | Prepare UAT checklist | TBD | 5 | Todo |
| T-307 | Prepare seed data | TBD | 5 | Todo |
| T-308 | Prepare demo script | TBD | 5 | Todo |
| T-309 | Fix bugs from UAT | TBD | 8 | Todo |
| T-310 | Final deployment | TBD | 5 | Todo |

---

# 7. Definition of Ready

Một task sẵn sàng để làm khi:
- Có mô tả rõ.
- Có acceptance criteria.
- Có owner.
- Có priority.
- Có liên kết tới use case/feature.
- Không còn open question blocker.

# 8. Definition of Done

Một task được xem là done khi:
- Code chạy được local.
- Không có lỗi build.
- Có validation input chính.
- Có happy path được test.
- Có ít nhất 1 error case nếu task có logic nghiệp vụ.
- Không hardcode secret.
- Có commit rõ ràng.
- Có screenshot/video nếu là UI.
- Có cập nhật docs nếu thay đổi requirement hoặc business rule.


---

# 6. Enhancement Tasks — Image Food Recognition Assist

Chỉ làm sau khi core và secondary đã ổn định.

| Task ID | Task | Owner | SP | Status |
|---|---|---|---:|---|
| T-401 | Research image recognition service options | TBD | 3 | Todo |
| T-402 | Design meal image upload UI | TBD | 5 | Todo |
| T-403 | Implement image upload metadata | TBD | 5 | Todo |
| T-404 | Implement food/ingredient suggestion response parser | TBD | 8 | Todo |
| T-405 | Map suggestions to FoodItems | TBD | 8 | Todo |
| T-406 | Add user confirmation/edit step | TBD | 8 | Todo |
| T-407 | Fallback to manual meal log when service fails | TBD | 5 | Todo |
| T-408 | Test recognition success/fail/manual fallback | TBD | 5 | Todo |
