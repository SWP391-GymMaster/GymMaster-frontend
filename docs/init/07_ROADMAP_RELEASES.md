# 07 — Roadmap & Releases

# GymMaster — Phase Plan, Milestone & Version Release

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

# 1. Phase Overview

| Phase | Tên | Timeline | Story Points | Mục tiêu |
|---|---|---:|---:|---|
| Phase 0 | Discovery & Foundation | 1 tuần | 20 SP | Chốt docs, 4 roles, tech stack, repo, wireframe, database draft |
| Phase 1 | Core Operation | 3 tuần | 65 SP | Auth, user/member/PT/package, sell/renew, check-in, assignment |
| Phase 2 | Progress & Nutrition | 3 tuần | 70 SP | Workout, notes, progress, meal journal |
| Phase 3 | Dashboard & Finalization | 2 tuần | 45 SP | Dashboard, audit log, testing, UAT, final demo |
| Enhancement | Sau secondary nếu còn thời gian | TBD | TBD | Image Food Recognition Assist |
| Total |  | 9 tuần + enhancement optional | 200 SP + TBD |  |

---

# 2. Phase 0 — Discovery & Foundation

## Description
Thiết lập nền tảng tài liệu, repository, wireframe và scope.

## Features / Tasks
- Chốt actors.
- Chốt MVP.
- Chốt tech stack.
- Viết SRS/use cases.
- Draft ERD.
- Setup GitHub.
- Setup frontend skeleton.
- Setup deployment thử.
- Chốt AI workflow.

## Deliverables
- Context docs.
- SRS draft.
- Use case list.
- Database draft.
- GitHub repo.
- Initial UI skeleton.
- Deployment URL nếu có.

---

# 3. Phase 1 — Core Operation

## Features
- Authentication.
- User management.
- Member management.
- PT management.
- Package management.
- Sell package.
- Renew package.
- Check-in.
- PT assignment.
- Basic audit log.

## Deliverables
- Login/logout.
- CRUD users/members/PT/packages.
- Membership selling/renewal flow.
- Check-in flow.
- PT assignment flow.
- Workflow 0/1/2 demo.

---

# 4. Phase 2 — Progress & Nutrition

## Features
- Member 360° Profile.
- Assigned Member List.
- Workout Plan.
- Workout Exercises.
- Daily Trainer Notes.
- Progress Tracking.
- Calorie Target.
- Food Database.
- Add Custom Food.
- Meal Journal.
- Daily Calorie Summary.
- Calorie History.
- Optional Barcode Lookup.

## Deliverables
- PT dashboard.
- Member profile 360°.
- Workout module.
- Notes module.
- Progress module.
- Calorie tracking module.

---

# 5. Phase 3 — Dashboard, Testing & Finalization

## Features
- Revenue dashboard.
- Payment status dashboard.
- Active/expired members.
- Check-in statistics.
- Audit log management.
- Basic reminder.
- Test cases.
- UAT.
- Defect log.
- Seed data.
- Final deployment.

## Deliverables
- Admin dashboard.
- Audit log screen.
- Test case document.
- UAT checklist.
- Demo script.
- Final release.

---

# 6. Version Releases

| Version | Scope | Expected Output |
|---|---|---|
| v0.1 | Docs & Discovery | Context, SRS, use cases, feature specs |
| v0.2 | Foundation | Repo, skeleton, routing, basic layout |
| v0.3 | Auth & Master Data | Auth, users, members, PT, packages |
| v0.4 | Core Transaction | Sell/renew, payment, check-in, PT assignment |
| v0.5 | PT & Progress | Workout, notes, progress |
| v0.6 | Nutrition | Calorie target, food DB, meal log, summary |
| v0.7 | Dashboard | Revenue, payment status, check-ins, audit log |
| v0.8 | Enhancement Candidate | Image Food Recognition Assist nếu team approve và còn thời gian |
| v1.0 | Final Demo | Stable demo, test evidence, final report |

---

# 7. SWP Milestone Mapping

| SWP Milestone | Project Output |
|---|---|
| Milestone 1 | SRS, use cases, ERD draft, architecture draft, UI wireframes |
| Milestone 2 | Workflow 0, Workflow 1, Workflow 2 implementation |
| Milestone 3 | Full system completion, dashboard, testing, UAT |
| Final Presentation | Full demo flow, final report, lessons learned |
