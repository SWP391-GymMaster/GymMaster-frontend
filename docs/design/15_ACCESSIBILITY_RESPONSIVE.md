# 15 — Accessibility & Responsive Rules

## 1. Accessibility minimum

- Button có label rõ.
- Input có label.
- Error message gắn với field.
- Không dùng màu là tín hiệu duy nhất.
- Status badge có text.
- Focus ring không bị tắt.
- Dialog trap focus.
- Keyboard có thể tab qua form.
- Contrast đủ đọc.

## 2. Responsive priority

Vì GymMaster là dashboard/admin app:

| Breakpoint | Priority |
|---|---|
| Desktop 1440/1280 | High |
| Laptop 1024 | High |
| Tablet 768 | Medium |
| Mobile | Basic support |

## 3. Sidebar behavior

| Device | Behavior |
|---|---|
| Desktop | Sidebar fixed/collapsible |
| Tablet | Sidebar collapsible |
| Mobile | Sheet/drawer navigation |

## 4. Table responsive

- Desktop: full table.
- Tablet/mobile: hide less important columns hoặc card list.
- Row action menu vẫn phải dùng được.

## 5. Form responsive

- Desktop: 2 columns nếu form dài.
- Mobile/tablet: 1 column.
- Submit button sticky bottom nếu form rất dài.
