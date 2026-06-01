# 02 — Product Scope

# GymMaster — MVP, Features & Scope

> Repo-local status: Full-system product scope source of truth. Frontend tasks must derive feature priority from this file, then use `docs/design/` for frontend implementation guidance. Backend/database implementation remains outside this frontend repo.

## 1. MVP Definition

MVP của GymMaster là phiên bản tối thiểu nhưng đủ chứng minh hệ thống có thể quản lý vận hành phòng tập theo một flow hoàn chỉnh:

```text
Member Management
→ Membership Selling/Renewal
→ Check-in
→ PT Assignment
→ Workout/Notes
→ Progress Tracking
→ Meal Journal
→ Dashboard/Audit Log
```

## 2. MVP Core Modules

| ID | Module | Actor chính | Trạng thái |
|---|---|---|---|
| M-01 | Authentication & Authorization | All | Core |
| M-02 | User & Role Management | Admin | Core |
| M-03 | Member Management | Admin/Staff | Core |
| M-03A | Staff Management | Admin | Core |
| M-04 | PT Management | Admin | Core |
| M-05 | Membership Package Management | Admin | Core |
| M-06 | Membership Selling & Renewal | Admin/Staff/Member | Core |
| M-07 | Check-in | Member/Admin/Staff | Core |
| M-08 | PT Assignment | Admin | Core |
| M-09 | Workout Plan | PT | Core |
| M-10 | Trainer Notes | PT | Core |
| M-11 | Member 360° Profile | Member/PT/Admin | Core |
| M-12 | Progress Tracking | Member/PT | Core |
| M-13 | Calorie Tracking & Meal Journal | Member/PT | Core |
| M-14 | Revenue & Payment Dashboard | Admin | Core |
| M-15 | Audit Log | Admin/System | Core |

## 3. Core Features

| Feature ID | Feature | Description |
|---|---|---|
| F-01 | Login / Logout | Người dùng đăng nhập/đăng xuất. |
| F-02 | Role-based Access | Người dùng chỉ truy cập chức năng theo vai trò. |
| F-03 | Manage Users | Admin quản lý tài khoản. |
| F-04 | Manage Members | Admin/Staff quản lý hội viên. |
| F-04A | Manage Staff | Admin tạo, cập nhật, khóa tài khoản Staff. |
| F-05 | Manage PTs | Admin quản lý hồ sơ PT. |
| F-06 | Manage Packages | Admin quản lý gói tập. |
| F-07 | Sell Package | Admin/Staff bán gói cho hội viên. |
| F-08 | Renew Package | Admin/Staff/Member gia hạn gói. |
| F-09 | Check-in | Member check-in hoặc Admin/Staff check-in hỗ trợ. |
| F-10 | Assign PT | Admin phân công PT cho Member. |
| F-11 | View Assigned Members | PT xem hội viên được phân công. |
| F-12 | Create Workout Plan | PT tạo giáo án. |
| F-13 | Add Trainer Note | PT ghi chú hằng ngày. |
| F-14 | View 360° Profile | Member/PT/Admin xem hồ sơ tổng quan. |
| F-15 | Track Progress | Theo dõi cân nặng, số đo, ảnh before/after. |
| F-16 | Set Calorie Target | PT/Member đặt mục tiêu calories. |
| F-17 | Add Meal Log | Member ghi bữa ăn. |
| F-18 | Search Food Item | Member chọn món từ food database. |
| F-19 | Add Custom Food | Member tự thêm món. |
| F-20 | View Daily Calorie Summary | Member xem calories đã nạp/còn lại. |
| F-21 | View Revenue Dashboard | Admin xem doanh thu và thanh toán. |
| F-22 | View Audit Logs | Admin xem audit log. |

## 4. Secondary Features

| ID | Feature | Description |
|---|---|---|
| S-01 | Barcode Lookup | Member nhập/scan barcode để tìm sản phẩm đóng gói. |
| S-02 | Basic In-app Notification | Nhắc gói sắp hết hạn trong app. |
| S-03 | PT Online Booking | Member đặt lịch PT. |
| S-04 | Basic Group Classes | Quản lý lớp Yoga/Zumba/HIIT mức đơn giản. |
| S-05 | Combo Packages | Gói combo và dịch vụ. |
| S-06 | Basic PT KPI | Theo dõi số buổi/hội viên của PT. |


## 5. Enhancement sau Secondary

Các tính năng enhancement chỉ xem xét sau khi core và secondary đã ổn định.

| ID | Feature | Description |
|---|---|---|
| E-01 | Image Food Recognition Assist | Member upload ảnh bữa ăn, hệ thống dùng AI/vision để gợi ý tên món hoặc nguyên liệu. User phải xác nhận/chỉnh sửa món và khẩu phần. Calories được tính từ food database/meal log, không tự động định lượng hoàn toàn bằng AI. |

## 6. Out-of-scope

| ID | Feature | Reason |
|---|---|---|

| O-01 | Payment gateway thật | Phức tạp, cần callback, bảo mật và test nhiều. |
| O-02 | Zalo/SMS realtime | Phụ thuộc account/API/chi phí. |
| O-03 | Realtime chat | Tăng scope socket/message state. |
| O-04 | Auto assign PT | Cần thuật toán và rule rõ. |
| O-05 | Advanced reports/PDF export | Để phase mở rộng. |
| O-06 | Multi-branch support | Thay đổi schema và phân quyền. |
| O-07 | PT salary calculation nâng cao | Cần rule lương rõ. |

## 7. Release Scope Summary

| Release | Scope |
|---|---|
| v0.1 | Docs, context, use cases, wireframe, database draft |
| v0.2 | Auth, users, members, packages |
| v0.3 | Membership selling/renewal, check-in, PT assignment |
| v0.4 | Workout plan, notes, progress tracking |
| v0.5 | Calorie tracking & meal journal |
| v0.6 | Dashboard, audit log, test, UAT |
| v0.8 | Enhancement candidate: Image Food Recognition Assist nếu core/secondary đã ổn |
| v1.0 | Final demo release |
