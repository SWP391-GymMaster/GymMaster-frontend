# 03 — SRS Use Cases

# GymMaster — Use Case Specification

**Status:** Updated — Approved 4 Roles

---

# 1. Actors

| Actor | Description |
|---|---|
| Admin | Quản lý hệ thống, tài khoản, gói tập, phân công PT, dashboard, audit log. |
| Staff | Hỗ trợ bán/gia hạn gói, check-in, tìm hội viên và vận hành tại quầy. |
| PT | Quản lý hội viên được phân công, giáo án, ghi chú, tiến độ. |
| Member | Hội viên sử dụng hệ thống để check-in, xem tiến độ, meal journal. |
| System | Tự động tính toán, ghi log, cập nhật dashboard. |

> Decision: Hệ thống dùng **4 role chính thức: Admin, Staff, PT, Member**.

---

# 2. Use Case Overview

| UC ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-01 | Login | All | High |
| UC-02 | Logout | All | High |
| UC-03 | Manage User Accounts | Admin | High |
| UC-03A | Manage Staff Accounts | Admin | High |
| UC-04 | Manage Member Profiles | Admin/Staff | High |
| UC-05 | Manage PT Profiles | Admin | High |
| UC-06 | Manage Membership Packages | Admin | High |
| UC-07 | Sell Membership Package | Admin/Staff | High |
| UC-08 | Renew Membership Package | Admin/Staff/Member | High |
| UC-09 | Check-in | Member/Admin/Staff | High |
| UC-10 | Assign PT to Member | Admin | High |
| UC-11 | View Assigned Members | PT | High |
| UC-12 | Create Workout Plan | PT | High |
| UC-13 | Add Trainer Note | PT | High |
| UC-14 | View Member 360° Profile | Member/PT/Admin | High |
| UC-15 | Track Member Progress | Member/PT | High |
| UC-16 | Set Calorie Target | PT/Member | High |
| UC-17 | Add Meal Log | Member | High |
| UC-18 | Search Food Item | Member | High |
| UC-19 | Add Custom Food | Member | High |
| UC-20 | View Daily Calorie Summary | Member | High |
| UC-21 | View Calorie History | Member/PT | High |
| UC-22 | View Revenue & Payment Dashboard | Admin | High |
| UC-23 | View Audit Logs | Admin | Medium |
| UC-24 | Barcode Lookup | Member | Medium |
| UC-25 | Basic In-app Reminder | System/Member | Medium |
| UC-26 | Image Food Recognition Assist | Member | Low / Enhancement |

---

# 3. Detailed Core Use Cases

## UC-01 — Login

| Field | Content |
|---|---|
| Objective | Người dùng đăng nhập vào hệ thống. |
| Actors | Admin, Staff, PT, Member |
| Trigger | Người dùng mở trang login. |
| Pre-condition | Người dùng có tài khoản hợp lệ. |
| Post-condition | Người dùng được chuyển đến dashboard theo vai trò. |

### Main Flow

1. Người dùng nhập email/username và password.
2. Hệ thống kiểm tra thông tin.
3. Hệ thống xác định role.
4. Hệ thống tạo session/token.
5. Hệ thống redirect người dùng đến dashboard phù hợp.

### Exception Flow

| Case | Response |
|---|---|
| Sai thông tin | Hiển thị lỗi đăng nhập. |
| Tài khoản bị khóa | Từ chối đăng nhập. |
| Thiếu input | Yêu cầu nhập đủ thông tin. |

### Acceptance Criteria

- Người dùng hợp lệ đăng nhập thành công.
- Người dùng được phân quyền đúng role.
- Người dùng không hợp lệ không thể vào hệ thống.

---

## UC-04 — Manage Member Profiles

| Field | Content |
|---|---|
| Objective | Quản lý hồ sơ hội viên. |
| Actors | Admin, Staff |
| Trigger | Người dùng mở màn hình Member Management. |
| Pre-condition | Người dùng có quyền quản lý hội viên. |
| Post-condition | Hồ sơ hội viên được tạo/cập nhật/xem. |

### Main Flow

1. Admin/Staff mở danh sách hội viên.
2. Hệ thống hiển thị danh sách có tìm kiếm/filter.
3. Admin/Staff chọn tạo mới hoặc cập nhật.
4. Hệ thống validate dữ liệu.
5. Hệ thống lưu hồ sơ hội viên.
6. Hệ thống hiển thị thông báo thành công.

### Exception Flow

