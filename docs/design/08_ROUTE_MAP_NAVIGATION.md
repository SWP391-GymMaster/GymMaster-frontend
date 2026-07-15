# 08 — Route Map & Role-based Navigation

> **Status: Implemented — đồng bộ theo code `src/app` ngày 2026-07-15** (Next.js App Router, route groups `(auth)/(admin)/(staff)/(pt)/(member)`). FE gọi backend `.NET` qua `apiRequest()` (base `NEXT_PUBLIC_API_BASE_URL`, mọi endpoint `/api/v1/...`); có chế độ mock (MSW) cho dev/test. Auth session giữ ở `useAuthSessionStore`. Login KHÔNG có chọn role — role suy từ token, redirect theo `redirectPath` backend trả.

## 1. Route map (đúng `src/app`)

```text
/                                     # landing → điều hướng theo phiên

# (auth) — công khai
/login
/signup
/forgot-password
/reset-password                       # nhập OTP 6 số + mật khẩu mới
/change-password
/welcome
/about

# (admin)
/admin/dashboard
/admin/users
/admin/staff
/admin/members
/admin/members/[id]                   # Member 360
/admin/trainers
/admin/packages
/admin/memberships
/admin/payments
/admin/assignments                    # phân công PT (candidates)
/admin/audit-logs
/admin/notifications
/admin/profile

# (staff)
/staff/dashboard
/staff/members
/staff/members/[id]
/staff/sell-package
/staff/renew-package
/staff/check-in
/staff/payments
/staff/profile

# (pt)
/pt/dashboard
/pt/members
/pt/members/[id]                      # Member 360 (assigned)
/pt/members/[id]/workout
/pt/members/[id]/notes
/pt/members/[id]/progress
/pt/check-in                          # check-in cho hội viên được phân công
/pt/profile

# (member)
/member/dashboard
/member/membership                    # mua/gia hạn gói + thanh toán VNPay
/member/membership/vnpay-return       # trang nhận kết quả VNPay (poll status)
/member/workout
/member/notes
/member/progress
/member/nutrition/meal-journal        # ghi bữa ăn + quét ảnh AI (Gemini)
/member/nutrition/summary             # tổng kết calo/macro theo ngày
/member/profile
/member/profile/edit
```

> Ghi chú: **Member tự check-in** không có trang riêng (nằm trong dashboard/membership). Quét ảnh món ăn AI (spec 009) nằm trong `meal-journal`. `/notifications` (admin) hiện là placeholder — backend trả rỗng.

## 2. Admin navigation
Dashboard · Users · Staff · Members · PTs · Packages · Memberships · Payments · PT Assignment · Audit Logs · Notifications · Profile

## 3. Staff navigation
Dashboard · Member Search · Sell Package · Renew Package · Check-in · Payments · Profile

## 4. PT navigation
Dashboard · Assigned Members · (per member: Workout / Notes / Progress) · Check-in · Profile

## 5. Member navigation
Dashboard · Membership (mua/gia hạn/VNPay) · Workout · Notes · Progress · Meal Journal (+ AI scan) · Calorie Summary · Profile

## 6. Permission rule
Route guard (`PermissionGuard`/`WorkspaceShell`) kiểm tra role trước khi render. Không đủ quyền → redirect hoặc hiển thị `PermissionDenied` (không chỉ ẩn menu). Phiên hết hạn (`isAuthSessionExpired`) → về `/login`.

## 7. Kiến trúc dữ liệu (tham chiếu graphify-out)
- **HTTP:** `apiRequest()` (client trung tâm) + `authHeaders()`; chuẩn hoá lỗi ở `HTTP Error Handling` (mapMemberManagementError, normalizeApiPath…).
- **State/Cache:** React Query (các `*Keys`: `adminDashboardKeys`, `ptAssignmentKeys`, `billingKeys`, `member360Keys`, `memberProgressKeys`…) + Zustand `useAuthSessionStore`.
- **Thời gian VN:** `formatVnDate()`, `vnTodayIso()` (GMT+7, khớp `AppClock` backend).
- **Tính năng nổi bật:** VNPay (`createVnpayUrl`/`getVnpayReturnStatus`), Food Scan AI (`confirmAiFood`), tìm món online phụ trợ (OpenFoodFacts/USDA — client-side), Member 360 (`getMember360Data`).
- Bản đồ chi tiết module/community: `graphify-out/GRAPH_REPORT.md` + `graph.html`.
