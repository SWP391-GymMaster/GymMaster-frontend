## 1. Cơ sở hạ tầng & API Integration

- [x] 1.1 Khai báo hàm `searchFoodOnline` trong [member-nutrition.api.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.api.ts) để gọi Open Food Facts text search API: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1`.
- [x] 1.2 Tạo hook React Query `useFoodOnlineSearch(query)` trong [member-nutrition.queries.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.queries.ts) để quản lý luồng query tìm kiếm trực tuyến.

## 2. Xây dựng Giao diện (UI Components)

- [x] 2.1 Cập nhật `FoodSearchPanel.tsx` để hiển thị nút kích hoạt tìm kiếm trực tuyến khi người dùng gõ từ khóa.
- [x] 2.2 Hiển thị spinner và trạng thái disabled khi đang gọi API tìm kiếm trực tuyến.
- [x] 2.3 Hiển thị danh sách kết quả trực tuyến nhận được dưới tiêu đề phân tách riêng biệt: "Kết quả trực tuyến từ Open Food Facts".

## 3. Luồng Nghiệp vụ & Trạng thái (Business Logic & State integration)

- [x] 3.1 Cấu hình hành động click chọn món trực tuyến: mở Dialog xem trước dinh dưỡng tương tự như barcode.
- [x] 3.2 Tích hợp luồng lưu tự động: kiểm tra trùng tên bằng `searchFoodItems` trước khi gọi mutation `createCustomFoodItem` và tự động chọn món vừa tạo/tìm thấy.

## 4. Kiểm thử & Đảm bảo Chất lượng (Testing & QA)

- [x] 4.1 Viết unit test trong `src/tests/member-nutrition/online-food-search.test.tsx` kiểm thử hoạt động tìm kiếm trực tuyến, bấm nút trigger, render kết quả và callback chọn sản phẩm.
- [x] 4.2 Viết Playwright E2E test trong `src/tests/e2e/nutrition-online-search.spec.ts` kiểm thử luồng gõ tìm kiếm -> bấm nút tìm trực tuyến -> xem trước -> lưu và ghi nhận thành công bữa ăn.
- [x] 4.3 Thực hiện chạy kiểm tra typecheck (`npm run typecheck`) và lint (`npm run lint`).