| Case | Response |
|---|---|
| Email/phone trùng | Hiển thị conflict. |
| Dữ liệu không hợp lệ | Hiển thị lỗi validation. |
| Hội viên không tồn tại | Hiển thị not found. |

### Acceptance Criteria

- Tạo mới hội viên thành công.
- Cập nhật hội viên thành công.
- Có thể tìm kiếm hội viên.
- Email/phone không được trùng.

---

## UC-07 — Sell Membership Package

| Field | Content |
|---|---|
| Objective | Bán gói tập cho hội viên. |
| Actors | Admin, Staff |
| Trigger | Admin/Staff chọn bán gói. |
| Pre-condition | Hội viên và gói tập tồn tại. |
| Post-condition | Membership và payment được tạo. |

### Main Flow

1. Admin/Staff tìm hội viên.
2. Admin/Staff chọn gói tập.
3. Hệ thống hiển thị giá/thời hạn.
4. Admin/Staff xác nhận bán gói.
5. Hệ thống tạo Payment.
6. Hệ thống tạo Membership.
7. Hệ thống ghi AuditLog.

### Exception Flow

| Case | Response |
|---|---|
| Gói inactive | Không cho bán. |
| Member locked | Không cho bán. |
| Payment pending | Membership chưa active hoặc ở trạng thái pending. |

### Acceptance Criteria

- Bán gói thành công tạo payment và membership.
- Audit log được ghi.
- Dashboard có thể lấy dữ liệu từ payment.

---

## UC-08 — Renew Membership Package

| Field | Content |
|---|---|
| Objective | Gia hạn gói tập. |
| Actors | Admin, Staff, Member |
| Trigger | Người dùng chọn renew. |
| Pre-condition | Member có tài khoản và có membership history. |
| Post-condition | Membership được gia hạn hoặc tạo mới. |

### Main Flow

1. Người dùng mở thông tin membership.
2. Hệ thống hiển thị ngày hết hạn.
3. Người dùng chọn gói gia hạn.
4. Hệ thống tính thời hạn mới.
5. Người dùng xác nhận.
6. Hệ thống tạo Renewal/Payment.
7. Hệ thống cập nhật membership.

### Exception Flow

| Case | Response |
|---|---|
| Payment chưa hoàn tất | Không active renewal. |
| Gói không tồn tại | Hiển thị lỗi. |
| Tài khoản bị khóa | Không cho gia hạn. |

### Acceptance Criteria

- Gia hạn thành công cập nhật ngày hết hạn.
- Có payment/renewal record.
- Có audit log nếu Admin/Staff thực hiện.

---

## UC-09 — Check-in

| Field | Content |
|---|---|
| Objective | Ghi nhận lượt đến phòng tập. |
| Actors | Member, Admin, Staff |
| Trigger | Member quét QR/card hoặc Admin/Staff check-in hỗ trợ. |
| Pre-condition | Member có tài khoản. |
| Post-condition | Check-in record được tạo. |

### Main Flow

1. Member quét QR/card.
2. Hệ thống xác định Member.
3. Hệ thống kiểm tra membership.
4. Hệ thống tạo CheckIn.
5. Hệ thống cập nhật check-in statistics.

### Exception Flow

| Case | Response |
|---|---|
| Membership expired | Cảnh báo cần gia hạn. |
| QR/card invalid | Từ chối check-in. |
| Member locked | Từ chối check-in. |

### Acceptance Criteria

- Check-in hợp lệ được lưu.
- Check-in invalid bị từ chối.
- Dashboard thống kê được lượt check-in.

---

## UC-10 — Assign PT to Member

| Field | Content |
|---|---|
| Objective | Admin phân công PT cho hội viên. |
| Actors | Admin |
| Trigger | Admin chọn Assign PT. |
| Pre-condition | Member và PT tồn tại. |
| Post-condition | TrainerAssignment được tạo. |

### Main Flow

1. Admin mở hồ sơ Member.
2. Admin chọn Assign PT.
3. Hệ thống hiển thị danh sách PT.
4. Admin chọn PT.
5. Hệ thống đóng assignment cũ nếu có.
6. Hệ thống tạo assignment mới.
7. Hệ thống ghi AuditLog.

### Exception Flow

| Case | Response |
|---|---|
| PT inactive/locked | Không cho assign. |
| Member not found | Hiển thị not found. |
| Assign trùng | Hiển thị warning hoặc cập nhật assignment hiện tại. |

### Acceptance Criteria

- Member có tối đa 1 PT active.
- PT thấy Member trong danh sách được phân công.
- Audit log được ghi.

