# 05 — Color, Typography & Tokens

> Status: **Current** — Taste-skill audit 2026-06-01. Font changed from Inter to Geist. Typography scale enlarged. Palette aligned to actual implementation.

## 1. Color palette

| Token | Hex (OKLCH) | Dùng cho |
|---|---|---|
| Primary | `oklch(0.205 0 0)` / `#18181B` | Button chính, text chính, active nav |
| Primary Hover | `oklch(0.145 0 0)` / `#09090B` | Hover primary |
| Accent / Emerald | `#10B981` / `oklch(0.645 0.18 158)` | Fitness/check-in/success/active status |
| Accent Hover | `#059669` | Hover emerald elements |
| Info | `#0EA5E9` | Check-in/info |
| Warning | `#F59E0B` | Pending/sắp hết hạn |
| Danger | `#E11D48` | Error/expired/failed |
| Neutral 900 / Zinc-950 | `#09090B` | Text chính |
| Neutral 600 | `#52525B` | Text phụ |
| Neutral 500 | `#71717A` | Muted text |
| Border light | `#E4E4E7` | Border/input (light mode) |
| Border dark | `rgb(255 255 255 / 0.1)` | Border (dark mode) |
| Background light | `radial-gradient(...)` | App background với emerald wash |
| Surface glass | `bg-white/85` + `backdrop-blur` | Glass card |
| Surface dark | `#09090B` | Dark metric hero / dark card |

### Accent consistency

**Một accent duy nhất: Emerald (`#10B981`)**. Dùng cho:

- Check-in success
- Active/paid status pill
- Trạng thái "hoạt động" badges
- Focus ring (`focus:border-emerald-500 focus:ring-emerald-500/15`)
- Brand text (GymMaster uppercase tag)
- Icon backgrounds (emerald-500/10)

Không dùng Indigo, Sky, hoặc accent khác cho mục đích tương tự.

## 2. Status colors

| Status | Color |
|---|---|
| `active` | Emerald |
| `paid` | Emerald |
| `pending` | Amber |
| `expired` | Zinc (muted) |
| `cancelled` | Zinc (muted) |
| `locked` | Red |
| `assigned` | Indigo |
| `checked-in` | Sky |
| `failed` | Red |

## 3. shadcn CSS variables (globals.css — OKLCH)

Xem `src/app/globals.css`. Hiện tại đang dùng OKLCH color space với monochrome neutral palette:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --radius: 0.625rem;
  ...
}
```

## 4. Typography — Geist (primary), Geist Mono (code)

### Font stack

| Purpose | Font | Variable |
|---|---|---|
| Primary sans | **Geist** (via `next/font`) | `--font-sans` |
| Mono/code | **Geist Mono** (via `next/font`) | `--font-mono` |

Geist is the primary font. Inter is NOT used as the default display/body font.

### Font scale

| Token | Size | Line height | Weight | Dùng cho |
|---|---:|---:|---:|---|
| Display | 64px–80px (7xl) | 1.02 | 600 | Welcome hero H1 |
| H0 | 48px (5xl) | 1.05 | 600 | Workspace title |
| H1 | 36px (4xl) | 1.15 | 600 | Page title |
| H2 | 30px (3xl) | 1.25 | 600 | Section title |
| H3 | 24px (2xl) | 1.3 | 600 | Card title |
| Body | 16px (base) | 1.75 (leading-7) | 400 | Nội dung chính |
| Small | 14px (sm) | 1.5 | 400 | Badge/helper text |
| Label | 14px (sm) | 1.25 | 500 | Form label |
| Meta | 12px (xs) | 1.5 | 500 | Uppercase tracking tag |

### Typography rules (từ taste-skill)

- Display text dùng `tracking-tighter` + `leading-none` hoặc `leading-[1.02]`.
- Body text tối đa `max-w-[65ch]`.
- Button text không wrap xuống 2 dòng trên desktop.
- Không dùng `Inter` làm display font.
- Label/tag uppercase dùng `tracking-[0.18em]` hoặc `tracking-[0.22em]`.

## 5. Spacing

| Token | Tailwind |
|---|---|
| Page padding desktop | `px-8 py-6` |
| Page padding mobile | `px-5 py-6` |
| Section gap | `gap-4` tới `gap-6` |
| Glass card padding | `p-5` tới `p-8` |
| Form spacing | `space-y-5` |
| Section vertical rhythm | `py-24` to `py-40` (macro spacing) |

## 6. Shadows

| Token | Value |
|---|---|
| Glass card shadow | `shadow-[0_24px_80px_rgba(15,23,42,0.08)]` |
| Dark card shadow | `shadow-xl` (tinted) |
| CTA button shadow | `shadow-xl shadow-zinc-950/15` |
| Card hover | `shadow-lg` với `-translate-y-0.5` |
