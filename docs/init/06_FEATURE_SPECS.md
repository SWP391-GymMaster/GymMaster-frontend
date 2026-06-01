# 06 — Feature Specs

# GymMaster — Feature Specifications

---

# SPEC-01 — Authentication

## Goal
Cho phép người dùng đăng nhập/đăng xuất và truy cập hệ thống theo vai trò.

## Scope
- Login.
- Logout.
- Role-based redirect.
- Protected pages/features.

## Acceptance Criteria
- User hợp lệ đăng nhập thành công.
- User bị khóa không đăng nhập được.
- User chỉ truy cập chức năng theo quyền.
- Logout kết thúc session.

---

# SPEC-02 — Member Management

## Goal
Cho phép Admin/Staff quản lý hồ sơ hội viên.

## Scope
- Create member.
- Update member.
- Search member.
- View member detail.
- View membership status.

## Acceptance Criteria
- Tạo hội viên thành công.
- Không cho trùng email/phone nếu được cấu hình unique.
- Có thể tìm hội viên.
- Có thể xem trạng thái gói của hội viên.


---

# SPEC-02A — Staff Management

## Goal
Cho phép Admin quản lý tài khoản và hồ sơ Staff trong hệ thống 4 role.

## Scope
- Create staff account.
- Update staff profile.
- Lock/unlock staff account.
- Search staff.
- View staff operation history.

## Acceptance Criteria
- Admin tạo Staff thành công với role Staff.
- Staff bị khóa không đăng nhập được.
- Staff chỉ truy cập được chức năng vận hành như quản lý hội viên, bán/gia hạn gói, check-in hỗ trợ.
- Mọi thao tác quan trọng được ghi Audit Log.

---

# SPEC-03 — Membership Package

## Goal
Cho phép Admin quản lý các gói tập.

## Scope
- Create package.
- Update package.
- Deactivate package.
- View package list.

## Acceptance Criteria
- Package có tên, giá, thời hạn.
- Không bán package inactive.
- Package price phải hợp lệ.

---

# SPEC-04 — Membership Selling & Renewal

## Goal
Bán hoặc gia hạn gói tập cho hội viên.

## Scope
- Sell package.
- Renew package.
- Create payment.
- Update membership.
- Audit log.

## Acceptance Criteria
- Bán gói tạo payment và membership.
- Gia hạn cập nhật ngày hết hạn.
- Payment status được lưu.
- Audit log được tạo.

---

# SPEC-05 — Check-in

## Goal
Ghi nhận lượt đến phòng tập.

## Scope
- Check-in bằng QR/card hoặc hỗ trợ tại quầy.
- Validate membership.
- Save check-in record.
- Dashboard summary.

## Acceptance Criteria
- Check-in hợp lệ được lưu.
- Membership expired được cảnh báo/từ chối theo rule team chốt.
- Check-in records hiển thị trong lịch sử.

---

# SPEC-06 — PT Assignment

## Goal
Phân công PT cho hội viên.

## Scope
- Admin assign PT.
- Close old assignment if needed.
- Create new assignment.
- Audit log.
- PT view assigned members.

## Acceptance Criteria
- Member có tối đa 1 PT active.
- PT chỉ xem Member được phân công.
- Audit log được tạo.

---

# SPEC-07 — Workout Plan & Trainer Notes

## Goal
PT tạo giáo án và ghi chú cho hội viên.

## Scope
- Create workout plan.
- Add exercises.
- Assign plan to Member.
- Add daily note.
- Member view plan/note.

## Acceptance Criteria
- PT tạo được plan cho assigned Member.
- Member xem được plan/note.
- PT không tạo note cho Member không thuộc mình.

---

# SPEC-08 — Progress Tracking

## Goal
Theo dõi tiến độ tập luyện của hội viên.

## Scope
- Weight log.
- Body measurement.
- Before/after photo metadata.
- Progress history.

## Acceptance Criteria
- Member/PT thêm được progress record.
- Member xem được lịch sử.
- PT xem được progress của assigned Member.

---

# SPEC-09 — Calorie Tracking & Meal Journal

## Goal
Hỗ trợ hội viên theo dõi calories thủ công.

## Scope
- Set calorie target.
- Search food database.
- Add custom food.
- Add meal log.
- View daily summary.
- View history.
- PT view assigned member nutrition progress.

## Enhancement Boundary
- Image Food Recognition Assist có thể xem xét sau secondary scope.
- Tính năng này chỉ gợi ý tên món/nguyên liệu từ ảnh.
- Không tự động định lượng calories hoàn toàn bằng AI.
- User phải xác nhận món và khẩu phần trước khi lưu.

## Acceptance Criteria
- Member thêm được meal log.
- Tổng calories trong ngày được tính đúng.
- Remaining calories được tính từ target.
- PT xem được nutrition history của assigned Member.

---

# SPEC-10 — Dashboard & Audit Log

## Goal
Admin theo dõi vận hành và audit trail.

## Scope
- Revenue summary.
- Payment status.
- Active/expired members.
- Check-in stats.
- Audit logs.

## Acceptance Criteria
- Dashboard lấy dữ liệu thật từ payment/membership/checkin.
- Audit log hiển thị các hành động quan trọng.
- Admin có thể lọc audit logs.


---

# SPEC-11 — Image Food Recognition Assist

## Goal
Hỗ trợ Member nhập meal log nhanh hơn bằng cách dùng ảnh để gợi ý tên món hoặc nguyên liệu.

## Scope
- Upload meal image.
- Recognize possible food names/ingredients.
- Suggest matching FoodItems.
- User confirms/edits suggestions.
- Calories calculated from confirmed food items and quantity.

## Out of Scope
- Automatic calorie calculation directly from image.
- Automatic portion size estimation.
- Saving calories without user confirmation.

## Acceptance Criteria
- Manual Meal Journal vẫn hoạt động nếu recognition service lỗi.
- Recognition result chỉ là suggestion.
- User phải xác nhận/chỉnh sửa trước khi lưu.
- MealLog cuối cùng vẫn dựa trên FoodItem/CustomFood và quantity.


---

## Approved Architecture

Frontend Next.js gọi Backend ASP.NET Core 8 Web API thông qua RESTful API. Backend dùng MySQL thông qua Entity Framework Core 8 Code First Migrations, xác thực bằng JWT Bearer Token + BCrypt.
