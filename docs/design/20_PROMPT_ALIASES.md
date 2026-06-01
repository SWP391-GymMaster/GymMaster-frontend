# 20 — Prompt Aliases

Các alias dưới đây là shorthand để team nhập prompt nhanh và đồng bộ.

---

## `/ctx-fe`

Dùng để yêu cầu AI đọc context frontend trước khi làm.

```text
/ctx-fe
Bạn đang hỗ trợ frontend GymMaster.
Hãy đọc và tuân theo:
- FE tech stack
- FE architecture
- design system
- route map
- component guidelines
- testing strategy
Sau đó tóm tắt lại context liên quan đến task sau:
[TASK]
Không code ngay nếu thiếu context.
```

## `/c7`

Dùng khi cần docs mới nhất.

```text
/c7
Task: [TASK]
Package/API liên quan: [PACKAGE]
Hãy dùng documentation mới nhất và API đúng phiên bản hiện tại.
use context7
```

## `/fe-spec`

```text
/fe-spec
Tạo feature spec frontend cho:
Feature: [FEATURE]
Role: [Admin/Staff/PT/Member]
Route: [ROUTE]
Bao gồm scope, UI states, form validation, API contract, acceptance criteria, Playwright coverage.
Không thêm feature ngoài scope.
```

## `/fe-plan`

```text
/fe-plan
Từ spec sau, tạo implementation plan frontend.
Yêu cầu gồm components, files, data fetching, state, validation, testing, risks.
Spec:
[PASTE SPEC]
```

## `/fe-tasks`

```text
/fe-tasks
Từ plan sau, tạo task list dependency-ordered cho frontend.
Đánh dấu task có thể làm song song.
Plan:
[PASTE PLAN]
```

## `/ui-review`

```text
/ui-review
Review UI/UX sau theo GymMaster design system.
Kiểm tra hierarchy, spacing, status, form UX, empty/loading/error state, accessibility.
Input:
[SCREENSHOT/DESCRIPTION/CODE]
```

## `/component`

```text
/component
Tạo React component cho GymMaster.
Stack: Next.js + TS + Tailwind + shadcn/ui.
Component: [NAME]
Props: [PROPS]
States: loading/error/empty/success nếu cần.
Không thêm library mới.
use context7
```

## `/form`

```text
/form
Tạo form bằng React Hook Form + Zod + shadcn/ui.
Form: [FORM NAME]
Fields: [FIELDS]
Validation: [RULES]
Submit behavior: [BEHAVIOR]
use context7
```

## `/table`

```text
/table
Tạo DataTable bằng TanStack Table + shadcn/ui.
Entity: [ENTITY]
Columns: [COLUMNS]
Filters: [FILTERS]
Row actions: [ACTIONS]
Loading/empty/error state required.
use context7
```

## `/query`

```text
/query
Tạo TanStack Query hooks cho feature:
Entity: [ENTITY]
Endpoints: [ENDPOINTS]
Mutations: [CREATE/UPDATE/DELETE]
Query key convention required.
use context7
```

## `/e2e`

```text
/e2e
Tạo Playwright E2E test cho GymMaster.
Flow: [FLOW]
Role: [ROLE]
Test data: [DATA]
Yêu cầu dùng data-testid convention.
use context7
```

## `/fix`

```text
/fix
Tôi gặp lỗi frontend sau:
Error: [ERROR]
Context: [FILES/CODE]
Hãy phân tích nguyên nhân, đưa ra hướng kiểm tra và patch tối thiểu.
Không refactor lớn nếu không cần.
use context7 nếu liên quan package API.
```

## `/pr-review`

```text
/pr-review
Review PR frontend sau theo checklist:
- design system
- role permission
- API state
- validation
- loading/error/empty
- tests
- no extra scope
Diff/code:
[PASTE]
```

## `/adr`

```text
/adr
Viết ADR ngắn cho decision frontend:
Decision: [DECISION]
Options: [OPTIONS]
Context: [CONTEXT]
Recommendation: [RECOMMENDATION]
```
