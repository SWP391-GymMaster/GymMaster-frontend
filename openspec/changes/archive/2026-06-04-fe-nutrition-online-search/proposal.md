# Proposal: Online Food Search (Open Food Facts Text API)

## Goal
Tích hợp thêm tính năng tìm kiếm món ăn trực tuyến từ kho dữ liệu mở **Open Food Facts** khi người dùng gõ từ khóa tìm kiếm trong [FoodSearchPanel](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx), mang lại trải nghiệm tra cứu rộng rãi như MyFitnessPal nhưng vẫn đảm bảo tính ổn định và tuân thủ giới hạn lượt gọi (Rate Limit) của API bên ngoài.

## Technical Design

### 1. Tránh Rate Limit bằng Tìm kiếm Chủ động (Explicit Search Trigger)
- API tìm kiếm văn bản của Open Food Facts giới hạn **10 requests/phút**.
- Để tránh bị khóa IP do cơ chế tự động tìm khi gõ chữ (search-as-you-type), chúng ta **sẽ không** tự động gửi request lên Open Food Facts khi người dùng đang nhập từ khóa.
- Thay vào đó, chúng ta hiển thị một nút hành động rõ ràng dưới danh sách kết quả cục bộ:
  `"Không tìm thấy món bạn cần? Tìm kiếm trực tuyến cho '{query}'"` hoặc hiển thị một nút tìm kiếm trực tuyến riêng biệt.
- Yêu cầu API chỉ được kích hoạt khi người dùng chủ động click vào nút này.

### 2. Tích hợp API Client & React Query
- Khai báo API tìm kiếm văn bản trong `member-nutrition.api.ts`:
  `https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1`
- Tạo hook React Query `useFoodOnlineSearch(query)` trong `member-nutrition.queries.ts`, chỉ được `enabled` khi người dùng nhấn nút kích hoạt tìm kiếm trực tuyến.
- Phản hồi từ API chứa danh sách `products`. Mỗi sản phẩm sẽ được chuẩn hóa:
  - Tên sản phẩm = `product_name_vi` hoặc `product_name` + `brands` (cắt tối đa 100 ký tự).
  - Đơn vị tính = `serving_size` (cắt tối đa 30 ký tự, mặc định "100g").
  - Calo và các chỉ số dinh dưỡng $\ge 0$.

### 3. Giao diện người dùng (UI Flow)
- Hiển thị kết quả tìm kiếm trực tuyến trong tab "Tra cứu" của [FoodSearchPanel.tsx](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx) dưới dạng một mục riêng: *"Kết quả trực tuyến từ Open Food Facts"*.
- Khi nhấn chọn một sản phẩm từ kết quả trực tuyến, hệ thống sẽ mở **Dialog xem trước dinh dưỡng** (tương tự như luồng quét mã vạch).
- Người dùng có thể xem, chỉnh sửa thông số dinh dưỡng và xác nhận.
- Hệ thống kiểm tra trùng tên (Unique Constraint `UQ_FoodItems_Name`) trước khi tạo món mới qua mutation `createCustomFoodItem`. Sau đó tự động chọn món ăn này cho form nhật ký bữa ăn.

## Technical Tasks
- Cập nhật [member-nutrition.api.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.api.ts) để thêm hàm `searchFoodOnline`.
- Cập nhật [member-nutrition.queries.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/api/member-nutrition.queries.ts) để thêm hook `useFoodOnlineSearch`.
- Cập nhật [FoodSearchPanel.tsx](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx) để thêm nút hành động tìm kiếm trực tuyến và render kết quả từ API.
- Viết unit tests và E2E tests kiểm chứng toàn bộ luồng tìm kiếm trực tuyến.
