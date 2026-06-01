# 04 — Requirements

# GymMaster — Functional & Non-functional Requirements

> Repo-local status: Full-system requirements source of truth. Frontend work owns UI, route, client validation, client state, API integration, and frontend permission presentation. Backend, database, token issuing, hashing, and server-side authorization are external contracts for this repo.

---

# 0. Technology Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js |
| Backend | C# / ASP.NET Core 8 Web API |
| Database | MySQL |
| ORM | Entity Framework Core 8 - Code First Migrations |
| Authentication | JWT Bearer Token + BCrypt |
| Token Policy | Access Token 15 phút, Refresh Token 7 ngày |
| AI Vision | Google Cloud Vision API |
| Push Notification | Firebase Cloud Messaging |
| File Storage | Azure Blob Storage |
| Frontend Deploy | Vercel |
| Backend Deploy | Azure App Service |
| Version Control | GitHub Monorepo |
| API Testing | Postman / Thunder Client |

---

# 1. Functional Requirements

## 1.1 Authentication

| FR ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-01 | User can login using email/username and password. | High |
| FR-AUTH-02 | User can logout from the system. | High |
| FR-AUTH-03 | System redirects user based on role after login. | High |
| FR-AUTH-04 | System prevents locked users from logging in. | High |
| FR-AUTH-05 | System protects pages/features by role. | High |

## 1.2 User, Member, PT

| FR ID | Requirement | Priority |
|---|---|---|
| FR-USER-01 | Admin can create/update/lock user accounts. | High |
| FR-MEM-01 | Admin/Staff can create/update/search member profiles. | High |
| FR-PT-01 | Admin can create/update/search PT profiles. | High |
| FR-STAFF-01 | Admin can create/update/lock/search staff accounts. | High |
| FR-PT-02 | PT can view assigned members. | High |

## 1.3 Membership

| FR ID | Requirement | Priority |
|---|---|---|
| FR-PKG-01 | Admin can create/update/deactivate membership packages. | High |
| FR-MSHIP-01 | Admin/Staff can sell membership package to member. | High |
| FR-MSHIP-02 | Member can request renewal; Admin/Staff can confirm renewal and payment. | High |
| FR-MSHIP-03 | System creates payment record for selling/renewal. | High |
| FR-MSHIP-04 | System updates membership start/end date. | High |
| FR-MSHIP-05 | System tracks payment status. | High |

## 1.4 Check-in & PT Assignment

| FR ID | Requirement | Priority |
|---|---|---|
| FR-CHK-01 | Member can check in using QR/card. | High |
| FR-CHK-02 | Admin/Staff can check in member manually if needed. | Medium |
| FR-CHK-03 | System verifies membership status before check-in. | High |
| FR-ASG-01 | Admin can assign PT to member. | High |
| FR-ASG-02 | System ensures member has at most one active PT assignment. | High |
| FR-ASG-03 | PT can view only assigned members. | High |

## 1.5 Workout, Progress, Nutrition

| FR ID | Requirement | Priority |
|---|---|---|
| FR-WP-01 | PT can create workout plan. | High |
| FR-WP-02 | PT can add exercises to workout plan. | High |
| FR-NOTE-01 | PT can add daily trainer note. | High |
| FR-PROG-01 | Member/PT can add progress record. | High |
| FR-CAL-01 | PT/Member can set daily calorie target. | High |
| FR-CAL-02 | Member can add meal log. | High |
| FR-CAL-03 | Member can search food item. | High |
| FR-CAL-04 | Member can add custom food. | High |
| FR-CAL-05 | System calculates daily consumed calories. | High |
| FR-CAL-06 | Member/PT can view calorie history according to permission. | High |

## 1.6 Dashboard & Audit

| FR ID | Requirement | Priority |
|---|---|---|
| FR-DASH-01 | Admin can view total revenue. | High |
| FR-DASH-02 | Admin can view payment status summary. | High |
| FR-DASH-03 | Admin can view active/expired member count. | High |
| FR-DASH-04 | Admin can view check-in statistics. | Medium |
| FR-AUD-01 | System writes audit log for important actions. | High |
| FR-AUD-02 | Admin can view/filter audit logs. | High |

---

# 2. Non-functional Requirements

| NFR ID | Requirement |
|---|---|
| NFR-PERF-01 | Common pages should load within 3 seconds under demo conditions. |
| NFR-PERF-02 | Large lists must support pagination/filtering. |
| NFR-SEC-01 | Passwords must not be stored as plain text. |
| NFR-SEC-02 | Secrets must not be committed to GitHub. |
| NFR-SEC-03 | Role-based access is required for protected features. |
| NFR-SEC-04 | PT must not access members not assigned to them. |
| NFR-USE-01 | UI should be simple enough for gym staff to use quickly. |
| NFR-REL-01 | Important actions should have clear feedback. |
| NFR-REL-02 | Audit logs should be recorded for important changes. |
| NFR-MAIN-01 | Code should be organized by module/feature. |
| NFR-DOC-01 | Use cases, database and demo flow must be documented. |
