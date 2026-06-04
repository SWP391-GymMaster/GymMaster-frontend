# UX/UI Design: Online Food Search

## Interface Layout

Chúng ta sẽ tích hợp nút hành động tìm kiếm trực tuyến trực tiếp vào tab "Tra cứu" của [FoodSearchPanel.tsx](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/FoodSearchPanel.tsx).

### 1. Nút kích hoạt tìm kiếm trực tuyến (Online Search Trigger Button)
- Vị trí:
  - Nếu tìm kiếm cục bộ trả về danh sách trống: Nút này hiển thị lớn ngay dưới thông báo trống.
  - Nếu tìm kiếm cục bộ có kết quả: Hiển thị một nút liên kết nhỏ ở cuối danh sách kết quả: *"Tìm kiếm trực tuyến cho '{query}' 🌐"*.
- Kiểu dáng:
  - Nền mờ Chalk/Mist với viền nét đứt hoặc viền mỏng (`border border-dashed border-primary/40`).
  - Màu sắc chữ: Primary accent (Performance Lime / Dark graphite text).
  - Hover state: Chuyển màu nền nhẹ (`bg-primary/5`), nâng nhẹ (`-translate-y-0.5`).
  - Phản hồi nhấn: `active:scale-[0.98]`.

### 2. Trạng thái tải dữ liệu (Loading State)
- Khi đang truy vấn API Open Food Facts:
  - Nút chuyển sang trạng thái disabled.
  - Hiển thị spinner xoay tròn nhỏ bên cạnh chữ *"Đang tìm kiếm trực tuyến..."*.

### 3. Hiển thị danh sách kết quả trực tuyến (Online Results List)
- Hiển thị dưới một tiêu đề phụ phân tách rõ ràng:
  `Kết quả trực tuyến từ Open Food Facts` (in chữ nhỏ, màu nhạt, chữ hoa đậm nét).
- Các thẻ sản phẩm trực tuyến (Online Card items):
  - Kích thước và bố cục giống thẻ sản phẩm nội bộ để đảm bảo tính nhất quán (radii `rounded-xl`).
  - Có thêm biểu tượng quả địa cầu hoặc nhãn *"Online"* nhỏ màu Steel/Cyan bên cạnh tên để phân biệt với thực phẩm có sẵn trong phòng gym.
  - Khi người dùng click chọn: Mở Dialog xem trước dinh dưỡng của sản phẩm.

## Radii & Interaction Standards
- **Outer container / inner card radius:** `rounded-xl` / `rounded-2xl`
- **CTAs:** `rounded-full` (hoặc `rounded-xl` cho các nút điều khiển form)
- **Transitions:** 150-250ms cubic-bezier.
- **Color Tokens:**
  - Steel/Cyan cho nhãn thông tin Online.
  - Performance Lime cho focus ring và hover background tint.
