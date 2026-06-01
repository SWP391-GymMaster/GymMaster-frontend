# 10 — AGENTS.md

# GymMaster — AI / Coding Agent Guidelines

**Status:** Updated — 4 Roles & Tech Stack Approved

---

# 1. Nguyên tắc chính

AI/coding agent được dùng để hỗ trợ:

- Viết tài liệu.
- Làm rõ requirement.
- Gợi ý database schema.
- Sinh test cases.
- Review code.
- Gợi ý refactor.
- Debug lỗi.
- Tạo checklist.
- Chuẩn hóa commit/PR description.

AI/coding agent **không được tự quyết định** các quyết định lớn nếu chưa có trong docs.

---

# 2. Khi nào AI phải hỏi lại?

AI phải hỏi lại khi gặp các tình huống:

- Tech stack bị yêu cầu thay đổi so với stack đã chốt.
- Role mới ngoài Admin, Staff, PT, Member được đề xuất.
- Business rule chưa rõ.
- Use case không có acceptance criteria.
- Một feature chưa rõ nằm trong core hay secondary.
- Có nhiều cách implement ảnh hưởng kiến trúc.
- Có rủi ro thêm external API/service.

Template hỏi lại:

```text
Tôi đang làm: [feature/task]
Điểm chưa rõ: [question]
Các lựa chọn: A / B
Trade-off: [...]
Đề xuất của tôi: [...]
Cần team xác nhận trước khi implement.
```

---

# 3. Quy tắc scope

- Không thêm AI image calorie như core feature.
- Nếu xử lý ảnh bữa ăn, chỉ được làm dưới dạng enhancement: gợi ý tên món/nguyên liệu, không tự định lượng calories hoàn toàn.
- Không thêm external API nếu chưa được team approve.
- Không thêm role mới ngoài Admin, Staff, PT, Member nếu chưa được team approve.
- Không thay đổi core business flow nếu chưa update docs.
- Không thêm payment gateway thật trong MVP.
- Không thêm realtime chat trong MVP.

---

# 4. Quy tắc coding chung

- Không hardcode secrets.
- Không commit `.env` hoặc credentials.
- Không để API key trong markdown.
- Không copy-paste code dài mà không hiểu.
- Không để TODO trong code merge vào main.
- Không dùng dữ liệu giả trong dashboard nếu đã có workflow tạo dữ liệu thật.
- Không bỏ qua validation.
- Không bypass role permission.

---

# 5. Git Rules

## Branch naming

```text
feat/[module]-[short-description]
fix/[module]-[bug-description]
docs/[topic]
spec/[feature]
chore/[task]
```

## Commit message

```text
feat(auth): add login form
fix(checkin): reject expired membership
docs(scope): update MVP scope
spec(calorie): add meal journal use cases
```

---

# 6. Definition of Done

Một task được done khi:

- Code chạy được local.
- Không có lỗi build.
- Có validation cho input chính.
- Có happy path được test.
- Có ít nhất 1 error case nếu task có logic nghiệp vụ.
- Không hardcode secret.
- Có commit rõ ràng.
- Có screenshot/video nếu là UI.
- Có update docs nếu thay đổi requirement hoặc business rule.

---

# 7. AI Output Review Rules

Mọi output AI phải được con người review:

- Requirement: kiểm tra đúng scope.
- Code: kiểm tra chạy được, không lộ secret.
- Database: kiểm tra quan hệ, PK/FK, naming.
- Test case: kiểm tra có đúng business rule không.
- UI: kiểm tra có đúng role/use case không.


## 11. Approved Stack

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
