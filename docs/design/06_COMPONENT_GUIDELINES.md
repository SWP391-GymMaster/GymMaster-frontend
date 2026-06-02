# 06 — Component Guidelines

> Status: **Current** — Taste-skill audit 2026-06-01. Added interaction patterns, shape consistency, and glass card rules.

## 1. Component hierarchy

| Layer | Ví dụ |
|---|---|
| UI primitive | `Button`, `Input`, `Dialog`, `Card` (shadcn/ui) |
| Shared component | `StatusPill`, `RoleBadge`, `WorkspaceShell`, `EmptyState`, `PermissionGuard` |
| Feature component | `SellPackageWizard`, `RenewPackageWizard`, `CheckInForm`, `MealLogForm` |
| Page component | `StaffDashboardPage`, `AdminDashboardPage` |

## 2. Shared components bắt buộc

```
WorkspaceShell
RoleBadge
StatusPill
PermissionGuard
Button (shadcn/ui)
EmptyState
LoadingState
ErrorState
PermissionDenied
```

## 3. Button rules

| Variant | Dùng cho |
|---|---|
| Primary (bg-zinc-950) | Create, Save, Confirm, Sign in, Continue |
| Secondary / Outline | Cancel, Back, Filter, View |
| Ghost | Icon action |
| Destructive | Delete, Lock, Cancel membership |

### Button interaction patterns (từ taste-skill / high-end-visual-design)

- **Hover**: color shift or background change (không chỉ color change, có thể `translate-y` nhẹ).
- **Active/press**: `scale-[0.98]` hoặc `active:scale-[0.98]` để simulate physical push.
- **Primary CTA**: `rounded-full`, min-height 44px (desktop), padding `px-7 py-3.5`.
- **Form submit button**: `rounded-2xl`, full-width trên mobile, min-height 48px.
- **Link-style CTA**: `rounded-full`, `border-zinc-200`, `bg-white/70`, `backdrop-blur`.
- **Button text**: Không wrap xuống 2 dòng trên desktop.
- **Button contrast**: WCAG AA tối thiểu (4.5:1). Không white-on-white.

## 4. Card architecture

### Glass card (WorkspaceShell, login card)

```tsx
// Outer glass shell
<div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
  // Content
</div>
```

### Dark metric card

```tsx
<div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl">
  // Dark content
</div>
```

### Light action card

```tsx
<div className="rounded-[1.25rem] border border-white/70 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
  // Action content
</div>
```

## 5. StatusPill contract

`StatusPill` nhận status string và tự quyết định màu/text. Shared component duy nhất cho tất cả status badges.

```tsx
<StatusPill status="active" />
<StatusPill status="checked-in" />
<StatusPill status="pending" />
```

Rules:
- Status phải có text, không chỉ color.
- StatusPill dùng `rounded-full`, `border`, text size `sm`, `font-medium`.
- Màu sắc theo mapping ở docs/design/05.

## 6. RoleBadge contract

```tsx
<RoleBadge role="admin|staff|pt|member" />
```

Rules:
- Chỉ display current user role.
- Không show tất cả roles.
- Không phải role switcher.
- Style: `rounded-full`, use semantic primary/status tokens rather than hardcoded role-color utilities.

## 7. Form patterns

- Dùng React Hook Form + Zod.
- Label ở trên input (không floating label).
- Error message dưới input, text-size `sm`, color `text-red-700`.
- Input `rounded-2xl`, `min-h-12`, `border-zinc-200`.
- Input icon bên trái (Lucide icon, absolute positioning).
- Focus ring: use semantic primary ring, e.g. `focus:border-primary focus:ring-4 focus:ring-primary/15`.
- Submit button `min-h-12 w-full rounded-2xl`.
- Disabled state khi submitting (`disabled={isSubmitting}`).

## 8. Dialog rules

Dùng shadcn/ui Dialog cho:

- confirm action
- form ngắn
- assign PT
- add trainer note
- add custom food

Không dùng dialog cho form dài như full member profile.

## 9. Toast rules

Dùng Sonner cho:

- create/update success
- delete/lock success
- API error
- check-in success
- sell package success
- form submit failed

Toast không thay thế validation message trong form.

## 10. Shape consistency lock

Toàn app dùng MỘT hệ thống radii:

| Element | Radius |
|---|---|
| Glass shell / outer card | `rounded-[2rem]` |
| Inner card / section | `rounded-[1.5rem]` |
| Action card / compact card | `rounded-[1.25rem]` |
| Form input | `rounded-2xl` |
| Primary CTA / button | `rounded-full` |
| Pill / badge | `rounded-full` |
| Dialog | `rounded-[1.5rem]` |

Không trộn `rounded-xl` ở page này với `rounded-3xl` ở page khác.

## 11. Premium surface patterns

### Glass surface premium

```css
/* Outer glass container */
backdrop-blur
border border-white/70
bg-white/75 or bg-white/85
shadow-[0_24px_80px_rgba(15,23,42,0.08)]
rounded-[2rem]
```

### Dark hero surface premium

```css
/* Dark metric card */
bg-zinc-950
border border-zinc-200
shadow-xl
rounded-[1.5rem]
text-white
```

### Gradient backgrounds

```css
/* Workspace background */
background: radial-gradient(circle at top left, rgba(16,185,129,0.14), transparent 32%),
            linear-gradient(135deg, #f8fafc, #ffffff 48%, #eef2ff);

/* Login background */
background: linear-gradient(135deg, #f8fafc, #ffffff 45%, #ecfdf5);

/* Welcome background */
background: radial-gradient(circle at 18% 12%, rgba(16,185,129,0.22), transparent 28%),
            linear-gradient(135deg, #fafafa, #eef2ff 48%, #f0fdf4);
```

## 12. Mobile rules

- Tap target tối thiểu 44px.
- Form inputs full-width trên mobile.
- Multi-column grid collapse về `grid-cols-1` dưới 768px.
- Không dùng desktop table trên mobile (card list hoặc bottom sheet thay thế).
- Glass card padding: `p-5` (mobile), `p-8 md:p-8` (desktop).
