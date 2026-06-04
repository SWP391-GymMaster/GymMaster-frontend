# AGENTS.MD — GymMaster Frontend

> Operating guide for all AI coding agents working on the **GymMaster Frontend** repository.  
> Strict mode is enabled. Follow this file unless the human owner explicitly updates the rules.

---

## 1. Project Identity

**Project:** GymMaster  
**Domain:** gym management, membership operations, staff check-in, PT coaching, workout planning, meal journal, calorie tracking  
**Frontend responsibility:** full frontend implementation + UX/UI consistency  
**Goal:** build a premium, stable, demo-ready frontend for the SWP291 course project.

GymMaster is not a generic CRUD admin dashboard. It should feel like a polished fitness operations product with role-focused workspaces.

---

## 2. Source of Truth

This repository is the **frontend implementation repository** for the GymMaster system described in `docs/init/`.

Use source-of-truth layers in this order:

1. `AGENTS.md` for agent rules and non-negotiable frontend constraints.
2. `docs/init/` for full-system product scope, roles, use cases, requirements, API expectations, roadmap, and business rules.
3. `docs/backend/` for backend feature specs, auth API details, RBAC rules, response shapes, error codes, and endpoint contracts that the frontend must integrate with or mock.
4. `docs/design/` for frontend UX/UI, frontend architecture, route map, component, workflow, and implementation guidance derived from the product spec.
5. Actual code/config for current implemented behavior.

The official design sources have been packaged into this repository under `docs/design/`:

```text
GymMaster Full Premium App v8
GymMaster Full Premium App v8 Auth Update
GymMaster Design UX/UI FE Docs Final V4
```

The current approved visual direction is the packaged **GymMaster OS design system** under `docs/design/design-system/`.  
Older **Full Premium App v8**, **Auth Update**, and **Final V4** documents remain useful historical/product references, but runtime UI should follow the new repo-local design-system screens and tokens unless the human owner changes direction again.

Backend, database, ORM, Azure, and API testing details in `docs/init/` and `docs/backend/` are **external system contracts** for this frontend repo. Do not implement backend/database code here unless the human owner explicitly changes repo scope.

If older docs/plugins conflict with this file, follow this file first, then `docs/init/` for product rules, then `docs/backend/` for API/RBAC/backend contracts, then the relevant files in `docs/design/` for frontend implementation.

---

## 3. Mandatory Auth & Navigation Rules

These rules are non-negotiable.

```text
Login must NOT show role options.
Users sign in normally with email/password.
Backend/Auth system identifies the user's role after login.
Frontend redirects based on the authenticated user's role.
Header/nav only shows the current user's role badge.
Header/nav/auth must NOT list all roles.
```

Correct flow:

```text
User opens /login
→ enters email/password
→ backend authenticates account
→ backend returns token + user profile
→ user.role is known
→ frontend redirects to the correct workspace
```

Redirect map:

```ts
const dashboardByRole = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  pt: "/pt/dashboard",
  member: "/member/dashboard",
} as const;
```

Do not create:

```text
RolePicker
Role selection tabs
Admin/Staff/PT/Member login buttons
Role cards on login
Header role switcher
Navigation showing all roles
```

If demo needs multiple roles, use multiple seed accounts. Do not add a role picker.

---

## 4. Frontend Tech Stack

Use this stack unless the human owner explicitly changes it.

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
TanStack Query
TanStack Table
Zustand
Recharts
Framer Motion
MSW
Sonner
Lucide React
date-fns
Vitest
React Testing Library
Playwright
Context7
OpenSpec
Understand-Anything
```

Package manager:

```bash
npm
```

Do not switch to pnpm, yarn, or bun unless explicitly approved.

---

## 5. Default Commands

Use these standard commands:

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

If a command does not exist yet, do not invent a new workflow silently. Either add the script intentionally or ask for approval.

Recommended scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "quality": "npm run typecheck && npm run lint && npm run test -- --run && npm run test:e2e"
  }
}
```

