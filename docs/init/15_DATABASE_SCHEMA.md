# GymMaster — MySQL Database Schema Documentation

**Phiên bản:** v0.2-4roles-mysql  
**Ngôn ngữ:** Tiếng Việt  
**Database Platform:** MySQL  
**Backend:** C# / ASP.NET Core 8 Web API  
**ORM:** Entity Framework Core 8 — Code First Migrations  
**Auth:** JWT Bearer Token + BCrypt  
**Giả định chính:** Hệ thống dùng 4 role chính thức: `admin`, `staff`, `pt`, `member`.

---

# 1. Tóm tắt thiết kế

Database GymMaster được thiết kế theo mô hình quan hệ trên **MySQL**. Backend ASP.NET Core 8 Web API sử dụng **Entity Framework Core 8 Code First Migrations** để quản lý bảng, quan hệ, khóa chính/khóa ngoại và cập nhật schema theo quá trình phát triển.

Core flow được hỗ trợ bởi database:

```text
users / roles / user_roles
→ member_profiles / staff_profiles / trainer_profiles
→ membership_packages / memberships / payments / invoices / renewals
→ checkins
→ trainer_assignments
→ workout_plans / workout_exercises / trainer_notes
→ progress_logs / body_measurements / before_after_photos
→ calorie_targets / food_items / meal_logs / meal_log_items
→ notifications / dashboard_metrics / audit_logs
```

---

# 2. Approved Technology Stack

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

---

# 3. Role Model

| Role | Mục đích |
|---|---|
| `admin` | Quản lý toàn hệ thống, users, roles, staff, PT, package, PT assignment, dashboard, audit log. |
| `staff` | Vận hành tại quầy: tạo/tìm hội viên, bán/gia hạn gói, check-in hỗ trợ, xem payment cơ bản. |
| `pt` | Quản lý hội viên được phân công, tạo giáo án, ghi chú, cập nhật tiến độ. |
| `member` | Sử dụng app để xem gói tập, check-in, xem giáo án, cập nhật meal journal và tiến độ cá nhân. |

---

# 4. Core Tables

| Group | Table | Purpose |
|---|---|---|
| Auth & Role | `users` | Tài khoản đăng nhập, email, phone, password hash, trạng thái khóa. |
| Auth & Role | `roles` | Danh mục role: admin, staff, pt, member. |
| Auth & Role | `user_roles` | Quan hệ nhiều-nhiều giữa user và role. |
| Profiles | `member_profiles` | Hồ sơ hội viên. |
| Profiles | `staff_profiles` | Hồ sơ nhân viên vận hành. |
| Profiles | `trainer_profiles` | Hồ sơ PT. |
| Membership | `membership_packages` | Gói tập mẫu. |
| Membership | `memberships` | Gói tập đã mua/gia hạn của hội viên. |
| Payment | `payments` | Giao dịch thanh toán. |
| Payment | `invoices` | Hóa đơn/chứng từ. |
| Payment | `renewals` | Lịch sử gia hạn. |
| Check-in | `checkins` | Lịch sử check-in. |
| PT | `trainer_assignments` | Phân công PT cho hội viên. |
| Workout | `workout_plans` | Giáo án tập luyện. |
| Workout | `workout_exercises` | Bài tập trong giáo án. |
| Notes | `trainer_notes` | Ghi chú PT cho hội viên. |
| Progress | `progress_logs` | Lịch sử cân nặng, body fat, ghi chú tiến độ. |
| Progress | `body_measurements` | Số đo cơ thể. |
| Progress | `before_after_photos` | URL ảnh trước/sau, lưu file thật ở Azure Blob Storage. |
| Nutrition | `calorie_targets` | Mục tiêu calo hằng ngày. |
| Nutrition | `food_items` | Danh mục món ăn. |
| Nutrition | `meal_logs` | Nhật ký bữa ăn. |
| Nutrition | `meal_log_items` | Chi tiết món trong từng bữa. |
| Notification | `notifications` | Thông báo trong hệ thống/FCM. |
| Dashboard | `dashboard_metrics` | Metric tổng hợp cho dashboard. |
| Audit | `audit_logs` | Nhật ký thao tác quan trọng. |
| Token | `refresh_tokens` | Lưu refresh token đã hash/rotate để bảo mật phiên đăng nhập. |

---

# 5. Relationship Summary

