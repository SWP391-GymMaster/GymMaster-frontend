# 09 — Forms & Validation Guidelines

## 1. Stack

```text
React Hook Form
+ Zod
+ @hookform/resolvers
+ shadcn/ui Form
```

## 2. Form file structure

Ví dụ:

```text
features/members/
├── schemas/member.schema.ts
├── components/member-form.tsx
├── types/member.type.ts
└── api/members.api.ts
```

## 3. Form rules

| Rule | Mô tả |
|---|---|
| Schema-first | Mọi form có input quan trọng phải có Zod schema |
| Error near field | Lỗi hiển thị ngay dưới field |
| Submit disabled | Disable submit khi pending |
| Toast on success | Thành công dùng toast |
| Inline validation | Validation field hiển thị trong form |
| Confirm destructive | Lock/delete/cancel phải confirm |
| No silent failure | API fail phải có thông báo |

## 4. Các form core

| Form | Priority |
|---|---|
| LoginForm | P0 |
| MemberForm | P0 |
| StaffForm | P1 |
| TrainerForm | P1 |
| PackageForm | P0 |
| SellPackageForm | P0 |
| RenewPackageForm | P0 |
| CheckInForm | P0 |
| AssignPTForm | P0 |
| WorkoutPlanForm | P0 |
| TrainerNoteForm | P0 |
| ProgressForm | P1 |
| MealLogForm | P0 |
| CustomFoodForm | P0 |

## 5. Validation examples

```text
Phone: required, valid format
Email: valid email
Package price: >= 0
Duration days: > 0
Meal quantity: > 0
Calories target: > 0
Workout title: required
Trainer note: required
```
