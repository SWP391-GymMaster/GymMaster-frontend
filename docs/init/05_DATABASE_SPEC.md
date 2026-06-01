# 05 — Database Specification

# GymMaster — Database Scope

**Status:** Updated — MySQL + EF Core 8 Code First

---

# 1. Core Tables

| Group | Table | Purpose |
|---|---|---|
| User & Role | `users` | Tài khoản người dùng. |
| User & Role | `roles` | Vai trò hệ thống. |
| User & Role | `user_roles` | Quan hệ user-role. |
| Profiles | `member_profiles` | Hồ sơ hội viên. |
| Profiles | `staff_profiles` | Hồ sơ nhân viên vận hành/quầy lễ tân. |
| Profiles | `trainer_profiles` | Hồ sơ PT. |
| Membership | `membership_packages` | Gói tập mẫu. |
| Membership | `memberships` | Gói tập đã mua/gia hạn của hội viên. |
| Payment | `payments` | Thanh toán/giao dịch. |
| Payment | `renewals` | Lịch sử gia hạn. |
| Payment | `invoices` | Hóa đơn hoặc chứng từ. |
| Check-in | `checkins` | Lịch sử check-in. |
| PT | `trainer_assignments` | Phân công PT cho Member. |
| Workout | `workout_plans` | Giáo án. |
| Workout | `workout_exercises` | Bài tập trong giáo án. |
| Notes | `trainer_notes` | Ghi chú PT. |
| Progress | `progress_logs` | Tiến độ tổng quát. |
| Progress | `body_measurements` | Số đo cơ thể. |
| Progress | `weight_logs` | Lịch sử cân nặng. |
| Progress | `before_after_photos` | Metadata ảnh before/after. |
| Nutrition | `calorie_targets` | Mục tiêu calories/macros. |
| Nutrition | `food_items` | Database món ăn. |
| Nutrition | `meal_logs` | Bữa ăn theo ngày. |
| Nutrition | `meal_log_items` | Món ăn trong meal log. |
| System | `audit_logs` | Log hành động quan trọng. |
| System | `dashboard_metrics` | Dữ liệu tổng hợp dashboard nếu cần. |

---

# 2. Secondary Tables

| Group | Table | Purpose |
|---|---|---|
| Barcode | `barcode_products` | Lookup sản phẩm đóng gói bằng barcode. |
| Notification | `notifications` | Thông báo trong app. |
| Booking | `pt_bookings` | Lịch đặt PT online. |
| Class | `class_schedules` | Lịch lớp học nhóm. |
| Class | `class_slots` | Slot của lớp học. |
| Room | `room_bookings` | Lịch đặt phòng/sân. |
| Combo | `combo_packages` | Gói combo. |
| KPI | `trainer_kpi` | KPI cơ bản của PT. |

---

# 3. Out-of-scope Tables

| Table | Reason |
|---|---|
| `meal_images` | Không triển khai calorie tracking bằng ảnh. |
| `ai_calorie_analysis` | Không triển khai AI image calorie. |
| `zalo_sms_logs` | Không tích hợp Zalo/SMS trong core. |
| `chat_messages` | Không làm realtime chat trong core. |

---

# 5. Important Relationships

| Relationship | Description |
|---|---|
| User → MemberProfile | Một User role Member có một MemberProfile. |
| User → TrainerProfile | Một User role PT có một TrainerProfile. |
| MemberProfile → Memberships | Một Member có nhiều Membership records theo thời gian. |
| MembershipPackage → Memberships | Một Package có thể được bán cho nhiều Member. |
| Membership → Payments | Một Membership có payment record liên quan. |
| MemberProfile → CheckIns | Một Member có nhiều CheckIn records. |
| MemberProfile → TrainerAssignments | Một Member có lịch sử assignment. |
| TrainerProfile → TrainerAssignments | Một PT có nhiều assignment. |
| WorkoutPlan → WorkoutExercises | Một plan có nhiều bài tập. |
| MemberProfile → TrainerNotes | Member có nhiều note từ PT. |
| MemberProfile → MealLogs | Member có nhiều meal logs. |
| MealLog → MealLogItems | Một meal log có nhiều món. |
| FoodItem → MealLogItems | Một food item có thể xuất hiện trong nhiều meal log items. |
| User → AuditLogs | Một user có thể tạo nhiều audit logs. |

---

# 6. Table Priority

| Priority | Tables |
|---|---|
| High | `users`, `roles`, `user_roles`, `member_profiles`, `trainer_profiles`, `membership_packages`, `memberships`, `payments`, `checkins`, `trainer_assignments`, `workout_plans`, `trainer_notes`, `calorie_targets`, `food_items`, `meal_logs`, `meal_log_items`, `audit_logs` |
| Medium | `renewals`, `invoices`, `workout_exercises`, `progress_logs`, `body_measurements`, `weight_logs`, `before_after_photos`, `dashboard_metrics`, `notifications`, `barcode_products` |
| Low | `pt_bookings`, `class_schedules`, `class_slots`, `room_bookings`, `combo_packages`, `trainer_kpi`, `meal_images`, `image_food_recognition_results`, `image_food_suggestions` |


## Technology Stack

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

> Database được triển khai bằng MySQL. Backend sử dụng Entity Framework Core 8 theo hướng Code First Migrations để sinh và cập nhật schema.
