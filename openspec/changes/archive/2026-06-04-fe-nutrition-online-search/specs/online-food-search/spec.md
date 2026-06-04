## ADDED Requirements

### Requirement: Kích hoạt tìm kiếm trực tuyến chủ động
Hệ thống phải (SHALL) hiển thị nút cho phép người dùng kích hoạt tìm kiếm trực tuyến trên Open Food Facts từ khóa đang gõ, để tránh việc tự động gửi request liên tục làm vượt quá giới hạn Rate Limit (10 requests/phút) của API.

#### Scenario: Kích hoạt tìm kiếm khi kết quả cục bộ trống
- **WHEN** người dùng gõ từ khóa không có trong database cục bộ và hệ thống hiển thị bảng trống.
- **THEN** hệ thống hiển thị nút "Tìm kiếm trực tuyến cho '{query}'".
- **WHEN** người dùng click vào nút này.
- **THEN** hệ thống bắt đầu gửi yêu cầu tra cứu tới API Open Food Facts.

#### Scenario: Kích hoạt tìm kiếm khi có sẵn kết quả cục bộ
- **WHEN** hệ thống hiển thị kết quả khớp cục bộ.
- **THEN** hệ thống vẫn hiển thị một liên kết nhỏ ở cuối danh sách: "Tìm kiếm thêm trên Open Food Facts cho '{query}'".
- **WHEN** người dùng click liên kết.
- **THEN** hệ thống gửi yêu cầu tra cứu tới API Open Food Facts.

---

### Requirement: Gọi API tìm kiếm văn bản Open Food Facts
Hệ thống phải (SHALL) gửi yêu cầu HTTPS GET tới API tìm kiếm của Open Food Facts và phân tích phản hồi để hiển thị kết quả.

#### Scenario: Tìm thấy sản phẩm khớp trực tuyến
- **WHEN** API trả về danh sách sản phẩm.
- **THEN** hệ thống hiển thị danh sách sản phẩm dưới mục "Kết quả trực tuyến từ Open Food Facts". Mỗi sản phẩm hiển thị đầy đủ tên (brands), serving size, calo và macros.

#### Scenario: Không tìm thấy sản phẩm trực tuyến nào
- **WHEN** API trả về danh sách sản phẩm trống.
- **THEN** hệ thống hiển thị thông báo "Không tìm thấy sản phẩm nào trên cơ sở dữ liệu mở. Bạn có thể tự tạo món ăn mới."

---

### Requirement: Xem trước, lưu và chọn thực phẩm trực tuyến
Hệ thống phải (SHALL) cho phép người dùng chọn một sản phẩm trực tuyến, xem trước dinh dưỡng, chỉnh sửa và xác nhận lưu món ăn đó vào database trước khi ghi vào nhật ký.

#### Scenario: Lưu và chọn món ăn trực tuyến thành công
- **WHEN** người dùng click chọn một món ăn trực tuyến.
- **THEN** hệ thống hiển thị Dialog xem trước dinh dưỡng của sản phẩm đó.
- **WHEN** người dùng nhấn "Xác nhận và Chọn".
- **THEN** hệ thống kiểm tra trùng lặp tên trong database, nếu chưa trùng thì tạo món mới (`POST /api/food-items`), lưu vào Local Storage custom list, đóng Dialog và tự động chọn món ăn này cho form nhật ký bữa ăn.
