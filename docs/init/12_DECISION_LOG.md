# 12 — Decision Log

# GymMaster — Decision Log / ADR

**Status:** Updated — Main Decisions Approved  
**Updated:** 2026-05-27

---

# 1. Decision Summary

| Decision ID | Topic | Status | Final Decision |
|---|---|---|---|
| D-01 | Roles | Approved | 4 roles: Admin, Staff, PT, Member |
| D-02 | Frontend stack | Approved | Next.js |
| D-03 | Backend stack | Approved | C# / ASP.NET Core 8 Web API |
| D-04 | Database | Approved | MySQL |
| D-05 | ORM | Approved | Entity Framework Core 8 — Code First Migrations |
| D-06 | Authentication | Approved | JWT Bearer Token + BCrypt; Access 15m, Refresh 7d |
| D-07 | AI Vision | Approved | Google Cloud Vision API |
| D-08 | Push Notification | Approved | Firebase Cloud Messaging |
| D-09 | File Storage | Approved | Azure Blob Storage |
| D-10 | Deployment | Approved | Frontend: Vercel; Backend: Azure App Service |
| D-11 | Version Control | Approved | GitHub Monorepo |
| D-12 | API Testing | Approved | Postman / Thunder Client |
| D-13 | Nutrition scope | Approved | Manual Meal Journal; AI Vision là enhancement |
| D-14 | Barcode lookup | Approved | Secondary/Optional |
| D-15 | Check-in rule | Approved | Cho phép nhiều check-in/ngày trong MVP; có thể cấu hình giới hạn sau |
| D-16 | Member self-renewal | Approved | Member gửi yêu cầu; Admin/Staff xác nhận thanh toán/gia hạn |

---

# 2. D-01 — Roles

Hệ thống dùng **4 role chính thức**:

| Role | Trách nhiệm chính |
|---|---|
| Admin | Quản lý toàn hệ thống, user, role, staff, PT, gói tập, dashboard, audit log. |
| Staff | Vận hành tại quầy: quản lý hội viên, bán/gia hạn gói, check-in hỗ trợ, xem lịch sử giao dịch. |
| PT | Quản lý hội viên được phân công, tạo giáo án, ghi chú, cập nhật tiến độ. |
| Member | Check-in, xem gói tập, xem giáo án/tiến độ, meal journal, gửi yêu cầu gia hạn. |

Lý do chọn 4 role: sát thực tế vận hành phòng gym hơn, tách rõ quyền quản trị của Admin và nghiệp vụ quầy của Staff.

---

# 3. Approved Technology Stack

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

# 4. Architecture Decision

Dự án dùng mô hình **client-server**:

```text
Next.js Frontend
→ RESTful API
→ ASP.NET Core 8 Web API
→ Entity Framework Core 8
→ MySQL
```

Frontend triển khai trên Vercel. Backend triển khai trên Azure App Service. File ảnh như avatar, ảnh tiến độ, tài liệu hoặc ảnh meal journal được lưu trên Azure Blob Storage.

---

# 5. Security Decision

- Password được hash bằng BCrypt.
- Access Token có thời hạn 15 phút.
- Refresh Token có thời hạn 7 ngày.
- Backend kiểm tra role/permission ở API layer.
- Các thao tác quan trọng được ghi vào `audit_logs`.

---

# 6. AI/External Service Decision

- Google Cloud Vision API dùng cho chức năng nhận diện ảnh trong phạm vi enhancement.
- Firebase Cloud Messaging dùng cho thông báo đẩy như nhắc hết hạn gói, lịch tập hoặc thông báo từ PT.
- Không để external API trở thành điều kiện bắt buộc để core workflow hoạt động trong demo.
