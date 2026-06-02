# 15 — Database Schema (SQL Server, EF Core 10 Code-First)

> Schema chi tiết mức contract. Canonical DB = **SQL Server** (provider `Microsoft.EntityFrameworkCore.SqlServer`). Mọi đổi schema qua EF migration. Backend runtime **không auto-create/auto-seed DB**; DB/migration do backend/database team quản lý.
>
> **Final delta 2026-06-02:** tài liệu này đã áp dụng `CHANGELOG_vs_old_spec.md` và `DB_DIFF_FOR_DBTEAM.md`: ASP.NET Core 10, EF Core 10, table `snake_case`, `BIGINT` identities, RBAC qua `user_roles`, thêm `password_reset_tokens`, `users.Status` dạng string, `LockedUntil`, `LoginWindowStartedAt`, bỏ `RoleId` trực tiếp và `RowVersion`.

---

## 1. Tổng quan bảng

| # | Bảng | Nhóm | Mô tả |
|---|---|---|---|
| 1 | `users` | Auth | Tài khoản đăng nhập mọi role |
| 2 | `roles` | Auth | Admin/Staff/PT/Member |
| 3 | `user_roles` | Auth | Bảng nối user-role |
| 4 | `refresh_tokens` | Auth | Refresh token JWT |
| 5 | `password_reset_tokens` | Auth | Token reset mật khẩu |
| 6 | `member_profiles` | Member | Hồ sơ hội viên |
| 7 | `trainer_profiles` | PT | Hồ sơ PT |
| 8 | `membership_packages` | Membership | Gói tập |
| 9 | `memberships` | Membership | Gói đã mua của member |
| 10 | `payments` | Payment | Thanh toán |
| 11 | `check_ins` | Operation | Lượt check-in |
| 12 | `trainer_assignments` | Training | Phân công PT-Member |
| 13 | `workout_plans` | Training | Giáo án |
| 14 | `workout_exercises` | Training | Bài tập trong giáo án |
| 15 | `trainer_notes` | Training | Ghi chú PT |
| 16 | `progress_logs` | Progress | Tiến độ |
| 17 | `food_items` | Nutrition | Cơ sở dữ liệu món ăn |
| 18 | `meal_logs` | Nutrition | Bản ghi bữa ăn |
| 19 | `meal_log_items` | Nutrition | Món trong bữa ăn |
| 20 | `calorie_targets` | Nutrition | Mục tiêu calo |
| 21 | `audit_logs` | System | Nhật ký hành động mutating |

---

## 2. Quy ước chung

| Quy ước | Contract |
|---|---|
| Primary key | `Id BIGINT IDENTITY(1,1)` |
| Timestamp | `CreatedAt`, `UpdatedAt` dùng `DATETIME2`, UTC |
| Soft delete | `IsDeleted BIT DEFAULT 0`, `DeletedAt DATETIME2 NULL` cho entity nghiệp vụ |
| String | `NVARCHAR`, length theo domain |
| Boolean | `BIT` |
| Enum/status | String contract hoặc numeric enum có `CHECK`, nhưng API trả semantic string |
| Delete rule | FK `NO ACTION` mặc định; business data dùng soft-delete |

---

## 3. Auth/RBAC

### 3.1 `users`

| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| Id | BIGINT | PK, IDENTITY(1,1) | |
| Email | NVARCHAR(255) | UNIQUE, NOT NULL | định danh đăng nhập |
| PasswordHash | NVARCHAR(255) | NOT NULL | BCrypt cost ≥12 |
| FullName | NVARCHAR(150) | NOT NULL | |
| Phone | NVARCHAR(20) | NULL, INDEX | |
| Status | NVARCHAR(20) | NOT NULL, DEFAULT `'active'`, CHECK IN (`active`,`locked`) | |
| FailedLoginCount | INT | NOT NULL, DEFAULT 0 | brute-force |
| LoginWindowStartedAt | DATETIME2 | NULL | cửa sổ 15 phút |
| LockedUntil | DATETIME2 | NULL | khóa tạm |
| LastLoginAt | DATETIME2 | NULL | |
| IsDeleted | BIT | NOT NULL, DEFAULT 0 | soft delete |
| DeletedAt | DATETIME2 | NULL | |
| CreatedAt | DATETIME2 | NOT NULL | |
| UpdatedAt | DATETIME2 | NOT NULL | |

