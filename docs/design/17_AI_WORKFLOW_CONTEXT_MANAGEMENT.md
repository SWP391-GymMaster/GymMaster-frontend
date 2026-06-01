# 17 — AI Workflow & Context Management

## 1. Mục tiêu

AI được dùng để tăng tốc frontend, nhưng phải đi theo docs và không tự ý thay đổi scope.

AI hỗ trợ:

- tạo route map
- tạo component
- tạo form schema
- tạo table column
- viết test
- review UI
- debug lỗi
- tạo task từ spec

## 2. Context rule

Trước khi yêu cầu AI code, phải cung cấp context đúng thứ tự:

```text
1. Project summary
2. Relevant role/user flow
3. Relevant route
4. Design system rule
5. Component guideline
6. API contract hoặc mock data
7. File/folder hiện tại
8. Output mong muốn
9. Điều không được làm
```

## 3. Context pack template

```text
Project: GymMaster FE
Role/page: [Admin/Staff/PT/Member]
Feature: [feature]
Route: [route]
Tech: Next.js + TS + Tailwind + shadcn/ui
Relevant docs:
- [doc names]
Existing files:
- [file paths]
API contract/mock:
- [payload]
Design rules:
- [tokens/components]
Task:
- [specific request]
Do not:
- add new library
- change design tokens
- add feature outside scope
- bypass role permission
Use Context7 for latest docs if package API is involved.
```

## 4. AI safety rules

AI không được:

- thêm library mới nếu chưa approve
- tự đổi folder structure
- tự đổi color palette
- tự thêm role/feature
- bỏ qua testing
- hardcode status color
- ignore accessibility
- generate code không type-safe
- sửa nhiều module không liên quan trong một prompt

## 5. AI output review checklist

- [ ] Có đúng route/role không?
- [ ] Có đúng design system không?
- [ ] Có dùng component shared không?
- [ ] Có validation không?
- [ ] Có loading/error/empty state không?
- [ ] Có query/mutation đúng pattern không?
- [ ] Có test nếu critical không?
- [ ] Có thêm library lạ không?
- [ ] Có thay đổi scope không?

## 6. AI log template

| Date | Member | Tool | Prompt Alias | Feature | Output Used | Human Review | PR/Commit |
|---|---|---|---|---|---|---|---|
