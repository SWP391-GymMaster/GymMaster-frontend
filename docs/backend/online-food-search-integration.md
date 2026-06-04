# Tài liệu Tích hợp & Thiết kế Hệ thống: Tìm kiếm Thực phẩm Trực tuyến (Online Food Search)

Tài liệu này đặc tả chi tiết thiết kế kỹ thuật, luồng dữ liệu và đề xuất tối ưu hóa (Server-side Cache & Crawl) cho tính năng **Tìm kiếm Thực phẩm Trực tuyến (Online Food Search)**. Đây là tài liệu bàn giao dành cho đội ngũ phát triển Backend (BE) để phối hợp nâng cấp hệ thống.

---

## 1. Tổng quan Tính năng (Overview)

Tính năng **Online Food Search** cho phép hội viên tra cứu thông tin dinh dưỡng (Calories, Carbs, Protein, Fat, Serving Unit) từ cơ sở dữ liệu mở quốc tế **Open Food Facts** khi tìm kiếm bằng từ khóa hoặc quét mã vạch (Barcode), đóng vai trò làm cơ chế tìm kiếm bổ trợ (fallback) khi cơ sở dữ liệu nội bộ (`Local DB`) chưa có thông tin sản phẩm.

### Thách thức hiện tại:
- **Rate Limit của Open Food Facts API**: Giới hạn **10 requests/phút** đối với endpoint tìm kiếm bằng từ khóa. Nếu vượt quá giới hạn này, IP của hệ thống/người dùng sẽ bị chặn tạm thời (HTTP `429 Too Many Requests`).
- **Ràng buộc Duy nhất (Unique Constraint)**: Bảng món ăn nội bộ có ràng buộc duy nhất trên tên món ăn (`UQ_FoodItems_Name`). Việc tạo trùng tên sẽ gây lỗi crash database.

---

## 2. Luồng Nghiệp vụ Hiện tại (Client-side Flow)

Hiện tại, Frontend đã triển khai luồng xử lý độc lập để kiểm soát rate limit:
1. **Tìm kiếm Cục bộ (Local Search)**: Gọi API nội bộ `/api/food-items?query={query}`.
2. **Kích hoạt Tìm trực tuyến bằng tay (Manual Trigger)**:
   - Nếu kết quả cục bộ trống hoặc không có món mong muốn, người dùng nhấn nút hoặc link để kích hoạt tìm kiếm trực tuyến.
   - Tránh việc tự động tìm kiếm khi gõ (search-as-you-type) nhằm bảo vệ hệ thống khỏi bị rate limit.
3. **Mở Hộp thoại Xem trước (Preview Dialog)**: Khi người dùng chọn một sản phẩm trực tuyến, thông tin sản phẩm được đưa vào Dialog để người dùng kiểm tra và điều chỉnh.
4. **Kiểm tra Trùng lặp & Lưu**: Trước khi lưu, client gọi API kiểm tra xem tên món ăn đó đã tồn tại trong Local DB chưa:
   - Nếu **đã tồn tại**: Tự động chọn món ăn có sẵn.
   - Nếu **chưa tồn tại**: Gọi mutation tạo món ăn tùy chỉnh (`POST /api/food-items`), sau đó chọn món vừa tạo.

---

## 3. Kiến trúc Đề xuất: Caching & Crawling phía Server-side

Để giải quyết triệt để giới hạn 10 requests/phút và cải thiện hiệu năng tìm kiếm, chúng tôi đề xuất team Backend xây dựng một lớp **Proxy & Cache Layer** thay thế cho việc Frontend gọi trực tiếp Open Food Facts API.

### Luồng Hoạt động Đề xuất (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor User as Hội viên (Client)
    participant BE as Backend API
    participant Cache as Redis (Cache)
    participant DB as Database (Local DB)
    participant OFF as Open Food Facts API

    User->>BE: GET /api/food-items/online-search?query={keyword}
    BE->>Cache: Kiểm tra cache của từ khóa {keyword}?
    
    alt Cache Hit (Có sẵn trong Redis)
        Cache-->>BE: Trả về danh sách sản phẩm mock/đã crawl
        BE-->>User: HTTP 200 OK (Kết quả tìm kiếm)
    else Cache Miss (Chưa có trong Redis)
        BE->>OFF: Gọi API tìm kiếm của Open Food Facts (Bọc trong try-catch)
        alt OFF API Thành công
            OFF-->>BE: JSON chứa danh sách sản phẩm
            BE->>Cache: Lưu kết quả vào Redis (TTL: 24 giờ)
            BE-->>User: HTTP 200 OK (Kết quả tìm kiếm)
        alt OFF API Bị Rate Limit (429) hoặc Lỗi
            BE->>DB: Fallback tìm kiếm tương đối trong Database nội bộ
            DB-->>BE: Danh sách món ăn
            BE-->>User: HTTP 200 OK (Danh sách dự phòng)
        end
    end
