# 03 — Frontend Architecture

## 1. Folder structure đề xuất

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── staff/
│   │   ├── pt/
│   │   └── member/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── shared/
│   ├── tables/
│   └── charts/
├── features/
│   ├── auth/
│   ├── users/
│   ├── staff/
│   ├── members/
│   ├── trainers/
│   ├── packages/
│   ├── memberships/
│   ├── payments/
│   ├── checkins/
│   ├── assignments/
│   ├── workouts/
│   ├── progress/
│   ├── nutrition/
│   ├── dashboard/
│   └── audit/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── constants/
│   ├── query/
│   ├── validators/
│   └── utils/
├── hooks/
├── stores/
├── types/
├── mocks/
└── tests/
```

---

## 2. Rule tổ chức code

| Rule | Nội dung |
|---|---|
| Feature-first | Code nghiệp vụ đặt trong `features/[module]` |
| Shared component | Component dùng nhiều module đặt trong `components/shared` |
| shadcn component | Component base của shadcn đặt trong `components/ui` |
| API wrapper | Đặt trong `lib/api` hoặc `features/*/api` |
| Types | Type dùng riêng đặt trong feature; type dùng chung đặt trong `types` |
| Schema | Zod schema đặt trong `features/*/schemas` |
| Hooks | Hook dùng riêng trong feature; hook dùng chung trong `hooks` |
| Store | Zustand store đặt trong `stores` |

---

## 3. Cấu trúc một feature

Ví dụ `features/members`:

```text
features/members/
├── api/
│   └── members.api.ts
├── components/
│   ├── member-form.tsx
│   ├── member-table.tsx
│   └── member-status-card.tsx
├── hooks/
│   ├── use-members.ts
│   └── use-member-detail.ts
├── schemas/
│   └── member.schema.ts
├── types/
│   └── member.type.ts
└── utils/
    └── member.mapper.ts
```

## 4. Naming convention

| Loại | Convention | Ví dụ |
|---|---|---|
| Component | PascalCase | `MemberForm.tsx` |
| Hook | camelCase, prefix `use` | `useMembers.ts` |
| Type | PascalCase | `MemberProfile` |
| Schema | camelCase + `Schema` | `memberSchema` |
| API file | kebab/camel module | `members.api.ts` |
| Query key | array key | `['members', filters]` |

## 5. App provider

`src/app/providers.tsx` nên chứa:

- TanStack Query provider
- Theme provider nếu có
- Sonner toaster
- Auth provider nếu cần
- Zustand không cần provider
