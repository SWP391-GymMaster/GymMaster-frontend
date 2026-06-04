## 1. Cơ sở hạ tầng & API Integration

- [x] 1.1 Thực hiện cài đặt các thư viện quét barcode bên ngoài (`npm install @zxing/browser @zxing/library`).
- [x] 1.2 Khai báo API Client kết nối với Open Food Facts trong [member-nutrition.api.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.api.ts).
- [x] 1.3 Tạo hook React Query `useFoodBarcodeLookup` để quản lý luồng query và cache kết quả quét trong [member-nutrition.queries.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.queries.ts).
- [x] 1.4 Thiết lập danh sách mã vạch mẫu tại Việt Nam (Sample Barcodes) phục vụ demo trong [nutrition-fallback-data.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/data/nutrition-fallback-data.ts).


## 2. Xây dựng Giao diện (UI Components)

- [x] 2.1 Tạo component `BarcodeScannerDialog` hỗ trợ camera stream (Canvas processing) và nhập mã vạch bằng tay tại [BarcodeScannerDialog.tsx](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/BarcodeScannerDialog.tsx).
- [x] 2.2 Tích hợp nút quét mã vạch và ô nhập barcode thủ công vào component `FoodSearchPanel` tại [FoodSearchPanel.tsx](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx).

## 3. Luồng Nghiệp vụ & Trạng thái (Business Logic & State integration)

- [x] 3.1 Cập nhật `FoodSearchPanel` để khi tìm thấy sản phẩm từ mã vạch, hệ thống hiển thị Dialog xem trước các chỉ số dinh dưỡng (Calories, Protein, Carbs, Fat) và cho phép bấm chọn.
- [x] 3.2 Tích hợp luồng lưu tự động: thực hiện kiểm tra trùng tên bằng `searchFoodItems` trước khi gọi mutation `createCustomFoodItem` (để tránh lỗi Unique Constraint `UQ_FoodItems_Name`), và truyền ID kết quả vào [MealLogForm.tsx](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/MealLogForm.tsx).


## 4. Kiểm thử & Đảm bảo Chất lượng (Testing & QA)

- [x] 4.1 Viết unit test cho component `BarcodeScannerDialog` trong `src/tests/member-nutrition/barcode-scanner.test.tsx`.
- [x] 4.2 Viết Playwright E2E test mô phỏng luồng nhập mã vạch và lưu bữa ăn thành công trong `src/tests/e2e/nutrition-barcode.spec.ts`.
- [x] 4.3 Thực hiện kiểm tra typecheck (`npm run typecheck`) và lint (`npm run lint`).