### 3.2 `roles`

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| Id | BIGINT | PK, IDENTITY |
| Name | NVARCHAR(20) | UNIQUE, NOT NULL — Admin/Staff/PT/Member |
| Description | NVARCHAR(255) | NULL |

### 3.3 `user_roles`

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| UserId | BIGINT | FK → `users.Id`, NOT NULL |
| RoleId | BIGINT | FK → `roles.Id`, NOT NULL |
| CreatedAt | DATETIME2 | NOT NULL |

Unique constraint: `(UserId, RoleId)`.

### 3.4 `refresh_tokens`

| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| Id | BIGINT | PK, IDENTITY | |
| UserId | BIGINT | FK → `users.Id` | |
| TokenHash | NVARCHAR(255) | NOT NULL, INDEX | không lưu plaintext |
| ExpiresAt | DATETIME2 | NOT NULL | 7 ngày |
| RevokedAt | DATETIME2 | NULL | rotate/logout |
| CreatedAt | DATETIME2 | NOT NULL | |

### 3.5 `password_reset_tokens`

| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| Id | BIGINT | PK, IDENTITY | |
| UserId | BIGINT | FK → `users.Id`, NOT NULL | |
| TokenHash | NVARCHAR(255) | NOT NULL, INDEX | không lưu plaintext |
| ExpiresAt | DATETIME2 | NOT NULL | |
| UsedAt | DATETIME2 | NULL | set khi reset thành công |
| CreatedAt | DATETIME2 | NOT NULL | |

---

## 4. Profile

### 4.1 `member_profiles`

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| Id | BIGINT | PK, IDENTITY |
| UserId | BIGINT | UNIQUE FK → `users.Id` |
| DateOfBirth | DATE | NULL |
| Gender | NVARCHAR(20) | NULL |
| Address | NVARCHAR(255) | NULL |
| EmergencyContact | NVARCHAR(100) | NULL |
| JoinedAt | DATETIME2 | NOT NULL |
| IsDeleted / DeletedAt | BIT / DATETIME2 | soft delete |
| CreatedAt / UpdatedAt | DATETIME2 | NOT NULL |

### 4.2 `trainer_profiles`

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| Id | BIGINT | PK, IDENTITY |
| UserId | BIGINT | UNIQUE FK → `users.Id` |
| Specialty | NVARCHAR(120) | NULL |
| Bio | NVARCHAR(1000) | NULL |
| Gender | NVARCHAR(20) | NULL |
| DateOfBirth | DATE | NULL |
| YearsOfExperience | INT | NOT NULL, DEFAULT 0 |
| IsDeleted / DeletedAt | BIT / DATETIME2 | soft delete |
| CreatedAt / UpdatedAt | DATETIME2 | NOT NULL |

---

## 5. Membership, payment, check-in

### 5.1 `memberships`

| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| Id | BIGINT | PK, IDENTITY | |
| MemberId | BIGINT | FK → `member_profiles.Id` | |
| PackageId | BIGINT | FK → `membership_packages.Id` | |
| StartDate | DATE | NOT NULL | |
| EndDate | DATE | NOT NULL | = StartDate + DurationDays |
| Status | NVARCHAR(30) | NOT NULL | pending_payment, active, expired, cancelled |
| CreatedAt / UpdatedAt | DATETIME2 | NOT NULL | |

### 5.2 `payments`

| Cột | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|
| Id | BIGINT | PK, IDENTITY | |
| MembershipId | BIGINT | FK → `memberships.Id` | |
| Amount | DECIMAL(12,2) | NOT NULL, CHECK ≥ 0 | |
| Method | NVARCHAR(30) | NOT NULL | cash, transfer, card |
| Status | NVARCHAR(30) | NOT NULL | pending, paid, refunded |
| PaidAt | DATETIME2 | NULL | |
| CreatedBy | BIGINT | FK → `users.Id` | Staff/Admin |
| CreatedAt | DATETIME2 | NOT NULL | |

