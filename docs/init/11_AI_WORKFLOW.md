# 11 — AI Workflow

# GymMaster — AI Workflow for Team

---

# 1. Mục tiêu dùng AI

AI được dùng để tăng tốc quá trình học và phát triển, nhưng không thay thế quyết định của team.

AI hỗ trợ trong các giai đoạn:

- Requirement.
- Design.
- Database.
- Coding.
- Debugging.
- Testing.
- Reporting.
- Presentation.

---

# 2. AI Workflow tổng quát

```text
Team xác định task
→ Viết prompt rõ context
→ AI đề xuất output
→ Thành viên review
→ Chỉnh sửa theo project scope
→ Commit/update docs
→ Ghi AI log nếu cần
```

---

# 3. AI Usage by Phase

## Phase 0 — Discovery & Docs

AI có thể hỗ trợ:

- Viết problem statement.
- Chuẩn hóa use cases.
- Gợi ý business rules.
- Gợi ý ERD.
- Review scope.
- Viết prompt cho team discussion.

## Phase 1 — Core Operation

AI có thể hỗ trợ:

- Gợi ý UI layout.
- Viết form validation.
- Gợi ý API contract.
- Debug auth flow.
- Sinh test cases cho membership/check-in/PT assignment.

Không được để AI tự thêm:

- Payment gateway.
- External notification.
- AI calorie như core feature.
- Role mới.

## Phase 2 — Progress & Nutrition

AI có thể hỗ trợ:

- Thiết kế meal journal.
- Tính daily calorie summary.
- Gợi ý database food_items/meal_logs.
- Gợi ý test cases cho nutrition.
- Review access control PT/Member.

## Phase 3 — Testing & Final

AI có thể hỗ trợ:

- Viết test cases.
- Tạo UAT checklist.
- Tạo demo script.
- Tạo final report outline.
- Viết retrospective.
- Chuẩn hóa presentation script.

---

# 4. AI Log Template

| Date | Member | Phase | Task | Tool | Prompt Summary | Output Used | Human Review | Link/Evidence |
|---|---|---|---|---|---|---|---|---|

---

# 5. AI Review Checklist

Trước khi dùng output AI:

- [ ] Có đúng scope không?
- [ ] Có tự thêm feature không?
- [ ] Có mâu thuẫn với business rules không?
- [ ] Có map được với database không?
- [ ] Có thể test được không?
- [ ] Có phù hợp timeline không?
- [ ] Có cần team approve không?


---

# 6. AI Workflow cho Image Food Recognition Assist

Nếu team approve enhancement này, AI/vision chỉ được dùng theo workflow:

```text
Ảnh bữa ăn
→ gợi ý tên món/nguyên liệu
→ map với FoodItem nếu có
→ Member xác nhận/chỉnh sửa
→ Member nhập khẩu phần
→ hệ thống tính calories từ dữ liệu đã xác nhận
```

Không được dùng AI để tự động lưu calories mà không có user confirmation.
