# 19 — Context7 Guidelines

## 1. Mục tiêu

Context7 được dùng để lấy documentation mới nhất cho các package trong frontend stack, tránh AI tạo code theo API cũ hoặc API không tồn tại.

Áp dụng đặc biệt cho:

- Next.js
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- TanStack Table
- Playwright
- Vitest
- Recharts
- Framer Motion

## 2. Khi nào bắt buộc dùng Context7

Bắt buộc thêm `use context7` trong prompt khi:

- yêu cầu AI viết code dùng API/package cụ thể
- tạo Next.js route/middleware/server action
- tạo React Hook Form + Zod form
- tạo TanStack Query hook
- tạo TanStack Table column
- tạo Playwright test
- debug lỗi liên quan package version
- setup config

## 3. Prompt pattern

```text
Hãy tạo [component/hook/test] cho GymMaster.
Tech: [package list].
Yêu cầu dùng API đúng phiên bản hiện tại.
use context7
```

## 4. Rule kiểm tra output

Sau khi AI dùng Context7:

- vẫn phải review code
- vẫn phải chạy typecheck
- vẫn phải chạy test
- không tin tuyệt đối output AI
- nếu API lạ, kiểm tra docs/package version

## 5. Context7 không thay thế docs nội bộ

Context7 dùng cho external library docs.  
Docs nội bộ của GymMaster vẫn là source of truth cho:

- route
- role
- scope
- UX flow
- design system
- component rule
- testing gate
