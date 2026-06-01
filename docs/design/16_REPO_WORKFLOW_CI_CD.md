# 16 — Repo Workflow & CI/CD

## 1. Branch naming

```text
feat/fe-[module]-[short-name]
fix/fe-[module]-[bug]
docs/fe-[topic]
test/fe-[flow]
chore/fe-[task]
```

Ví dụ:

```text
feat/fe-members-member-list
feat/fe-nutrition-meal-journal
test/fe-playwright-auth-flow
docs/fe-design-system
```

## 2. Commit convention

```text
feat(fe-members): add member list page
fix(fe-auth): handle expired session
docs(fe-ui): update color tokens
test(fe-e2e): add staff sell package flow
```

## 3. PR checklist

- [ ] UI đúng design system.
- [ ] Không duplicate component.
- [ ] Có loading/error/empty state.
- [ ] Form có validation nếu có input.
- [ ] Role permission được xử lý.
- [ ] Không hardcode API data nếu API đã có.
- [ ] Typecheck pass.
- [ ] Lint pass.
- [ ] Test liên quan pass.
- [ ] Có screenshot/video demo.
- [ ] Có update docs nếu đổi flow/component rule.

## 4. GitHub Actions quality gate đề xuất

```yaml
name: Frontend Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --run
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## 5. Repo workflow với Spec Kit

```text
spec
→ plan
→ tasks
→ branch
→ implement
→ test
→ PR
→ review
→ merge
```

Không implement feature lớn nếu chưa có spec/task rõ.
