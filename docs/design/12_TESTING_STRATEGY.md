# 12 — Frontend Testing Strategy

> Repo-local status: Frontend target testing guide. Current repo has `typecheck` and `lint` only; Vitest, React Testing Library, MSW, Playwright, and Storybook evidence are planned until installed/configured.

## 1. Mục tiêu

Testing của frontend nhằm đảm bảo demo và core flow ổn định cao nhất có thể.

Không đặt mục tiêu test mọi pixel hoặc mọi component. Ưu tiên:

```text
Auth
Role-based navigation
Forms quan trọng
Critical demo flow
Permission rules
Dashboard render
```

## 2. Testing stack

| Layer | Tool |
|---|---|
| Type check | TypeScript |
| Lint | ESLint |
| Component test | Vitest + React Testing Library |
| API mock | MSW |
| E2E | Playwright |
| Accessibility optional | @axe-core/playwright |

## 3. Test pyramid thực tế cho SWP

```text
Many static checks
Some component tests
Few but important E2E tests
Manual UAT for demo polish
```

## 4. What to test

### Component tests

- `StatusBadge`
- `RoleBadge`
- `PermissionGuard`
- `RoleBasedNavigation`
- `MemberForm`
- `PackageForm`
- `MealLogForm`
- `DataTable` states
- `Dashboard StatCard`

### E2E tests

- login + role redirect
- staff sell package
- member check-in
- admin assign PT
- PT add note/workout
- member add meal log
- admin dashboard/audit

## 5. What not to test

- icon render đơn giản
- hover color
- every shadcn primitive
- pixel-perfect layout
- animation chi tiết

## 6. Scripts đề xuất

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "quality": "npm run typecheck && npm run lint && npm run test && npm run test:e2e"
  }
}
```

## 7. Stability gate

Trước khi demo:

```text
typecheck pass
lint pass
component tests pass
Playwright critical flow pass
manual UAT pass
```
