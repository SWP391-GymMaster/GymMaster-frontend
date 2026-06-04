## Context

Hiện tại, việc ghi nhật ký dinh dưỡng của dự án phụ thuộc vào:
1. Cơ sở dữ liệu món ăn tĩnh được định nghĩa trong [nutrition-fallback-data.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/data/nutrition-fallback-data.ts).
2. Người dùng tự tạo món ăn tùy chỉnh bằng tay (Custom Foods) và lưu vào cơ sở dữ liệu giả lập/Local Storage.

Chúng ta cần tích hợp khả năng quét mã vạch (Barcode Scanner) và gọi API dinh dưỡng mở để lấy thông tin tự động, mang lại trải nghiệm chuyên nghiệp giống như MyFitnessPal.

## Nghiên cứu Kiến trúc Backend & Ràng buộc Database (Backend Architecture Research)

Dựa trên việc kiểm tra file đặc tả database [GymMaster_SQLServer_Final.sql](file:///home/anhdaijka/Dev/projects/gym-master/docs/init/GymMaster_SQLServer_Final.sql) và đặc tả API [spec.md (007-nutrition-calorie)](file:///home/anhdaijka/Dev/projects/gym-master/docs/backend/specs/007-nutrition-calorie/spec.md), chúng tôi phát hiện các ràng buộc quan trọng của bảng `dbo.FoodItems` cần được xử lý ở Frontend để tránh xung đột hoặc lỗi hệ thống khi đồng bộ (bridge):

1. **Ràng buộc Duy nhất của Tên món ăn (`UQ_FoodItems_Name UNIQUE (Name)`):**
   - Database bắt buộc cột `Name` trong bảng `dbo.FoodItems` phải là duy nhất. Nếu Frontend gửi yêu cầu tạo món ăn với tên đã tồn tại trong DB, SQL Server sẽ trả về lỗi **Unique Constraint Violation** (lỗi 500 hoặc 409 từ API).
   - *Giải pháp:* Trước khi gọi mutation tạo món mới (`POST /api/food-items`), Frontend phải kiểm tra xem món ăn có tên tương tự đã tồn tại trong hệ thống chưa bằng cách gọi API tìm kiếm món ăn (`GET /api/food-items?query={tên_món_ăn}`). Nếu có kết quả trùng khớp chính xác (case-insensitive), hệ thống sẽ tái sử dụng `Id` của món ăn đó thay vì tạo mới.
   
2. **Giới hạn Độ dài Cột dữ liệu (Data Length Limits):**
   - Cột `Name` trong SQL Server là `NVARCHAR(150)`, tuy nhiên Schema kiểm thử Zod ở Frontend ([custom-food.schemas.ts](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/schemas/custom-food.schemas.ts)) quy định tối đa `100` ký tự.
   - Cột `Unit` trong SQL Server là `NVARCHAR(30)`.
   - *Giải pháp:* Khi trích xuất tên sản phẩm từ Open Food Facts API (thường khá dài và chứa nhiều mô tả chi tiết), Frontend phải cắt chuỗi (truncate) tên sản phẩm xuống tối đa `100` ký tự để vượt qua bộ lọc Zod, và giới hạn đơn vị tính (`unit`) tối đa `30` ký tự trước khi gửi lên API.

3. **Ràng buộc Kiểm tra Chỉ số Dinh dưỡng (`CK_FoodItems_Macros` & `CK_FoodItems_Calories`):**
   - Cột `CaloriesPerUnit` phải `>= 0`.
   - Các cột `ProteinG`, `CarbG`, `FatG` phải `>= 0`.
   - *Giải pháp:* Dữ liệu từ Open Food Facts do người dùng cộng đồng đóng góp đôi khi có thể bị nhập âm hoặc bị lỗi. Frontend phải đảm bảo chạy qua hàm lọc giá trị `Math.max(0, value)` để luôn gửi giá trị phi âm lên Backend.

4. **Trực quan hóa luồng đồng bộ:**
   ```text
   [Quét Barcode/Nhập Barcode] 
          │
          ▼
   [Gọi Open Food Facts API] ────(Không tìm thấy)────▶ [Báo lỗi / Nhập tay]
          │
      (Tìm thấy)
          ▼
   [Chuẩn hóa dữ liệu dinh dưỡng]
   - Truncate Name (max 100 ký tự)
   - Truncate Unit (max 30 ký tự)
   - Đảm bảo Calo/Macros >= 0
          │
          ▼
   [Gọi GET /api/food-items?query={name}]
          │
          ├────(Tên đã tồn tại trong DB)────▶ [Lấy Id hiện tại & Ghi vào Meal Journal]
          │
     (Chưa tồn tại)
          ▼
   [Gọi POST /api/food-items] ───────▶ [Lấy Id mới & Ghi vào Meal Journal]
   ```

## Goals / Non-Goals

**Goals:**
- Tích hợp quét mã vạch qua camera sử dụng thư viện chuyên dụng ngoài `@zxing/browser` để đảm bảo hoạt động 100% trên tất cả các trình duyệt và hệ điều hành (bao gồm cả iOS Safari, Android Chrome và Desktop).
- Cung cấp ô nhập mã vạch bằng tay (Manual Input) như một giải pháp thay thế linh hoạt.
- Gọi API của **Open Food Facts** để lấy thông tin chi tiết thực phẩm (Tên, Năng lượng, Protein, Carbs, Fat, Đơn vị/Serving Size).
- Tích hợp mượt mà với luồng hiện tại: Khi quét/tìm thấy thực phẩm qua barcode, hệ thống sẽ kiểm tra trùng lặp và tự động tạo thực phẩm đó thông qua API `createCustomFoodItem` và đưa vào danh sách chọn trong [MealLogForm](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/MealLogForm.tsx) mà không thay đổi cấu trúc dữ liệu backend hiện có.
- Trải nghiệm giao diện cao cấp: Glassmorphism, có âm thanh bíp tactile khi quét thành công, hiệu ứng khung quét (scanner overlay) động với laser màu Performance Lime.

**Non-Goals:**
- Không sử dụng các API dinh dưỡng có phí (như Nutritionix hoặc USDA cần key phức tạp).
- Không tự cài đặt các thư viện nhận diện barcode cồng kềnh, không tối ưu cho Next.js.
- Không phát triển tính năng nhận diện món ăn bằng AI từ hình ảnh (Out of scope cho MVP).

## Decisions

### 1. Nguồn cơ sở dữ liệu dinh dưỡng: Open Food Facts API
- **Lựa chọn:** Gọi trực tiếp HTTP GET đến `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`.
- **Lý do:**
  - Hoàn toàn miễn phí, không yêu cầu API Key hay đăng ký tài khoản.
  - Kho dữ liệu khổng lồ với hơn 3 triệu sản phẩm, hỗ trợ rất tốt các sản phẩm đóng hộp tại Việt Nam (mã vạch đầu `893`).
  - Dữ liệu trả về đầy đủ các chỉ số calo, protein, carbohydrate, fat trên 100g hoặc trên serving size.

### 2. Luồng tích hợp dữ liệu (Data Integration Flow)
Để không phải thay đổi cơ sở dữ liệu backend hoặc tạo các bảng dữ liệu barcode riêng biệt, chúng ta áp dụng luồng chuyển đổi thông minh:
1. Người dùng Quét mã vạch $\rightarrow$ Hệ thống gọi Open Food Facts API.
2. Nếu tìm thấy sản phẩm, hệ thống ánh xạ (map) dữ liệu từ API sang cấu trúc `CreateCustomFoodInput`:
   - `name`: Tên sản phẩm + nhãn hiệu, ví dụ: "Sữa tươi TH True Milk ít đường 180ml" (cắt chuỗi tối đa 100 ký tự).
   - `unit`: Mặc định là `"100g"` hoặc `"100ml"` để đảm bảo tính chuẩn hóa dữ liệu dinh dưỡng gốc, hoặc serving_size nếu có (cắt chuỗi tối đa 30 ký tự).
   - `caloriesPerUnit`: Năng lượng chuyển đổi sang kcal (đảm bảo `>= 0`).
   - `proteinG`, `carbsG`, `fatG`: Các chỉ số dinh dưỡng macro tương ứng (đảm bảo `>= 0`).
3. Kiểm tra trùng lặp bằng cách tìm kiếm theo tên qua `GET /api/food-items?query={name}`. Nếu tìm thấy món trùng tên hoàn toàn, chọn trực tiếp `Id` của món đó.
4. Nếu chưa trùng, hệ thống hiển thị Dialog xác nhận xem trước dinh dưỡng. Khi người dùng bấm đồng ý, hệ thống gọi mutation `createCustomFoodItem` để lưu thực phẩm này vào DB.
5. Mutation trả về `FoodItem` chứa `id` thực tế từ backend/mock database.
6. Hệ thống tự động điền `id` này vào form ghi bữa ăn [MealLogForm](file:///home/anhdaijka/Dev/projects/gym-master/src/features/member-nutrition/components/MealLogForm.tsx) và mở Sheet tùy chỉnh khẩu phần ăn như bình thường.
*Giải pháp này tận dụng 100% các API hiện có mà không cần tạo mới endpoint lưu trữ riêng.*

### 3. Phương pháp quét mã vạch: Thư viện `@zxing/browser`
- **Lựa chọn:** Cài đặt gói `@zxing/browser` và `@zxing/library` qua npm.
- **Lý do:**
  - `BarcodeDetector` API gốc của trình duyệt chỉ được hỗ trợ trên các trình duyệt nhân Chromium (Chrome, Edge), hoàn toàn không chạy được trên Safari (iOS) hay Firefox. Việc sử dụng `@zxing/browser` (thư viện JS phân tích frame hình ảnh từ camera stream) đảm bảo tính năng quét hoạt động mượt mà trên iPhone/Safari - vốn là thiết bị di động phổ biến của học viên.
  - Thư viện cung cấp hàm `BrowserMultiFormatReader` cho phép giải mã hình ảnh từ thẻ `<video>` trực tiếp, dễ dàng viết wrapper React mà không có CSS ép buộc, cho phép thiết kế giao diện Glassmorphism và laser overlay cao cấp riêng của GymMaster.
- **Dự phòng (Fallback):**
  - Cung cấp ô nhập mã vạch bằng tay (Manual Input).
  - Cung cấp danh sách các mã vạch mẫu tại Việt Nam để người dùng click trải nghiệm nhanh trên các thiết bị không có camera (ví dụ như máy tính để bàn).

## Risks / Trade-offs

- **[Risk]** Camera không có quyền truy cập hoặc camera độ phân giải thấp khó lấy nét.
  - *Mitigation:* Luôn cung cấp ô nhập mã vạch bằng tay và hiển thị hướng dẫn chi tiết kèm theo danh sách mã vạch sản phẩm mẫu để test nhanh.

- **[Risk]** Open Food Facts API trả về dữ liệu thiếu hoặc không đúng định dạng.
  - *Mitigation:* Viết hàm parser dữ liệu an toàn (safe parser), nếu thiếu chỉ số macro nào sẽ mặc định gán bằng `0`, và cho phép người dùng tự chỉnh sửa lại các thông số calo/macro trước khi lưu vào nhật ký.
- **[Risk]** API gọi từ client bị chặn CORS.
  - *Mitigation:* Open Food Facts API hỗ trợ CORS mặc định cho mọi origin từ client-side.
- **[Risk]** Lỗi xung đột tên trùng lặp nếu có 2 luồng thêm đồng thời món ăn trùng tên.
  - *Mitigation:* Triển khai bắt lỗi (catch error) khi gọi mutation tạo món. Nếu xảy ra lỗi do trùng tên, Frontend sẽ tự động thêm hậu tố `(Barcode)` hoặc tự động thực hiện truy vấn tìm kiếm lại để lấy ID món ăn đã tồn tại.