### 5.3 `check_ins`

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| Id | BIGINT | PK, IDENTITY |
| MemberId | BIGINT | FK → `member_profiles.Id`, INDEX |
| CheckInAt | DATETIME2 | NOT NULL, UTC |
| CreatedBy | BIGINT | FK → `users.Id` NULL nếu self |

---

## 6. Training

- `trainer_assignments`: `Id`, `TrainerId`, `MemberId`, `StartDate`, `EndDate`, `Status`, timestamps. Member có tối đa 1 active assignment; duplicate active assignment trả lỗi nghiệp vụ thay vì tự đóng assignment cũ.
- `workout_plans`: `Id`, `MemberId`, `TrainerId`, `Title`, `Goal`, `StartDate`, `EndDate`, `Status`, timestamps.
- `workout_exercises`: `Id`, `WorkoutPlanId`, `Name`, `Sets`, `Reps`, `Load`, `RestSeconds`, `Notes`, sort order.
- `trainer_notes`: `Id`, `MemberId`, `TrainerId`, `NoteDate`, `Category`, `Content`, timestamps.
- `progress_logs`: `Id`, `MemberId`, `LogDate`, `WeightKg`, `BodyFatPercent`, `ChestCm`, `WaistCm`, `HipCm`, `PhotoUrl`, `Notes`, timestamps.

---

## 7. Nutrition

**`food_items`:** `Id`, `Name`, `ServingUnit`, calories/macros per serving or 100g, `IsCustom`, `CreatedBy`, timestamps.

**`meal_logs`:** `Id`, `MemberId`, `LogDate`, `MealType`, timestamps.

**`meal_log_items`:** `Id`, `MealLogId`, `FoodItemId`, `Quantity`, `Calories`, `Protein`, `Carbs`, `Fat`.

**`calorie_targets`:** `Id`, `MemberId`, `DailyCalories`, macro targets, effective dates.

---

## 8. Audit

| Cột | Kiểu | Ghi chú |
|---|---|---|
| Id | BIGINT PK IDENTITY | |
| UserId | BIGINT FK → `users.Id` | actor |
| Action | NVARCHAR(100) | vd `CREATE_MEMBER`, `ASSIGN_PT` |
| Entity | NVARCHAR(60) | bảng/đối tượng |
| EntityId | BIGINT | |
| Metadata | NVARCHAR(MAX) | JSON trước/sau; không chứa PII nhạy cảm |
| CreatedAt | DATETIME2 | UTC |

---

## 9. Index & ràng buộc quan trọng

- UNIQUE: `users.Email`, `roles.Name`, `user_roles(UserId, RoleId)`.
- INDEX: `check_ins(MemberId, CheckInAt)`, `memberships(MemberId, Status)`, `trainer_assignments(MemberId, Status)`, `meal_logs(MemberId, LogDate)`.
- CHECK: `Quantity > 0`, `Amount >= 0`, `EndDate >= StartDate`, status strings theo contract.
- FK `ON DELETE NO ACTION` cho business data; dùng soft-delete thay vì hard-delete.

---

## 10. Map use case → bảng

| Use case | Bảng chính |
|---|---|
| Login (UC-01) | `users`, `roles`, `user_roles`, `refresh_tokens` |
| Forgot/reset password | `users`, `password_reset_tokens` |
| User/member/PT management (UC-03/04/05) | `users`, `member_profiles`, `trainer_profiles`, `audit_logs` |
| Sell/Renew (UC-07/08) | `memberships`, `payments`, `membership_packages` |
| Check-in (UC-09) | `check_ins`, `memberships` |
| Assign PT (UC-10) | `trainer_assignments`, `audit_logs` |
| Workout (UC-12) | `workout_plans`, `workout_exercises` |
| Progress (UC-15) | `progress_logs` |
| Meal log (UC-17) | `meal_logs`, `meal_log_items`, `food_items` |
| Calorie summary (UC-20) | `meal_log_items`, `calorie_targets` |
| Dashboard (UC-22) | `payments`, `memberships`, `check_ins` |
| Audit (UC-23) | `audit_logs` |

---

## 11. Legacy artifacts

`GymMaster_SQLServer_Final.sql`, `build_db.py`, and `test_output.txt` were generated from an older draft and are now marked legacy/stale. Do not use those files as current schema source of truth unless the DB team regenerates them from this contract.
