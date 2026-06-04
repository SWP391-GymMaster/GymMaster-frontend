## Why

Tính năng ghi nhật ký dinh dưỡng (Meal Journal) hiện tại của GymMaster chỉ hỗ trợ tìm kiếm từ danh sách thực phẩm tĩnh được cấu hình sẵn trong mã nguồn (fallback data) hoặc người dùng tự tạo thủ công. Để nâng cao trải nghiệm người dùng tương tự như ứng dụng MyFitnessPal, hệ thống cần tích hợp khả năng quét mã vạch (Barcode Scanner) và tra cứu thông tin dinh dưỡng tự động từ các nguồn cơ sở dữ liệu dinh dưỡng mở (Free Nutrition API như Open Food Facts). Điều này giúp hội viên nhanh chóng ghi lại lượng calo, protein, carbs, và chất béo từ các sản phẩm đóng hộp mà không cần nhập thủ công các chỉ số phức tạp.

## What Changes

- **Quét mã vạch (Barcode Scanning):** Thêm tính năng quét mã vạch thông qua camera thiết bị (sử dụng WebRTC/HTML5 Canvas và Barcode Detection API hoặc thư viện JS thuần) hoặc cho phép nhập mã vạch thủ công.
- **Tích hợp Free Nutrition API:** Kết nối với Open Food Facts API (hoặc tương đương) để tự động tra cứu sản phẩm dựa trên mã vạch hoặc từ khóa tìm kiếm nâng cao khi dữ liệu tĩnh không có.
- **Bổ sung giao diện trong FoodSearchPanel:** Thêm nút quét barcode và input nhập mã vạch trong tab "Tra cứu" của [FoodSearchPanel](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx).
- **Xem trước và lưu thông tin thực phẩm quét được:** Khi quét/nhập thành công mã vạch, hệ thống hiển thị thông tin dinh dưỡng (Calories, Carbs, Protein, Fat, Serving Size) của sản phẩm để người dùng xác nhận trước khi thêm vào bữa ăn.
- **Lưu trữ thực phẩm đã quét:** Tự động lưu thực phẩm tra cứu từ API vào danh sách món ăn tùy chỉnh (Custom Foods) hoặc lịch sử (Recent Foods) ở Local Storage để tái sử dụng nhanh chóng.

## Capabilities

### New Capabilities
- `nutrition-barcode-lookup`: Tích hợp tìm kiếm thông tin dinh dưỡng qua mã vạch (quét camera/nhập tay) và gọi API Open Food Facts để lấy dữ liệu macro tự động.

### Modified Capabilities
Không có (dự án chưa có spec file tĩnh nào trong thư mục `openspec/specs/`).

## Impact

- **Frontend Components:**
  - Cập nhật [FoodSearchPanel](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx) để tích hợp nút mở camera quét mã vạch và ô nhập barcode thủ công.
  - Tạo mới component `BarcodeScannerDialog` để quản lý luồng bật camera, quét mã vạch và xử lý frame hình ảnh.
- **Frontend Services/API:**
  - Thêm client-side service trong [member-nutrition.api.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.api.ts) để gọi trực tiếp tới Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`).
- **State & Queries:**
  - Tích hợp thêm hook React Query mới trong [member-nutrition.queries.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.queries.ts) để quản lý cache kết quả tra cứu barcode.