---

## 6. Strictness Mode

This repository uses **Strict Mode B**.

AI agents must not:

```text
Add features outside the requested task.
Change product scope.
Change design direction.
Add new packages without approval.
Change repo structure without approval.
Replace shadcn/ui with another UI library.
Introduce role picker into login.
Create mobile desktop tables.
Skip loading/error/empty states.
Skip role permission checks.
Skip tests for critical flows.
```

AI agents may suggest improvements, but must not implement them unless the task explicitly asks for them.

---

## 7. Scope Rules

Figma may contain full design coverage, but not every screen is MVP.

Always classify work as:

```text
MVP
Secondary
Future
UI Prepared
Out of Scope
```

Before implementing a screen or feature, identify its priority.

### MVP priority

```text
First Launch / Welcome
Login
Role redirect
Staff Front Desk
Member Search
Member Detail
Sell Package
Renew Package
Check-in
Admin Dashboard
Assign PT
Audit Logs
PT Dashboard
Assigned Members
Member 360
Workout Plan
Trainer Notes
Member Dashboard
Meal Journal
Add Meal
Calorie Summary
```

### Secondary

```text
Package Management
Payment History
Food Search / Custom Food
Progress Tracking
Profile & Settings
Notifications basic
Mobile Staff Quick Search
Mobile PT Member 360
```

### Future / UI Prepared

```text
Barcode scan
Image food recognition assist
Advanced analytics
Advanced notification center
Progress photo upload
Online payment gateway
Complex booking/calendar
```

### Nutrition scope rule

MVP calorie tracking means:

```text
Manual meal journal
Food search/custom food if time allows
Daily calorie summary
Basic macro summary
```

Do not implement AI image calorie estimation as MVP.  
If image assist is ever added later, it should only suggest food names/ingredients, not fully estimate calories.

---

## 8. Repo Structure