---

## UC-17 — Add Meal Log

| Field | Content |
|---|---|
| Objective | Member ghi lại bữa ăn. |
| Actors | Member |
| Trigger | Member mở Meal Journal. |
| Pre-condition | Member đã đăng nhập. |
| Post-condition | MealLog và MealLogItems được lưu. |

### Main Flow

1. Member chọn meal type.
2. Member search FoodItem hoặc thêm custom food.
3. Member nhập quantity.
4. Hệ thống tính calories.
5. Member lưu meal log.
6. Hệ thống cập nhật daily summary.

### Exception Flow

| Case | Response |
|---|---|
| Food không tồn tại | Cho phép Add Custom Food. |
| Quantity <= 0 | Hiển thị validation. |
| Save failed | Hiển thị lỗi. |

### Acceptance Criteria

- Meal log được lưu.
- Tổng calories cập nhật đúng.
- Member xem được lịch sử meal log.

---

## UC-22 — View Revenue & Payment Dashboard

| Field | Content |
|---|---|
| Objective | Admin xem dashboard vận hành. |
| Actors | Admin |
| Trigger | Admin mở Dashboard. |
| Pre-condition | Admin đã đăng nhập. |
| Post-condition | Dashboard hiển thị số liệu. |

### Main Flow

1. Admin mở dashboard.
2. Hệ thống lấy dữ liệu payment/membership/check-in.
3. Hệ thống hiển thị doanh thu.
4. Hệ thống hiển thị payment status.
5. Hệ thống hiển thị active/expired members.
6. Hệ thống hiển thị check-in statistics.

### Acceptance Criteria

- Dashboard lấy dữ liệu từ records thật.
- Admin có thể xem doanh thu và trạng thái thanh toán.
- Dữ liệu cập nhật sau workflow bán/gia hạn/check-in.

---

## UC-26 — Image Food Recognition Assist

| Field | Content |
|---|---|
| Objective | Member upload ảnh bữa ăn để hệ thống gợi ý tên món hoặc nguyên liệu, giúp nhập MealLog nhanh hơn. |
| Actors | Member |
| Trigger | Member chọn chức năng upload ảnh trong Meal Journal. |
| Pre-condition | Member đã đăng nhập; Meal Journal module đã hoạt động ổn định. |
| Post-condition | Hệ thống hiển thị danh sách món/nguyên liệu được gợi ý; Member xác nhận hoặc chỉnh sửa trước khi lưu MealLog. |

### Main Flow

1. Member mở Meal Journal.
2. Member chọn upload ảnh bữa ăn.
3. Hệ thống gửi ảnh đến dịch vụ nhận diện.
4. Dịch vụ trả về tên món hoặc nguyên liệu có khả năng xuất hiện trong ảnh.
5. Hệ thống map gợi ý với FoodItem nếu tìm thấy.
6. Member xác nhận/chỉnh sửa món ăn và nhập khẩu phần.
7. Hệ thống tính calories dựa trên FoodItem, quantity và thông tin user xác nhận.
8. Hệ thống lưu MealLog/MealLogItems.

### Exception Flow

| Case | Response |
|---|---|
| Không nhận diện được món | Cho phép nhập MealLog thủ công. |
| Gợi ý sai món | Member có thể xóa/sửa gợi ý. |
| External service lỗi | Hiển thị lỗi và fallback về manual meal log. |
| Không tìm thấy FoodItem tương ứng | Cho phép Add Custom Food. |

### Acceptance Criteria

- Tính năng không thay thế manual meal log.
- AI/vision chỉ gợi ý tên món hoặc nguyên liệu.
- Calories không được lưu tự động nếu Member chưa xác nhận.
- Member phải nhập/chỉnh khẩu phần trước khi lưu.
- Nếu nhận diện lỗi, flow manual vẫn hoạt động bình thường.


# 7. Approved Technology Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js |
| Backend | C# / ASP.NET Core 8 Web API |
| Database | MySQL |
| ORM | Entity Framework Core 8 - Code First Migrations |
| Authentication | JWT Bearer Token + BCrypt |
| Token Policy | Access Token 15 phút, Refresh Token 7 ngày |
| AI Vision | Google Cloud Vision API |
| Push Notification | Firebase Cloud Messaging |
| File Storage | Azure Blob Storage |
| Frontend Deploy | Vercel |
| Backend Deploy | Azure App Service |
| Version Control | GitHub Monorepo |
| API Testing | Postman / Thunder Client |
