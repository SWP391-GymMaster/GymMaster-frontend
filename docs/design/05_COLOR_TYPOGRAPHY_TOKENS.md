# 05 — Color, Typography & Tokens

> Status: **Current** — updated 2026-06-02 after final `docs/init` approval. Runtime tokens now use a gym-oriented semantic palette in `src/app/globals.css`.

## 1. Semantic Color Palette

GymMaster should feel like a premium fitness operations product: strong enough for a gym floor, restrained enough for staff/admin workflows.

| Semantic token | Value | Use |
|---|---|---|
| Iron / Graphite | `--gym-iron` / `oklch(0.16 0.015 145)` | Primary text, dark rails, dark metric surfaces |
| Performance Lime | `--gym-lime` / `oklch(0.66 0.19 142)` | Primary CTAs, focus rings, active nav, high-value actions |
| Steel / Cyan | `--gym-steel` / `oklch(0.58 0.095 210)` | Info, check-in context, assignment context, secondary charts |
| Chalk | `--gym-chalk` / `oklch(0.99 0.004 120)` | Light surfaces and page background |
| Mat / Mist | `--gym-mat` / `oklch(0.95 0.018 150)` | Muted panels, inset areas, disabled/secondary backgrounds |
| Amber | `oklch(0.72 0.14 80)` | Pending, warning, renewal attention |
| Red | `oklch(0.58 0.22 28)` | Error, failed, locked, destructive |

### Accent Consistency

Primary accent is **Performance Lime**, exposed through semantic tokens:

```text
bg-primary
text-primary
ring-primary
border-primary
StatusPill
```

Do not use Electric Blue, Indigo, Purple, or Emerald as the primary accent in new or migrated code. Existing hardcoded blue/emerald classes are a migration gap and should be converted route-by-route.

## 2. Status Colors

Status color must be centralized through `StatusPill`. The component reads CSS variables from `src/app/globals.css`.

| Status | Semantic color |
|---|---|
| `active` | Performance Lime |
| `paid` | Performance Lime |
| `checked-in` | Steel / Cyan |
| `assigned` | Steel / Cyan |
| `pending` | Amber |
| `expired` | Muted Iron |
| `cancelled` | Muted Iron |
| `locked` | Red |
| `failed` | Red |

Status must include readable text. Do not rely on color alone.

## 3. shadcn CSS Variables

`src/app/globals.css` is the runtime source for semantic color tokens:

```css
:root {
  --gym-iron: oklch(0.16 0.015 145);
  --gym-lime: oklch(0.66 0.19 142);
  --gym-steel: oklch(0.58 0.095 210);
  --gym-mat: oklch(0.95 0.018 150);
  --gym-chalk: oklch(0.99 0.004 120);
  --background: oklch(0.985 0.006 120);
  --foreground: var(--gym-iron);
  --primary: var(--gym-lime);
  --ring: var(--gym-lime);
}
```

Use semantic Tailwind classes first. Add raw color utilities only when they represent a deliberate one-off visualization and are documented locally.

## 4. Typography — Inter + Geist Mono

### Font Stack

| Purpose | Font | Variable |
|---|---|---|
| Primary sans | **Inter** via `next/font` | `--font-sans` |
| Mono/code | **Geist Mono** via `next/font` | `--font-mono` |

Runtime code must not load external Google Font links from static templates.

### Font Scale

| Token | Size | Line height | Weight | Use |
|---|---:|---:|---:|---|
| Display | 56px–72px | 1.02 | 700–800 | Welcome hero / major command center |
| H0 | 44px–48px | 1.05 | 700 | Workspace hero title |
| H1 | 32px–36px | 1.15 | 700 | Page title |
| H2 | 24px–30px | 1.25 | 650–700 | Section title |
| H3 | 20px–24px | 1.3 | 600 | Card title |
| Body | 16px | 1.65 | 400 | Main content |
| Small | 14px | 1.5 | 400 | Helper text |
| Label | 14px | 1.25 | 600 | Form labels |
| Meta | 12px | 1.5 | 700 | Uppercase tags |

## 5. Runtime Copy

Final `docs/init/04_REQUIREMENTS.md` requires Vietnamese UI. Current English copy is a partial migration state. New user-facing strings should be Vietnamese unless the task explicitly states it is preserving legacy copy.

## 6. Spacing

| Token | Tailwind |
|---|---|
| Page padding desktop | `px-8 py-6` |
| Page padding mobile | `px-5 py-6` |
| Section gap | `gap-4` to `gap-6` |
| Outer workspace card | `p-6` to `p-8` |
| Form spacing | `space-y-5` |

## 7. Shadows

| Token | Value |
|---|---|
| Light card shadow | `shadow-[0_24px_80px_rgba(20,35,25,0.08)]` |
| Dark card shadow | `shadow-xl shadow-zinc-950/20` |
| CTA button shadow | `shadow-lg shadow-primary/20` |
| Card hover | `shadow-lg` with `-translate-y-0.5` |

Do not use pure black shadows.