Use the following structure:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (admin)/
│   ├── (staff)/
│   ├── (pt)/
│   └── (member)/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── premium/
│   ├── mobile/
│   ├── data/
│   ├── forms/
│   └── feedback/
├── features/
├── lib/
├── hooks/
├── stores/
├── types/
├── mocks/
└── tests/
```

Do not flatten everything into `components/` or `pages/`.  
Do not create random folders without a clear purpose.

---

## 9. Routing Rules

### Auth

```text
/welcome
/login
```

### Admin

```text
/admin/dashboard
/admin/users
/admin/staff
/admin/members
/admin/members/[id]
/admin/trainers
/admin/packages
/admin/memberships
/admin/payments
/admin/assignments
/admin/audit-logs
/admin/audit-logs/[id]
/admin/notifications
```

### Staff

```text
/staff/dashboard
/staff/members
/staff/members/[id]
/staff/sell-package
/staff/renew-package
/staff/check-in
/staff/payments
```

### PT

```text
/pt/dashboard
/pt/members
/pt/members/[id]
/pt/members/[id]/workout
/pt/members/[id]/notes
/pt/members/[id]/progress
/pt/members/[id]/nutrition
```

### Member

```text
/member/dashboard
/member/membership
/member/check-in
/member/workout
/member/notes
/member/progress
/member/nutrition
/member/nutrition/meal-journal
/member/nutrition/food-search
/member/nutrition/summary
/member/profile
```

---

## 10. Permission Rules

Every protected route must check:

```text
authenticated?
role allowed?
resource permission?
```

Examples:

```text
Admin can access admin management areas.
Staff can access staff operations areas.
PT can only access assigned members.
Member can only access self-owned data.
```

Permission denial must show a clear UI state:

```text
You do not have access to this workspace.
```

Do not leak technical permission details.

---

## 11. Design Direction Rules

Follow the approved **GymMaster OS design system** in `docs/design/design-system/`.

### Design identity

```text
Premium fitness operations OS
Bento layout
Glass-like cards (backdrop-blur + layered borders + highlight overlays)
Large but controlled typography
Mist workspace surfaces with dark metric accents
Role-focused workspaces
Mobile-first member experience
Iron / Lime / Steel semantic color palette
Inter font family (primary) + optional Geist Mono for code
Restrained motion with tactile feedback
```

### Font rule

Primary font: **Inter** (loaded via `next/font`).  
Mono font: **Geist Mono** may be used for code, IDs, and technical metadata.  
Do not load fonts through external Google Fonts links in runtime code.

### Icon rule

Use **Lucide React** (per tech stack in Section 4).  
Translate Material Symbols shown in `docs/design/design-system/*/code.html` to Lucide equivalents.  
Do not import Material Symbols or mix Lucide with other icon libraries.  
Standardize stroke width. Keep icons consistent across all views.

### Color rule

Use the semantic gym palette from `src/app/globals.css`:

```text
Iron / Graphite base for text, rails, and dark metric surfaces.
Performance Lime primary for CTAs, focus rings, active navigation, and high-value actions.
Steel/Cyan info for check-in and assignment context.
Amber for pending/warning states.
Red for destructive/error/locked states.
Chalk/Mist neutrals for app background and cards.
```

Do not use Electric Blue, Indigo, Purple, or Emerald as the primary accent in new/migrated code.  
Prefer semantic tokens (`bg-primary`, `text-primary`, `ring-primary`, `StatusPill`) over hardcoded color utilities when possible.  
Do not use pure `#000000` for shadows.  
Status colors are managed centrally by `StatusPill`.

### Runtime copy rule

Final `docs/init/04_REQUIREMENTS.md` requires Vietnamese UI. New user-facing runtime copy should be Vietnamese unless a route is explicitly in a staged legacy migration. Existing English UI is a known partial-migration gap and should be converted through dedicated copy tasks rather than mixed ad hoc inside one workflow.

### Radii consistency

Use one radii scale across the entire app:

| Element | Radius |
|---|---|
| Glass shell / outer card | `rounded-[2rem]` |
| Inner card / section | `rounded-[1.5rem]` |
| Form input | `rounded-2xl` |
| Primary CTA / button | `rounded-full` |
| Pill / badge | `rounded-full` |
| Dialog | `rounded-[1.5rem]` |

### Interaction patterns

- All interactive elements must have hover state.
- Buttons get `active:scale-[0.98]` press feedback.
- Cards get hover lift (`-translate-y-0.5` + `shadow-lg`).
- Transitions use custom cubic-bezier, never `linear` or `ease-in-out`.
- Motion duration: 150–250ms (subtle). No distracting animations.

### Do not create

```text
Generic admin dashboard
Plain CRUD table-only pages
Neon gaming UI
Overly tactical console UI
Over-colorful student project UI
Sidebar-topbar classic admin layout
```

### Each screen must have

```text
clear hierarchy
one primary action area
visible status
role context
loading/error/empty state
responsive behavior
tactile feedback on interactive elements
```

### Premium visual patterns (from taste-skill)

- Glass surface: `backdrop-blur` + `border border-white/70` + `bg-white/75` + tinted shadow.
- Dark surface: `bg-zinc-950` + `border border-white/10` + `shadow-xl` + white text.
- Background: chalk/mist surface with subtle lime-tinted radial wash and soft linear gradient.
- Status: `StatusPill` with text + color (never color only).
- No hardcoded status colors per page.

---

## 12. Layout Patterns

Use the correct layout pattern for each screen.

### Command Center

Use for:

```text
Admin Dashboard
Staff Front Desk
PT Coach Hub
Member Home
```

Typical structure:

```text
WorkspaceShell
TopCommandBar
MetricHero
MetricCards
QuickActionDock
Trend/Chart
Activity/Insight
```

### Split Workspace

Use for:

```text
Member Management
Staff Management
PT Management
Package Management
Payments
Food Search
Member 360
```

Typical structure:

```text
Left Entity List
Center Detail Hero
Supporting Metrics
Timeline/Table
Right Action Console
```

### Wizard Workspace

Use for:

```text
Sell Package
Renew Package
Assign PT
Record Payment
```

Typical structure:

```text
Step Indicator
Selected Entity Hero
Summary Cards
Confirmation
Primary CTA
```

### Terminal Workspace

Use for:

```text
Check-in
QR validation
Fast member lookup
```

Typical structure:

```text
Large Input
Find/Scan
Result Hero
StatusPill
Confirm CTA
Edge State
```

### Board Workspace

Use for:

```text
Workout Plan Builder
Trainer Notes
Progress Planning
```

### Nutrition Workspace

Use for:

```text
Meal Journal
Food Search
Calorie Summary
Nutrition Review
```

---

## 13. Mobile UX Rules

Mobile is not a desktop shrink.

Mobile must use:

```text
MobileShell
Large title
Hero metric
Card list
Bottom tab
Bottom sheet
Sticky CTA
```

Mobile must not use:

```text
desktop tables
dense admin pages
tiny controls
hover-only interactions
```

Minimum mobile target sizes:

```text
tap target >= 44px
primary CTA height 50–56px
readable font >= 12px
```

Convert desktop tables to mobile card lists, timelines, accordions, or bottom sheets.

---

## 14. Component System Rules

Build and reuse these component families.

### Layout

```text
WorkspaceShell
CommandRail
TopCommandBar
BentoWorkspace
SplitWorkspaceLayout
WizardWorkspace
TerminalWorkspace
BoardWorkspaceLayout
NutritionWorkspace
MobileShell
```

### Premium surfaces

```text
GlassCard
BentoCard
MetricHeroCard
DarkMetricHero
MobileCard
ActionPanel
InsightRail
```

### Data

```text
StatusPill
RoleBadge
MetricRing
MiniBarChart
PremiumDataTable
TimelineList
EntityListPanel
DashboardMetricCard
```

### Actions

```text
QuickActionDock
PrimaryCTA
ActionConsole
CommandSearch
ConfirmActionDialog
```

### Forms

```text
AuthLayout
LoginForm
PremiumFormPanel
WizardSteps
FormSection
FieldError
SubmitBar
```

### Mobile

```text
MobileTabBar
MobileBottomSheet
MobileCardList
MobileMetricCard
MobileLargeTitle
MobileStickyCTA
```

Do not duplicate these components per page.

---

## 15. StatusPill Contract

Use one centralized `StatusPill` component.

```ts
type Status =
  | "active"
  | "paid"
  | "pending"
  | "expired"
  | "failed"
  | "checked-in"
  | "assigned"
  | "locked"
  | "cancelled";
```

Rules:

```text
Status must include text.
Do not rely on color only.
Do not hardcode status colors in each page.
```

---

## 16. RoleBadge Contract

Use one centralized `RoleBadge` component.

```ts
type UserRole = "admin" | "staff" | "pt" | "member";

type RoleBadgeProps = {
  role: UserRole;
};
```

Rules:

```text
RoleBadge only displays the current authenticated user's role.
RoleBadge must not display all roles.
RoleBadge must not become a role switcher.
```

---

## 17. State Management Rules

Use the correct tool for each state type.

| State type | Tool |
|---|---|
| API/server data | TanStack Query |
| Table state | TanStack Table |
| Form state | React Hook Form |
| Validation | Zod |
| Small global UI state | Zustand |
| URL filters | Search params |
| Mock API | MSW |
| Notifications/toasts | Sonner |

Do not use Zustand for server cache.  
Do not use TanStack Query for local UI toggles.

---

## 18. API Rules

Use a centralized API client.

Expected response shape can be normalized as:

```ts
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
};
```

Every mutation should handle:

```text
loading
success toast
error toast/message
query invalidation
form reset/close if successful
```

Do not hardcode business data directly in pages once API/mock endpoints exist.

---

## 19. Forms & Validation Rules

Use:

```text
React Hook Form
Zod
shadcn/ui Form
```

Forms that require schemas:

```text
LoginForm
SellPackageWizard
RenewPackageWizard
CheckInForm
AssignPTForm
WorkoutPlanForm
TrainerNoteForm
MealLogForm
CustomFoodForm
ProgressForm
PackageForm
StaffForm
TrainerForm
MemberForm
```

Form requirements:

```text
labels
validation messages
disabled submit while pending
server error display
success feedback
accessible fields
```

---

## 20. Required UI States

Every critical screen must define:

```text
loading
empty
error
success
permission denied
```

Auth must handle:

```text
idle
submitting
invalid credentials
network error
missing role from backend
session expired
redirecting
```

If backend does not return role:

```text
Show an error.
Do not show a role picker fallback.
```

---

## 21. Testing Rules

Testing is required for demo stability.

Use:

```text
Vitest
React Testing Library
Playwright
MSW
```

Required Playwright flows:

```text
Login → role redirect
Staff Search Member → Sell Package → Check-in
Admin Assign PT → Audit Log
PT Add Note / Workout Plan
Member Add Meal → Calorie Summary
Role permission denial
```

Component tests should cover:

```text
LoginForm
RoleBadge
StatusPill
PermissionGuard
SellPackageWizard
CheckInForm
TrainerNoteForm
MealLogForm
PremiumDataTable states
MobileBottomSheet
```

Do not test exact glass opacity, shadows, or pixel-perfect positions. Test user outcomes.

---

## 22. Accessibility Rules

All UI must follow these rules:

```text
Form inputs have labels.
Buttons have accessible names.
Status uses text, not color only.
Focus states are visible.
Keyboard navigation works for forms/dialogs.
Touch target >= 44px on mobile.
Error messages are readable and close to fields.
```

Use semantic HTML where possible.

---

## 23. Animation Rules

Use Framer Motion only for subtle premium polish.

Allowed:

```text
page/card entrance
bottom sheet animation
button press feedback
progress/ring animation
small stagger effects
```

Avoid:

```text
large distracting animations
slow transitions
animation blocking operations
motion-heavy admin screens
```

Respect reduced motion when practical.

---

## 24. Data Visualization Rules

Use Recharts for charts.

Charts should be:

```text
simple
readable
supportive of decisions
not decorative overload
```

Use charts for:

```text
revenue trend
check-in rhythm
calorie summary
progress trend
PT/member summary
```

Do not add complex analytics as MVP unless explicitly requested.

---

## 25. Context7 Rules

Use Context7 when generating or modifying code involving:

```text
Next.js
Tailwind CSS
shadcn/ui
React Hook Form
Zod
TanStack Query
TanStack Table
Playwright
Vitest
Recharts
Framer Motion
MSW
```

Context7 helps with external library correctness.  
It does not override GymMaster product/design rules.

When prompting an agent, include:

```text
use context7
```

if package API correctness matters.

---

## 26. OpenSpec & Understand-Anything Rules

Mỗi thay đổi hoặc tính năng lớn đều phải tuân thủ quy trình Spec-Driven Development (SDD) thông qua OpenSpec & Understand-Anything:

1. **Hiểu (Understand)**: Sử dụng các kỹ năng và câu lệnh `/understand-chat` hoặc `/understand-explain` để truy vấn kiến trúc, dependency và phân tích mã nguồn trước khi đưa ra đề xuất. Luôn ưu tiên cách này thay vì tự đọc thủ công hàng loạt file để tối ưu hóa lượng token tiêu thụ.
2. **Đề xuất (Propose)**: Tạo đề xuất thay đổi bằng lệnh `openspec create "tên-tính-năng"`. Việc này sẽ tạo ra cấu trúc:
   - `openspec/proposals/tên-tính-năng/proposal.md` (Đặc tả chi tiết UI/UX, API contracts, business rules)
   - `openspec/proposals/tên-tính-năng/tasks.md` (Danh sách checklist các file cần sửa/tạo)
3. **Phê duyệt (Approve)**: Điền đầy đủ thông tin giải pháp kỹ thuật vào `proposal.md`. Phải nhận được sự đồng ý từ User/Owner trước khi bắt đầu viết code.
4. **Thực thi (Apply)**: Agent triển khai code và liên tục cập nhật trạng thái các task trong `tasks.md` (sử dụng `- [/]` cho đang làm, `- [x]` cho đã hoàn thành).
5. **Lưu trữ (Archive)**: Khi code đã hoàn thành, vượt qua các bài kiểm thử tự động, chạy lệnh `openspec archive "tên-tính-năng"` để lưu trữ proposal vào thư mục tài liệu lịch sử, giữ cho codebase luôn gọn gàng.

Các sửa lỗi nhỏ (bug fixes) có thể bỏ qua bước tạo proposal đầy đủ, nhưng vẫn bắt buộc phải có một PR checklist rõ ràng.

---

## 27. Branch & Commit Rules

Branch naming:

```text
feat/fe-[module]-[short-name]
fix/fe-[module]-[bug]
docs/fe-[topic]
test/fe-[flow]
chore/fe-[task]
```

Examples:

```text
feat/fe-checkin-terminal
feat/fe-sell-package-wizard
feat/fe-meal-journal
test/fe-playwright-staff-flow
docs/fe-auth-rule-update
```

Commit style:

```text
feat(fe-auth): add role-aware login redirect
fix(fe-staff): handle expired membership check-in
docs(fe-design): update auth navigation rules
test(fe-e2e): add staff sell package flow
```

---

## 28. Pull Request Checklist

Every PR should satisfy:

```text
[ ] Follows GymMaster Full Premium App v8
[ ] Does not introduce generic admin UI
[ ] Does not add role picker
[ ] Header/nav only shows current role badge
[ ] Correct route and role guard
[ ] Uses reusable components
[ ] Uses Tailwind + shadcn/ui
[ ] Uses TanStack Query for API data
[ ] Uses React Hook Form + Zod for forms
[ ] Has loading/error/empty states
[ ] Mobile behavior handled
[ ] No desktop table on mobile
[ ] Typecheck passes
[ ] Lint passes
[ ] Tests pass
[ ] Playwright added for critical flow
[ ] Screenshot/video included for UI changes
[ ] Docs/spec updated if needed
```

---

## 29. Definition of Done

A frontend task is done only when:

```text
UI follows Full Premium App v8.
Auth/navigation rules are respected.
The route is protected correctly.
The feature works with mock/API data.
Loading/error/empty states exist.
Forms are validated.
Mobile behavior is handled.
Critical flows have tests.
No scope creep was introduced.
Code is reviewed and clean.
```

---

## 30. Common Mistakes to Avoid

Do not:

```text
Create login role selection.
Show all roles in header/nav.
Build pages as plain full-screen tables.
Use desktop tables on mobile.
Hardcode status colors per page.
Add new UI library.
Implement barcode/image AI as MVP.
Skip permission guard.
Skip error/empty states.
Mix too many one-off card styles.
Put all logic inside page components.
Ignore Figma/source-of-truth.
```

---

## 31. Agent Response Style

When working on tasks, agents should:

```text
State assumptions briefly.
Confirm scope priority if unclear.
Explain files changed.
Provide commands to run.
Mention tests added or missing.
Avoid long unrelated explanations.
```

If the task is ambiguous, ask before implementing.  
If the task could cause scope creep, warn and ask for confirmation.

---

## 32. Final Reminder

The frontend must prioritize:

```text
MVP core flow
stable demo
premium consistent UI
role-aware authentication
clean reusable components
testing for critical paths
```

Do not sacrifice demo stability for extra features.
