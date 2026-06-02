# GymMaster Frontend Docs Pack

**Phiên bản:** v1.0-approved  
**Ngôn ngữ:** Tiếng Việt  
**Owner:** Frontend + UX/UI  
**Mục tiêu:** Chuẩn hóa toàn bộ kiến trúc frontend, UX/UI, testing, AI workflow, context management và repo workflow cho dự án GymMaster.

> Runtime UI copy target: final `docs/init/04_REQUIREMENTS.md` requires Vietnamese user-facing UI. Existing English screens are partial migration state. See `docs/07-copy-language-decision.md`.

---

## 1. Frontend stack đã chốt

## 0. Product source

Frontend docs are derived from the full-system GymMaster SPEC in `docs/init/`.

Read order for frontend work:

1. `AGENTS.md` for repo rules.
2. `docs/init/00_INDEX.md`, `01_CONTEXT.md`, `02_PRODUCT_SCOPE.md`, `03_SRS_USE_CASES.md`, `04_REQUIREMENTS.md`, and `16_API_ENDPOINT_REFERENCE.md` for product and API rules.
3. `docs/backend/` for concrete backend API/RBAC/error contracts used by frontend integration and MSW mocks.
4. This `docs/design/` pack for frontend UX/UI and implementation guidance.

This repo implements frontend only. Backend, database, auth server, storage, notification, and AI service details from `docs/init/` and `docs/backend/` are external contracts.

---

## 1. Frontend stack đã chốt

| Nhóm | Công nghệ |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI System | shadcn/ui |
| Forms | React Hook Form + Zod |
| Server State | TanStack Query |
| Tables | TanStack Table |
| Charts | Recharts |
| Icons | Lucide React |
| Toast | Sonner |
| Date utility | date-fns |
| Client state | Zustand |
| Motion | Framer Motion |
| Component/Unit Test | Vitest + React Testing Library |
| E2E Test | Playwright |
| API mocking for FE test | MSW |
| Latest docs/context | Context7 |
| Spec-driven workflow | GitHub Spec Kit |

---

## 2. Cách đọc bộ docs

| Thứ tự | File | Mục đích |
|---:|---|---|
| 1 | `01_FE_FINAL_RECOMMENDATION.md` | Đề xuất cuối cùng và nguyên tắc triển khai |
| 2 | `02_FE_TECH_STACK.md` | Tech stack, package, core/optional |
| 3 | `03_FE_ARCHITECTURE.md` | Kiến trúc thư mục, convention, module |
| 4 | `04_DESIGN_SYSTEM.md` | Design direction và UI principles |
| 5 | `05_COLOR_TYPOGRAPHY_TOKENS.md` | Color palette, typography, token |
| 6 | `06_COMPONENT_GUIDELINES.md` | Quy tắc component và shadcn/ui |
| 7 | `07_UX_FLOWS_BY_ROLE.md` | UX flow theo Admin, Staff, PT, Member |
| 8 | `08_ROUTE_MAP_NAVIGATION.md` | Route map và role-based navigation |
| 9 | `09_FORMS_VALIDATION.md` | Form, validation, Zod schema |
| 10 | `10_TABLES_DASHBOARD_CHARTS.md` | DataTable, dashboard, chart rules |
| 11 | `11_STATE_API_DATA_FETCHING.md` | API client, React Query, Zustand |
| 12 | `12_TESTING_STRATEGY.md` | Frontend testing strategy |
| 13 | `13_PLAYWRIGHT_E2E_PLAN.md` | E2E critical demo flows |
| 14 | `14_ERROR_LOADING_EMPTY_STATES.md` | Loading/error/empty/permission states |
| 15 | `15_ACCESSIBILITY_RESPONSIVE.md` | Accessibility và responsive rules |
| 16 | `16_REPO_WORKFLOW_CI_CD.md` | Repo workflow, branch, PR, CI gates |
| 17 | `17_AI_WORKFLOW_CONTEXT_MANAGEMENT.md` | AI workflow và context management |
| 18 | `18_SPEC_KIT_WORKFLOW.md` | GitHub Spec Kit workflow |
| 19 | `19_CONTEXT7_GUIDELINES.md` | Quy tắc dùng Context7 |
| 20 | `20_PROMPT_ALIASES.md` | Prompt aliases dùng nhanh |
| 21 | `21_FRONTEND_BACKLOG.md` | Frontend backlog theo sprint |
| 22 | `22_FRONTEND_DEFINITION_OF_DONE.md` | Definition of Done cho FE |
| 23 | `23_PACKAGE_INSTALLATION.md` | Commands cài đặt packages |
| 24 | `24_HANDOFF_CHECKLIST.md` | Checklist handoff với Backend/QA/Docs |

---

## 3. Nguyên tắc quan trọng nhất

```text
Build theo demo flow trước, không build CRUD rời rạc trước.
```

Demo flow ưu tiên:

```text
Login
→ Staff tạo/tìm Member
→ Staff bán/gia hạn gói
→ Member check-in
→ Admin assign PT
→ PT tạo workout plan/note
→ Member xem profile/progress/meal journal
→ Admin xem dashboard/audit log
```