```

### Chi tiết các bước tối ưu hóa phía Backend:

1. **Redis Cache cho Từ khóa**:
   - Khi nhận yêu cầu tìm kiếm trực tuyến, Backend kiểm tra trong Redis với key `online-search:{query_normalized}`.
   - Thời gian sống (TTL) khuyến nghị: **24 giờ** (hoặc 7 ngày) vì dữ liệu dinh dưỡng của các sản phẩm đóng hộp ít khi thay đổi liên tục.

2. **Cơ chế Crawl & Auto-Save (Lưu trữ lâu dài)**:
   - Khi người dùng thực hiện **Xác nhận và Chọn** sản phẩm trực tuyến thành công, hệ thống sẽ thực hiện lưu món ăn đó vào cơ sở dữ liệu chính (`Database`).
   - Lần sau, món ăn này sẽ xuất hiện ngay trong kết quả tìm kiếm cục bộ (`GET /api/food-items`), không cần phải kích hoạt tìm kiếm trực tuyến nữa. Hệ thống tự động được làm giàu (enrich) dữ liệu món ăn theo thời gian dựa vào hành vi của người dùng.

3. **Xoay vòng Nhà cung cấp (Fallback Provider Rotation)**:
   - Nếu gọi API Open Food Facts bị lỗi rate limit hoặc timeout, Backend có thể tự động gọi dự phòng sang **USDA FoodData Central API** (giới hạn 1,000 requests/giờ rất thoải mái) để lấy thông tin các nguyên liệu thô cơ bản.

---

## 4. Chi tiết API Open Food Facts dành cho Backend

Nếu team Backend tiếp quản việc gọi API trực tuyến, dưới đây là các endpoint và cấu trúc dữ liệu cần sử dụng:

### 4.1. API Tìm kiếm bằng Từ khóa (Text Search)
- **Endpoint**: 
  `GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1`
- **Method**: `GET`
- **Headers**: Khuyến nghị thêm `User-Agent` rõ ràng (tên ứng dụng + email liên hệ) để OFF tăng hạn mức và không chặn IP.
  *Ví dụ:* `User-Agent: GymMasterApp - Web - Version 1.0 - admin@gymmaster.local`

### 4.2. API Tra cứu mã vạch (Barcode Lookup)
- **Endpoint**: 
  `GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- **Method**: `GET`

### 4.3. Định dạng và Ánh xạ dữ liệu (Data Mapping Rules)
Dữ liệu trả về từ Open Food Facts cần được chuẩn hóa trước khi lưu hoặc gửi về Client.

#### Quy tắc làm sạch dữ liệu (Data Cleaning Constraints):
1. **Tên thực phẩm (`name`)**: Tối đa **100 ký tự** (giới hạn của Database).
   - *Cách xử lý:* Lấy ưu tiên `product_name_vi` $\rightarrow$ `product_name` $\rightarrow$ `brands` (nếu có để phân biệt hãng). Nếu dài quá 100 ký tự, thực hiện cắt chuỗi lấy 97 ký tự đầu + `"..."`.
2. **Đơn vị tính (`unit`)**: Tối đa **30 ký tự**.
   - *Cách xử lý:* Lấy trường `serving_size` (nếu có), mặc định nếu không có là `"100g"`. Nếu dài quá 30 ký tự, thực hiện cắt lấy 27 ký tự đầu + `"..."`.
3. **Các chỉ số dinh dưỡng (Macros & Calories)**: Phải đảm bảo **$\ge 0$**.
   - Lấy trường năng lượng: `energy-kcal_100g` hoặc `energy-kcal_serving`.
   - Lấy Protein: `proteins_100g` hoặc `proteins_serving`.
   - Lấy Carbohydrates: `carbohydrates_100g` hoặc `carbohydrates_serving`.
   - Lấy Fat: `fat_100g` hoặc `fat_serving`.
   - Tất cả giá trị số cần bọc qua hàm `Math.max(0, value)` để tránh dữ liệu rác âm từ API cộng đồng.

---

## 5. Ràng buộc Database trên Backend (Unique Constraints)

Team Backend cần đặc biệt lưu ý khi thiết kế API ghi nhận món ăn tùy chỉnh (`POST /api/food-items`):
- Hệ thống database đang có index unique trên tên món ăn (`UQ_FoodItems_Name`).
- **Giải pháp xử lý:** Khi nhận request lưu thực phẩm trực tuyến từ client, Backend nên thực hiện hành vi **Find or Create** (Tìm kiếm trước theo tên, nếu đã có thì trả về món ăn có sẵn, nếu chưa có mới tiến hành tạo mới) thay vì cố tạo và throw lỗi trùng lặp `500 Internal Server Error`.
