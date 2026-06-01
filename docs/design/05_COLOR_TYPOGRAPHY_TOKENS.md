# 05 — Color, Typography & Tokens

## 1. Color palette

| Token | Hex | Dùng cho |
|---|---|---|
| Primary | `#4F46E5` | Button chính, active nav, link chính |
| Primary Hover | `#4338CA` | Hover primary |
| Accent / Success | `#10B981` | Fitness/progress/success |
| Info | `#0EA5E9` | Check-in/info |
| Warning | `#F59E0B` | Pending/sắp hết hạn |
| Danger | `#E11D48` | Error/expired/failed |
| Neutral 900 | `#0F172A` | Text chính |
| Neutral 600 | `#475569` | Text phụ |
| Neutral 500 | `#64748B` | Muted text |
| Border | `#E2E8F0` | Border/input |
| Background | `#F8FAFC` | App background |
| Surface | `#FFFFFF` | Card/dialog/table |

## 2. Status colors

| Status | Color |
|---|---|
| `active` | Emerald |
| `paid` | Emerald |
| `pending` | Amber |
| `expired` | Rose |
| `cancelled` | Slate |
| `locked` | Red |
| `assigned` | Indigo |
| `checked-in` | Sky |
| `failed` | Rose |

## 3. shadcn CSS variables đề xuất

```css
:root {
  --background: 210 40% 98%;
  --foreground: 222 47% 11%;

  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;

  --primary: 239 84% 67%;
  --primary-foreground: 0 0% 100%;

  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;

  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  --accent: 160 84% 39%;
  --accent-foreground: 0 0% 100%;

  --destructive: 346 77% 49%;
  --destructive-foreground: 0 0% 100%;

  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 239 84% 67%;

  --radius: 0.75rem;
}
```

## 4. Typography

| Token | Size | Line height | Dùng cho |
|---|---:|---:|---|
| Display | 32px | 40px | Dashboard title |
| H1 | 28px | 36px | Page title |
| H2 | 24px | 32px | Section title |
| H3 | 20px | 28px | Card title |
| Body | 14px | 22px | Nội dung chính |
| Small | 12px | 18px | Badge/helper text |
| Label | 13px | 20px | Form label |

Font đề xuất:

```text
Inter
fallback: system-ui, sans-serif
```

## 5. Spacing

| Token | Tailwind |
|---|---|
| Page padding desktop | `p-6` |
| Page padding mobile | `p-4` |
| Section gap | `gap-6` |
| Card padding | `p-4` hoặc `p-6` |
| Form gap | `space-y-4` |
| Table row height | 48px–56px |
