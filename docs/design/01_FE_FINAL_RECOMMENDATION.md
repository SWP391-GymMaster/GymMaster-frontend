# 01 — Frontend Final Recommendation

## 1. Kết luận cuối cùng

Frontend của GymMaster nên triển khai theo hướng:

```text
Next.js + TypeScript
+ Tailwind CSS + shadcn/ui
+ React Hook Form + Zod
+ TanStack Query + TanStack Table
+ Recharts
+ Playwright + Vitest
+ Context7 + GitHub Spec Kit
```

Mục tiêu không chỉ là làm UI đẹp, mà là tạo một **frontend system ổn định, đồng bộ, có thể test được và dễ làm việc với AI**.

---

## 2. Nguyên tắc triển khai

### 2.1 Ưu tiên demo flow

Không bắt đầu bằng CRUD riêng lẻ. Bắt đầu bằng core demo flow:

```text
Auth
→ Member operation
→ Membership/payment
→ Check-in
→ PT assignment
→ Workout/note
→ Meal journal
→ Dashboard/audit
```

### 2.2 Component-first nhưng không over-engineering

Component dùng lại nhiều:

- `StatusBadge`
- `RoleBadge`
- `DataTable`
- `PageHeader`
- `FormSection`
- `StatCard`
- `ConfirmDialog`
- `EmptyState`
- `PermissionGuard`

Không tạo component abstraction quá sớm nếu chỉ dùng 1 lần.

### 2.3 Mock trước, API sau

Trong khi backend chưa xong:

```text
UI + mock data
→ API contract
→ integrate real API
→ Playwright flow test
```

Không để backend chậm làm frontend đứng yên.

### 2.4 Test để bảo vệ demo

Testing không nhằm đạt coverage cao, mà nhằm đảm bảo flow quan trọng không vỡ:

- Typecheck
- Lint
- Component test
- Playwright E2E
- Manual UAT

### 2.5 AI-assisted nhưng spec-controlled

AI chỉ được code theo:

- docs
- feature spec
- route map
- design system
- API contract
- prompt alias rõ ràng

Không cho AI tự thêm library, tự đổi design, tự thêm feature ngoài scope.

---

## 3. Đề xuất mức ưu tiên

| Mức | Nội dung |
|---|---|
| Must-have | Layout, auth UI, role navigation, core CRUD, check-in, assignment, workout, meal journal, dashboard, testing gates |
| Should-have | Table filter nâng cao, chart polish, responsive tablet, Playwright full demo flow |
| Could-have | Barcode UI, notification UI, motion polish |
| Future | Image Food Recognition Assist UI, advanced dashboard, booking calendar |
