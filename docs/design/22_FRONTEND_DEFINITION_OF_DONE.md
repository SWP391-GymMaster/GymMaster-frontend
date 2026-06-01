# 22 — Frontend Definition of Done

Một frontend task chỉ được xem là Done khi đạt các điều kiện dưới đây.

## 1. UI/UX

- [ ] UI đúng design system.
- [ ] Dùng component shared nếu đã có.
- [ ] Không duplicate component.
- [ ] Có loading state.
- [ ] Có error state.
- [ ] Có empty state nếu là list/table/data page.
- [ ] Có feedback sau action thành công/thất bại.
- [ ] Responsive cơ bản.

## 2. Form

- [ ] Có Zod schema nếu có input quan trọng.
- [ ] Có field error message.
- [ ] Disable submit khi pending.
- [ ] Không mất dữ liệu form khi submit fail nếu có thể.
- [ ] Destructive action có confirm.

## 3. Data/API

- [ ] Data fetching dùng TanStack Query.
- [ ] Mutation có invalidate query phù hợp.
- [ ] Không hardcode mock data nếu API đã có.
- [ ] Error được normalize và hiển thị rõ.
- [ ] Role permission được xử lý.

## 4. Testing

- [ ] TypeScript pass.
- [ ] Lint pass.
- [ ] Component test nếu component/logic critical.
- [ ] Playwright flow không fail nếu task thuộc demo flow.
- [ ] Manual UAT pass.

## 5. Collaboration

- [ ] Có screenshot/video trong PR.
- [ ] Có cập nhật docs nếu đổi flow/design/API.
- [ ] PR được review.
- [ ] Không thêm package mới nếu chưa approve.
