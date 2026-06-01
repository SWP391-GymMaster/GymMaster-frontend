# 04 — Design System

## 1. Design direction

GymMaster nên theo hướng:

```text
Clean Admin Dashboard
+ Fitness/Sport Accent
+ High Usability
+ Data-first UI
```

Không thiết kế như landing page. Đây là hệ thống quản lý, nên ưu tiên:

- tốc độ thao tác
- dữ liệu rõ
- form dễ dùng
- status dễ nhận biết
- role navigation rõ
- ít animation gây nhiễu

---

## 2. UI principles

| Principle | Mô tả |
|---|---|
| Clarity first | Mỗi màn hình phải nói rõ người dùng đang làm gì |
| One primary action | Mỗi form/màn chính chỉ có một primary action nổi bật |
| Status visible | Membership/payment/check-in status phải dễ nhìn |
| Role-aware | Menu và content theo đúng role |
| Fast operation | Staff thao tác nhanh tại quầy |
| Safe action | Action nguy hiểm phải confirm |
| Demo-ready | Luồng demo chính phải ít click và ổn định |

---

## 3. Visual style

| Thuộc tính | Rule |
|---|---|
| Background | Slate 50 / neutral light |
| Surface | White card |
| Border | Slate 200 |
| Radius | `rounded-xl` hoặc `rounded-2xl` |
| Shadow | nhẹ, ưu tiên border hơn shadow đậm |
| Spacing | 4px scale, page gap 24px |
| Icon | Lucide, stroke style |
| Motion | 150–250ms, subtle |

---

## 4. Layout pattern

Dùng một app shell chung:

```text
Sidebar
Topbar
Main content
Page header
Content sections/cards
```

Không tạo layout riêng hoàn toàn cho từng role. Role chỉ khác:

- menu
- dashboard cards
- permissions
- visible actions

---

## 5. Do / Don't

### Do

- Dùng `StatusBadge` chung.
- Dùng `PageHeader` cho tất cả page.
- Dùng `DataTable` pattern chung.
- Dùng form validation rõ ràng.
- Có empty/loading/error state.

### Don't

- Không hardcode màu status ở từng màn.
- Không dùng quá nhiều animation.
- Không để nhiều primary button trong cùng form.
- Không trộn MUI/AntD với shadcn.
- Không tạo component duplicate nếu đã có shared component.