| Relationship | Meaning |
|---|---|
| `users` 1-n `user_roles` n-1 `roles` | Một user có thể có một hoặc nhiều role. |
| `users` 1-1 `member_profiles` | User role Member có hồ sơ hội viên. |
| `users` 1-1 `staff_profiles` | User role Staff có hồ sơ nhân viên. |
| `users` 1-1 `trainer_profiles` | User role PT có hồ sơ huấn luyện viên. |
| `member_profiles` 1-n `memberships` | Một hội viên có nhiều lần mua/gia hạn gói. |
| `membership_packages` 1-n `memberships` | Một gói mẫu có thể được nhiều hội viên mua. |
| `memberships` 1-n `payments` | Một membership có thể có nhiều giao dịch. |
| `member_profiles` 1-n `checkins` | Một hội viên có nhiều lần check-in. |
| `trainer_profiles` 1-n `trainer_assignments` | Một PT có thể được phân cho nhiều hội viên. |
| `member_profiles` 1-n `trainer_assignments` | Một hội viên có thể có lịch sử phân công PT. |
| `trainer_assignments` 1-n `workout_plans` | Giáo án gắn với phân công PT. |
| `workout_plans` 1-n `workout_exercises` | Một giáo án có nhiều bài tập. |
| `member_profiles` 1-n `progress_logs` | Hội viên có nhiều log tiến độ. |
| `meal_logs` 1-n `meal_log_items` | Một nhật ký bữa ăn có nhiều món. |

---

# 6. Security & Auth Tables

## 6.1 `users`

| Column | Type | Note |
|---|---|---|
| `id` | BIGINT PK AI | Khóa chính. |
| `email` | VARCHAR(255) UNIQUE | Email đăng nhập. |
| `phone` | VARCHAR(30) UNIQUE NULL | Số điện thoại. |
| `password_hash` | VARCHAR(255) | BCrypt hash. |
| `full_name` | VARCHAR(150) | Họ tên. |
| `status` | VARCHAR(20) | active, locked, inactive. |
| `created_at` | DATETIME | Ngày tạo. |
| `updated_at` | DATETIME | Ngày cập nhật. |

## 6.2 `refresh_tokens`

| Column | Type | Note |
|---|---|---|
| `id` | BIGINT PK AI | Khóa chính. |
| `user_id` | BIGINT FK | Liên kết user. |
| `token_hash` | VARCHAR(255) | Hash của refresh token. |
| `expires_at` | DATETIME | Mặc định 7 ngày. |
| `revoked_at` | DATETIME NULL | Thời điểm revoke. |
| `created_at` | DATETIME | Ngày tạo. |

---

# 7. EF Core Implementation Notes

- Dùng `Pomelo.EntityFrameworkCore.MySql` cho MySQL provider.
- Dùng Code First Migrations để tạo bảng.
- Entity dùng PascalCase trong C#, mapping sang snake_case hoặc PascalCase tùy convention team chốt.
- Password không bao giờ lưu plain text; chỉ lưu BCrypt hash.
- Refresh token nên lưu dạng hash và rotate khi refresh.
- File ảnh không lưu binary trong database; database chỉ lưu URL/path từ Azure Blob Storage.

---

# 8. Use Case Mapping

| Use Case | Related Tables |
|---|---|
| Login | `users`, `roles`, `user_roles`, `refresh_tokens` |
| Manage Staff | `users`, `staff_profiles`, `user_roles`, `audit_logs` |
| Manage Member | `users`, `member_profiles`, `memberships`, `audit_logs` |
| Manage PT | `users`, `trainer_profiles`, `audit_logs` |
| Sell/Renew Membership | `membership_packages`, `memberships`, `payments`, `invoices`, `renewals`, `audit_logs` |
| Check-in | `checkins`, `memberships`, `member_profiles` |
| PT Assignment | `trainer_assignments`, `trainer_profiles`, `member_profiles` |
| Workout Plan | `workout_plans`, `workout_exercises`, `trainer_notes` |
| Progress Tracking | `progress_logs`, `body_measurements`, `before_after_photos` |
| Calorie Tracking | `calorie_targets`, `food_items`, `meal_logs`, `meal_log_items` |
| Dashboard | `dashboard_metrics`, plus query từ payment/check-in/membership |
| Notification | `notifications` + Firebase Cloud Messaging |
| Audit Log | `audit_logs` |

---

# 9. Minimum Table Count for SWP391

Schema này có hơn 10 bảng, đáp ứng yêu cầu mốc triển khai của SWP391 về database. Các bảng core nên ưu tiên implement trước:

1. `users`
2. `roles`
3. `user_roles`
4. `member_profiles`
5. `staff_profiles`
6. `trainer_profiles`
7. `membership_packages`
8. `memberships`
9. `payments`
10. `checkins`
11. `trainer_assignments`
12. `workout_plans`
13. `progress_logs`
14. `meal_logs`
15. `audit_logs`

---

# 10. Conclusion

Schema v0.2 phù hợp với GymMaster vì:

- Hỗ trợ đầy đủ 4 role: Admin, Staff, PT, Member.
- Phù hợp với stack Next.js + ASP.NET Core 8 Web API + MySQL.
- Có đủ bảng cho membership, payment, check-in, PT assignment, workout, progress, calorie tracking, dashboard và audit log.
- Tách file storage sang Azure Blob Storage để database không bị nặng.
- Sẵn sàng triển khai bằng Entity Framework Core 8 Code First Migrations.
