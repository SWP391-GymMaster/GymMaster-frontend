# 14 — Prompt Library

# GymMaster — Prompt Library for AI Workflow

---

# 1. Requirement Prompt

```text
Bạn là Business Analyst cho dự án GymMaster.
Bối cảnh: hệ thống quản lý phòng gym, core flow gồm membership, check-in, PT assignment, workout plan, progress tracking, meal journal, dashboard.
Module: [module name]
Scope: [scope]
Không đề xuất tính năng ngoài scope.
Hãy viết use case theo format:
- Objective
- Actor
- Trigger
- Pre-condition
- Main Flow
- Exception Flow
- Acceptance Criteria
- Related Tables
```

---

# 2. Database Prompt

```text
Bạn là database designer cho dự án GymMaster.
Module: [module name]
Use cases liên quan: [list]
Hãy đề xuất bảng, columns chính, PK/FK, constraints và relationship.
Tech stack: Next.js frontend, ASP.NET Core 8 Web API backend, MySQL, EF Core 8 Code First.
Không thêm bảng cho AI image calorie nếu không thuộc enhancement.
Output dạng markdown table.
```

---

# 3. Test Case Prompt

```text
Bạn là QA cho dự án GymMaster.
Module: [module name]
Business rules:
[list rules]
Hãy viết test cases gồm:
- Test ID
- Scenario
- Preconditions
- Steps
- Expected Result
Bao gồm happy path, error case và boundary case.
```

---

# 4. Code Review Prompt

```text
Bạn là senior reviewer cho dự án GymMaster.
Hãy review đoạn code sau theo checklist:
- Có đúng business rule không?
- Có validation không?
- Có hardcode secret không?
- Có vi phạm role permission không?
- Có dễ maintain không?
- Có edge case nào thiếu không?
Code:
[paste code]
```

---

# 5. Debug Prompt

```text
Tôi đang debug module [module] của GymMaster.
Expected behavior: [...]
Actual behavior: [...]
Error message/log: [...]
Code liên quan: [...]
Hãy giúp tôi phân tích nguyên nhân có thể, cách kiểm tra và hướng sửa.
Không đề xuất đổi scope hoặc thêm external service.
```

---

# 6. Presentation Prompt

```text
Bạn là mentor hỗ trợ thuyết trình SWP.
Dự án: GymMaster.
Core demo flow:
Admin bán gói → Member check-in → Admin assign PT → PT tạo plan/note → Member xem progress/meal journal → Admin xem dashboard.
Hãy viết script thuyết trình 10 phút, chia theo thành viên, rõ phần demo và điểm kỹ thuật.
```


---

# 7. Image Food Recognition Assist Prompt

```text
Bạn là BA/solution designer cho dự án GymMaster.
Tính năng: Image Food Recognition Assist.
Giới hạn:
- Đây là enhancement sau secondary, không phải core.
- AI/vision chỉ dùng để gợi ý tên món hoặc nguyên liệu từ ảnh.
- Không tự động định lượng calories từ ảnh.
- User phải xác nhận/chỉnh sửa món và nhập khẩu phần.
- Calories được tính từ FoodItem/CustomFood và quantity.
Hãy viết use case, database impact, fallback flow và test cases.
```
