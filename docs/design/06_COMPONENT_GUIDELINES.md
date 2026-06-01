# 06 — Component Guidelines

## 1. Component hierarchy

| Layer | Ví dụ |
|---|---|
| UI primitive | `Button`, `Input`, `Dialog`, `Card` |
| Shared component | `StatusBadge`, `PageHeader`, `EmptyState` |
| Feature component | `MemberForm`, `SellPackageForm`, `MealLogForm` |
| Page component | `MemberListPage`, `AdminDashboardPage` |

## 2. Shared components bắt buộc

```text
PageHeader
AppSidebar
Topbar
RoleBasedNav
StatusBadge
RoleBadge
StatCard
DataTable
SearchFilter
Pagination
ConfirmDialog
EmptyState
LoadingState
ErrorState
PermissionDenied
FormSection
DetailCard
```

## 3. Button rules

| Variant | Dùng cho |
|---|---|
| Primary | Create, Save, Confirm, Sell Package |
| Secondary | Cancel, Back |
| Outline | Filter, View, Export |
| Ghost | Icon action |
| Destructive | Delete, Lock, Cancel membership |

Rule:

```text
Mỗi form chỉ có 1 primary action.
Action destructive phải có AlertDialog confirm.
```

## 4. StatusBadge contract

`StatusBadge` phải nhận status string và tự quyết định màu/text.

Ví dụ:

```tsx
<StatusBadge status="active" />
<StatusBadge status="expired" />
<StatusBadge status="pending" />
<StatusBadge status="paid" />
```

Không hardcode màu status trong page.

## 5. Dialog rules

Dùng dialog cho:

- confirm action
- form ngắn
- assign PT
- add trainer note
- add custom food

Không dùng dialog cho form dài như full member profile.

## 6. Toast rules

Dùng Sonner cho:

- create/update success
- delete/lock success
- API error
- check-in success
- sell package success
- form submit failed

Toast không thay thế validation message trong form.
