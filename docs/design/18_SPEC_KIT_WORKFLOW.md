# 18 — GitHub Spec Kit Workflow

## 1. Mục tiêu

GitHub Spec Kit được dùng để áp dụng spec-driven development cho frontend:

```text
Spec → Plan → Tasks → Implement
```

Với GymMaster, Spec Kit giúp tránh AI code theo cảm tính.

## 2. Khi nào dùng Spec Kit

Dùng cho feature lớn:

- Member Management UI
- Sell/Renew Package
- Check-in Flow
- PT Assignment
- Workout Plan
- Meal Journal
- Dashboard
- Audit Log

Không cần dùng cho bug nhỏ hoặc copy change.

## 3. Folder đề xuất

```text
specs/
├── fe-member-management/
│   ├── spec.md
│   ├── plan.md
│   ├── tasks.md
│   └── contracts.md
├── fe-check-in/
├── fe-pt-assignment/
└── fe-meal-journal/
```

## 4. Spec template

```markdown
# Feature Spec: [Feature Name]

## User story
As a [role], I want [goal], so that [benefit].

## Scope
- Included:
- Excluded:

## Routes
- ...

## UI states
- loading
- empty
- error
- success

## Form validation
- ...

## API contract
- ...

## Acceptance criteria
- ...

## Playwright coverage
- ...
```

## 5. Plan template

```markdown
# Implementation Plan

## Components
- ...

## Files to create/update
- ...

## Data fetching
- ...

## State management
- ...

## Testing
- ...

## Risks
- ...
```

## 6. Tasks template

```markdown
# Tasks

- [ ] Create route
- [ ] Create API hook
- [ ] Create form schema
- [ ] Create component
- [ ] Add loading/error/empty state
- [ ] Add component test
- [ ] Add Playwright critical flow
- [ ] Update docs
```

## 7. Rule

Không bắt AI implement trước khi có ít nhất:

```text
spec.md
plan.md
tasks.md
```
