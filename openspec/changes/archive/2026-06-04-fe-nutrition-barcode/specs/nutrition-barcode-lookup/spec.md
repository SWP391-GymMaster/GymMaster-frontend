## ADDED Requirements

### Requirement: Barcode scanner interface
Hệ thống phải (SHALL) cung cấp nút kích hoạt máy quét mã vạch bằng camera và ô nhập mã vạch bằng tay trong bảng tìm kiếm thực phẩm của [FoodSearchPanel](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx).

#### Scenario: Kích hoạt camera quét mã vạch thành công
- **WHEN** người dùng nhấn vào biểu tượng/nút "Quét mã vạch" trong tab Tra cứu.
- **THEN** hệ thống mở Dialog/BottomSheet BarcodeScanner, yêu cầu quyền truy cập camera và hiển thị khung ngắm quét camera.

#### Scenario: Nhập mã vạch thủ công
- **WHEN** người dùng nhập mã vạch vào ô nhập barcode (ví dụ: `8934563138061`) và nhấn "Tìm kiếm".
- **THEN** hệ thống gọi hàm tra cứu thông tin sản phẩm theo mã vạch vừa nhập.

---

### Requirement: Gọi API Nutrition tự động
Hệ thống phải (SHALL) gửi yêu cầu HTTPS GET trực tiếp tới Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`) để truy vấn thông tin dinh dưỡng của sản phẩm.

#### Scenario: Tìm thấy thông tin sản phẩm và có thông số dinh dưỡng
- **WHEN** API trả về mã phản hồi `200` với thông tin sản phẩm hợp lệ chứa dữ liệu macro (calories, protein, carbs, fat).
- **THEN** hệ thống đóng Dialog máy quét và hiển thị thông tin xem trước (preview) của sản phẩm trong [MealLogForm](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/MealLogForm.tsx) với các thông số calories, protein, carbs, fat tương ứng.

#### Scenario: Không tìm thấy sản phẩm từ API
- **WHEN** API trả về mã phản hồi `404` hoặc trạng thái sản phẩm không tồn tại (`status: 0`).
- **THEN** hệ thống thông báo lỗi bằng Sonner toast "Không tìm thấy sản phẩm cho mã vạch này" và giữ giao diện để người dùng có thể nhập tay hoặc quét lại.

---

### Requirement: Chuẩn hóa dữ liệu và kiểm tra trùng lặp database
Hệ thống phải (SHALL) chuẩn hóa dữ liệu dinh dưỡng nhận được từ Open Food Facts API (giới hạn độ dài tên $\le 100$ ký tự, đơn vị $\le 30$ ký tự, calo/macros $\ge 0$) và kiểm tra xem tên thực phẩm đã tồn tại trong database trước khi thực hiện thêm mới để tránh lỗi Unique Constraint `UQ_FoodItems_Name`.

#### Scenario: Tên món ăn trùng lặp đã tồn tại trong database
- **WHEN** sản phẩm lấy từ Open Food Facts API có tên trùng với một món ăn đã có sẵn trong cơ sở dữ liệu (qua kiểm tra hàm tìm kiếm theo tên).
- **THEN** hệ thống bỏ qua bước gọi mutation tạo món mới (`POST /api/food-items`) và sử dụng trực tiếp `Id` của món ăn đã tồn tại để ghi nhận vào nhật ký bữa ăn.

#### Scenario: Tên món ăn chưa tồn tại trong database
- **WHEN** sản phẩm từ Open Food Facts API có tên chưa tồn tại trong hệ thống.
- **THEN** hệ thống hiển thị xem trước dinh dưỡng, và khi người dùng xác nhận, gọi mutation `POST /api/food-items` để tạo món ăn mới với dữ liệu đã chuẩn hóa trước khi ghi vào nhật ký.

---

### Requirement: Xác nhận và lưu thực phẩm quét được vào Meal Journal
Hệ thống phải (SHALL) cho phép người dùng điều chỉnh số lượng phần ăn (quantity), chọn loại bữa ăn (mealType), xem trước tổng lượng calo ước tính và lưu thực phẩm vào nhật ký dinh dưỡng của hội viên.

#### Scenario: Lưu thực phẩm quét từ mã vạch vào nhật ký thành công
- **WHEN** người dùng bấm nút "Ghi bữa ăn vào Nhật ký" khi đang chọn sản phẩm quét từ barcode.
- **THEN** hệ thống gọi API `POST /api/meal-logs` để ghi nhận món ăn, tự động lưu sản phẩm đó vào danh sách món ăn gần đây (Recent Foods) ở Local Storage và cập nhật biểu đồ Calorie Summary.

