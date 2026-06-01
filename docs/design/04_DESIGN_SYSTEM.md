# 04 — Design System

> Status: **Current** — Taste-skill audit 2026-06-01. Aligned to GymMaster Full Premium App v8.

## 1. Design direction

GymMaster follows **GymMaster Full Premium App v8**:

```text
Apple-inspired premium fitness operations product
+ Bento layout
+ Glass-like surfaces (backdrop-blur, layered borders, highlight overlays)
+ Large typography (display up to 5xl–7xl)
+ Dark metric hero
+ Role-focused workspaces
+ Emerald single accent
+ Restrained motion
```

Không thiết kế như landing page. Đây là hệ thống quản lý, nên ưu tiên:

- tốc độ thao tác
- dữ liệu rõ
- form dễ dùng
- status dễ nhìn (StatusPill dùng text + color, không chỉ color)
- role navigation rõ
- ít animation gây nhiễu
- button/interactive có tactile feedback (hover state, active scale)
- layout nhất quán về radii, spacing, accent color trên toàn app

---

## 2. UI principles

| Principle | Mô tả |
|---|---|
| Clarity first | Mỗi màn hình phải nói rõ người dùng đang làm gì |
| One primary action | Mỗi form/màn chính chỉ có một primary action nổi bật |
| Status visible | Membership/payment/check-in status phải dễ nhìn |
| Shape consistency | Một hệ thống radii duy nhất cho toàn app |
| Color consistency | Một accent color duy nhất (Emerald). Không trộn accent. |
| Role-aware | Menu và content theo đúng role |
| Fast operation | Staff thao tác nhanh tại quầy |
| Safe action | Action nguy hiểm phải confirm |
| Demo-ready | Luồng demo chính phải ít click và ổn định |
| Tactile feedback | Button hover/active state (scale, color shift). Card hover lift. |

---

## 3. Visual style

| Thuộc tính | Rule |
|---|---|
| Background | Radial gradient từ Slate-50/White với emerald wash |
| Surface | Glass card (backdrop-blur, border trắng/bối cảnh) |
| Border | Slate-200 cho surface nhẹ, white/10 cho dark |
| Radius | `rounded-[2rem]` (glass shell), `rounded-[1.5rem]` (card), `rounded-2xl` (input), `rounded-full` (button/pill) |
| Shadow | Tinted shadow dùng `rgba(15,23,42,0.08)` cho light, không pure black |
| Spacing | 4px scale, page gap 24px, section gap `py-24` |
| Icon | Lucide, stroke style (xem AGENTS.md) |
| Motion | 150–250ms, subtle, custom cubic-bezier (không `linear`/`ease-in-out`) |
| Glass surface | `backdrop-blur` + `border border-white/70` + `bg-white/75` + highlight |
| Dark surface | `bg-zinc-950` với `border border-white/10` và `shadow-xl` |

### Radii consistency

```text
Glass shell/outer card:  rounded-[2rem]
Inner card/section:       rounded-[1.5rem]
Form input:               rounded-2xl
Button/primary CTA:       rounded-full
Pill/badge:               rounded-full
Dialog/modal:             rounded-[1.5rem]
```

Giữ radii nhất quán trên toàn app. Không trộn `rounded-xl` ở page này với `rounded-3xl` ở page khác.

### Premium glass card architecture

```text
Outer shell (glass):
  border border-white/70
  bg-white/75 hoặc bg-white/85
  backdrop-blur
  shadow mềm tinted (rgba(15,23,42,0.08))

Inner content (card):
  nền riêng (bg-white hoặc bg-zinc-950)
  radius nhỏ hơn shell (rounded-[1.5rem])
```

---

## 4. Layout pattern — App shell

Dùng một app shell chung (WorkspaceShell):

```text
Full-bleed gradient background (emerald wash radial gradient)
Center-constrained wrapper (max-w-6xl, mx-auto)
Glass card header (rounded-[2rem], backdrop-blur)
  → Brand tag + RoleBadge
  → Page title + description
  → Logout
Dark metric section (bg-zinc-950, rounded-[1.5rem])
Bento workspace grid (lg:grid-cols-[1.3fr_0.7fr] hoặc các tỉ lệ khác)
Bottom section/content
```

Không dùng sidebar-topbar layout cổ điển. Layout hiện tại là center-constrained với glass header.

Role chỉ khác:

- menu / command rail
- dashboard cards / quick actions
- permissions / visible actions

---

## 5. Do / Don't

### Do

- Dùng `StatusPill` chung.
- Dùng `RoleBadge` chung.
- Dùng `PageHeader` (hiện tại là WorkspaceShell) cho tất cả page.
- Dùng `DataTable` pattern chung.
- Dùng form validation rõ ràng (React Hook Form + Zod).
- Có loading/error/empty state.
- Button/interactive có hover + active state.
- Dùng glass card pattern nhất quán.

### Don't

- Không hardcode màu status ở từng màn.
- Không dùng quá nhiều animation.
- Không để nhiều primary button trong cùng form.
- Không trộn MUI/AntD với shadcn.
- Không tạo component duplicate nếu đã có shared component.
- Không dùng Inter làm font chính (dùng Geist).
- Không dùng pure `#000000` shadow.
- Không dùng `linear` hoặc `ease-in-out` cho transition.
