# Tài liệu Tích hợp & Thiết kế Hệ thống: Tìm kiếm Thực phẩm Trực tuyến (Online Food Search)

Tài liệu này đặc tả chi tiết thiết kế kỹ thuật, luồng dữ liệu và đề xuất tối ưu hóa (Server-side Cache & Crawl) cho tính năng **Tìm kiếm Thực phẩm Trực tuyến (Online Food Search)**. Đây là tài liệu bàn giao dành cho đội ngũ phát triển Backend (BE) để phối hợp nâng cấp hệ thống.

---

## 1. Tổng quan Tính năng (Overview)

Tính năng **Online Food Search** cho phép hội viên tra cứu thông tin dinh dưỡng (Calories, Carbs, Protein, Fat, Serving Unit) từ cơ sở dữ liệu mở quốc tế **Open Food Facts** khi tìm kiếm bằng từ khóa, đóng vai trò làm cơ chế tìm kiếm bổ trợ (fallback) khi cơ sở dữ liệu nội bộ (`Local DB`) chưa có thông tin sản phẩm.

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

### 4.2. Định dạng và Ánh xạ dữ liệu (Data Mapping Rules)
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

---

## 6. Đề xuất Endpoint API mới cho Backend (Proxy Layer)

Để Frontend không còn phụ thuộc trực tiếp vào Open Food Facts, team Backend nên xây dựng một endpoint Proxy/Cache như sau. FE chỉ cần gọi một endpoint nội bộ duy nhất.

### 6.1. Tìm kiếm thực phẩm trực tuyến (Search Proxy)

```
GET /api/food-items/online-search?query={keyword}&page={page}&pageSize={size}
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| `query` | `string` | ✅ | — | Từ khóa tìm kiếm (tối thiểu 2 ký tự) |
| `page` | `number` | ❌ | `1` | Trang hiện tại |
| `pageSize` | `number` | ❌ | `10` | Số lượng kết quả tối đa mỗi trang |
| `source` | `string` | ❌ | `"auto"` | Buộc dùng provider: `"off"` (Open Food Facts), `"usda"`, `"auto"` |

**Response thành công (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "Sữa tươi TH True Milk ít đường (TH True Milk)",
        "unit": "180ml",
        "caloriesPerUnit": 70,
        "proteinG": 3.0,
        "carbsG": 7.5,
        "fatG": 3.3,
        "source": "open-food-facts",
        "externalId": "8936079015707",
        "imageUrl": "https://images.openfoodfacts.org/..."
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 10,
    "cached": true,
    "provider": "open-food-facts"
  },
  "error": null
}
```

**Các trường đặc biệt trong Response:**
- `source`: Nhà cung cấp dữ liệu (`"open-food-facts"` | `"usda"` | `"local-db"`). FE dùng để hiển thị badge nguồn dữ liệu.
- `cached`: `true` nếu kết quả được lấy từ Redis cache, giúp FE có thể hiển thị thông tin "Kết quả đã được lưu đệm".
- `externalId`: Mã sản phẩm từ nguồn bên ngoài (`fdcId` của USDA). Dùng để lookup chi tiết sau này.

---

### 6.2. Lưu thực phẩm từ nguồn trực tuyến (Confirm & Save)

Endpoint này thực hiện **Find or Create** pattern — kiểm tra tên trùng trước, nếu đã tồn tại thì trả về bản ghi cũ thay vì báo lỗi.

```
POST /api/food-items
```

**Request Body:**
```json
{
  "name": "Sữa tươi TH True Milk ít đường (TH True Milk)",
  "unit": "180ml",
  "caloriesPerUnit": 70,
  "proteinG": 3.0,
  "carbsG": 7.5,
  "fatG": 3.3,
  "source": "open-food-facts",
  "externalId": "8936079015707"
}
```

**Response khi tạo mới thành công (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 33704,
    "name": "Sữa tươi TH True Milk ít đường (TH True Milk)",
    "unit": "180ml",
    "caloriesPerUnit": 70,
    "proteinG": 3.0,
    "carbsG": 7.5,
    "fatG": 3.3
  },
  "error": null
}
```

**Response khi tên đã tồn tại (200 OK — Find, không tạo mới):**
```json
{
  "success": true,
  "data": {
    "id": 15864,
    "name": "Sữa tươi TH True Milk ít đường (TH True Milk)",
    "unit": "180ml",
    "caloriesPerUnit": 70,
    "proteinG": 3.0,
    "carbsG": 7.5,
    "fatG": 3.3
  },
  "error": null,
  "meta": {
    "found_existing": true
  }
}
```

> [!IMPORTANT]
> Đây là điểm khác biệt quan trọng: endpoint này **không bao giờ** trả về `409 Conflict` hay `500 Internal Server Error` cho trường hợp trùng tên. FE sử dụng trường `meta.found_existing = true` để hiển thị toast phù hợp ("Tìm thấy món ăn có sẵn" thay vì "Đã lưu thực phẩm mới").

---

## 7. So sánh chi tiết các API Dinh dưỡng thay thế (Fallback Providers)

Bảng so sánh đầy đủ để team Backend quyết định chiến lược tích hợp:

| Tiêu chí | Open Food Facts | USDA FoodData Central | FatSecret | Edamam |
|---|---|---|---|---|
| **Giới hạn Free Tier** | 10 req/phút (text search) | 1,000 req/giờ | 5,000 req/ngày | ~10,000/tháng |
| **API Key** | Không cần | Cần (miễn phí) | Cần (đăng ký thủ công) | Cần (đăng ký) |
| **Dữ liệu Việt Nam** | ⭐⭐⭐⭐ (crowdsource) | ⭐ (Mỹ là chính) | ⭐⭐⭐ | ⭐ |
| **Thực phẩm đóng gói** | ✅ (rất mạnh) | ⚠️ (có nhưng giới hạn) | ✅ | ⚠️ |
| **Thực phẩm thô/nguyên liệu** | ⚠️ | ✅ (rất mạnh) | ⚠️ | ✅ |
| **Giấy phép dữ liệu** | Open Database License | Public Domain (CC0) | Cần Attribution | Cần Attribution |
| **Attribution bắt buộc** | Khuyến khích | Không | ✅ Bắt buộc | ✅ Bắt buộc |
| **Chi phí Scale-up** | Miễn phí hoàn toàn | Miễn phí hoàn toàn | Trả phí | Trả phí nhanh |
| **Khuyến nghị dùng** | Provider chính | Fallback tốt nhất | Tùy chọn | Không khuyến nghị |

### Chiến lược Fallback đề xuất theo thứ tự ưu tiên:

```
1. Open Food Facts  →  Dữ liệu Việt Nam phong phú, miễn phí
2. USDA FoodData    →  Fallback cho thực phẩm thô/nguyên liệu (gà, cá, rau...)
3. Local DB Fuzzy   →  Fallback cuối: tìm kiếm mờ trong database nội bộ
```

---

## 8. Chiến lược Rate Limiting & Caching phía Server

### 8.1. Cấu trúc Redis Key

```
# Key chuẩn cho text search (normalize trước khi hash)
online-search:{sha256(query_normalized)}

# Ví dụ cụ thể
online-search:a3f9d1...  (hash của "sữa tươi")
```

**Quy tắc normalize query trước khi tạo cache key:**
1. Lowercase toàn bộ chuỗi.
2. Loại bỏ dấu câu, ký tự đặc biệt.
3. Trim và chuẩn hóa khoảng trắng (collapse multiple spaces).
4. Giữ nguyên dấu tiếng Việt (quan trọng: `sữa` ≠ `sua`).

### 8.2. TTL (Time-To-Live) khuyến nghị

| Loại Cache | TTL | Lý do |
|---|---|---|
| Text Search Results | **24 giờ** | Dữ liệu tìm kiếm ít thay đổi |
| USDA Search Results | **30 ngày** | Dữ liệu khoa học cực kỳ ổn định |
| Negative Cache (không có kết quả) | **1 giờ** | Tránh spam query vô ích |

> **Negative Cache**: Khi cả OFF lẫn USDA đều không có kết quả cho từ khóa, Backend nên lưu cache kết quả rỗng (`[]`) với TTL ngắn (1 giờ) để tránh gọi lại API bên ngoài cho cùng một từ khóa trong thời gian ngắn.

### 8.3. Luồng xử lý Rate Limit trong code Backend (Pseudocode)

```python
async def search_food_online(query: str, page: int = 1):
    cache_key = f"online-search:{sha256(normalize(query))}"

    # 1. Kiểm tra Redis Cache
    cached = await redis.get(cache_key)
    if cached:
        return parse(cached), source="cache"

    # 2. Gọi Open Food Facts với retry + timeout
    try:
        results = await off_client.search(query, timeout=5s)
        await redis.setex(cache_key, ttl=86400, value=serialize(results))
        return results, source="open-food-facts"

    except RateLimitError:  # HTTP 429
        # 3. Fallback sang USDA
        try:
            results = await usda_client.search(query, timeout=5s)
            await redis.setex(cache_key, ttl=86400 * 7, value=serialize(results))
            return results, source="usda"
        except Exception:
            pass  # USDA cũng fail

    except TimeoutError:
        pass  # Timeout, bỏ qua

    # 4. Fallback cuối: tìm kiếm mờ trong Local DB
    results = await db.food_items.fuzzy_search(query, limit=10)
    return results, source="local-db"
```

---

## 9. Xử lý Lỗi & Error Codes

Tất cả các lỗi từ endpoint tìm kiếm trực tuyến phải tuân theo cấu trúc response chuẩn của hệ thống. Dưới đây là bảng các mã lỗi đặc thù của feature này:

| HTTP Status | Error Code | Mô tả | Hành động phía FE |
|---|---|---|---|
| `200` | — | Thành công | Hiển thị danh sách kết quả |
| `200` | — | Thành công nhưng rỗng (`items: []`) | Hiển thị "Không tìm thấy kết quả" |
| `400` | `QUERY_TOO_SHORT` | Từ khóa < 2 ký tự | Hiển thị validation hint |
| `401` | `UNAUTHORIZED` | Token hết hạn hoặc thiếu | Redirect về Login |
| `403` | `FORBIDDEN` | Role không có quyền | Hiển thị permission denied |
| `429` | `RATE_LIMITED` | Vượt quá rate limit (hệ thống) | Toast cảnh báo, vẫn trả về fallback |
| `503` | `EXTERNAL_API_UNAVAILABLE` | OFF và USDA đều down | Toast lỗi, fallback về local DB |
| `500` | `INTERNAL_ERROR` | Lỗi không xác định | Toast lỗi generic |

> [!NOTE]
> Trong hầu hết các trường hợp lỗi kết nối với API bên ngoài (`429`, `503`), Backend **không nên** trả về lỗi về FE mà phải tự động fallback về `local-db` và trả về `200 OK`. Chỉ trả về lỗi khi cả ba tầng (OFF → USDA → Local DB) đều thất bại.

---

## 10. Lộ trình Tích hợp (Migration Roadmap)

### Giai đoạn hiện tại (Phase 0 — Đang chạy)
- FE gọi trực tiếp Open Food Facts API từ trình duyệt client.
- Kiểm soát rate limit bằng cách yêu cầu người dùng bấm thủ công (không auto-trigger).
- FE tự xử lý logic "Find or Create" khi lưu sản phẩm.
- ✅ Hoạt động ổn định, phù hợp cho môi trường demo/staging.

### Phase 1 — Backend Proxy (Khuyến nghị triển khai trước)
**Mục tiêu**: Chuyển việc gọi Open Food Facts từ FE sang BE.

| Công việc | Ước tính |
|---|---|
| Tạo endpoint `GET /api/food-items/online-search` | 1–2 ngày |
| Tích hợp Redis Cache với TTL | 1 ngày |
| Cập nhật FE để gọi endpoint nội bộ thay vì OFF trực tiếp | 0.5 ngày |
| **Tổng** | **~2.5 ngày** |

**Lợi ích đạt được sau Phase 1:**
- API Key và IP server không bị rate limit theo từng user.
- FE không còn lộ thông tin gọi API bên ngoài trong Network tab của Browser.
- Cache tập trung tại server, mọi hội viên đều hưởng lợi từ cache của nhau.

### Phase 2 — USDA Fallback + Auto-Enrich
**Mục tiêu**: Tự động làm giàu dữ liệu Local DB khi hội viên xác nhận chọn sản phẩm.

| Công việc | Ước tính |
|---|---|
| Tích hợp USDA FoodData Central API | 1 ngày |
| Implement Fallback chain (OFF → USDA → Local) | 1 ngày |
| Auto-save sản phẩm xác nhận vào Local DB | 0.5 ngày |
| Migrate `POST /api/food-items` sang "Find or Create" | 0.5 ngày |
| **Tổng** | **~3 ngày** |

### Phase 3 — Future / Không bắt buộc
- Tìm kiếm ngữ nghĩa (semantic/fuzzy search) trong Local DB bằng Elasticsearch hoặc full-text search của SQL Server.
- Dashboard Admin xem báo cáo các sản phẩm trực tuyến phổ biến được tra cứu nhiều nhất.
- Batch crawl định kỳ (cron job) để làm giàu database nội bộ chủ động thay vì chờ hội viên tra cứu.

---

## 11. Biến Môi trường cần thêm (Environment Variables)

Team Backend cần thêm các biến sau vào cấu hình môi trường khi triển khai Phase 1 & 2:

```env
# Open Food Facts
OFF_API_BASE_URL=https://world.openfoodfacts.org
OFF_USER_AGENT=GymMasterApp - Web - v1.0 - admin@gymmaster.local
OFF_REQUEST_TIMEOUT_MS=5000

# USDA FoodData Central (đăng ký miễn phí tại https://fdc.nal.usda.gov/api-guide.html)
USDA_API_KEY=your_usda_api_key_here
USDA_API_BASE_URL=https://api.nal.usda.gov/fdc/v1
USDA_REQUEST_TIMEOUT_MS=5000

# Redis Cache
REDIS_URL=redis://localhost:6379
FOOD_SEARCH_CACHE_TTL_SECONDS=86400
NEGATIVE_CACHE_TTL_SECONDS=3600

# Feature Flags
ONLINE_FOOD_SEARCH_ENABLED=true
USDA_FALLBACK_ENABLED=true
```

**Link đăng ký API Key miễn phí:**
- USDA FoodData Central: https://fdc.nal.usda.gov/api-guide.html
- Open Food Facts: Không cần API Key (chỉ cần User-Agent)

---

*Tài liệu được tạo bởi Frontend Team — GymMaster SWP391.*  
*Phiên bản: 1.1 | Ngày cập nhật: 2026-06-04*
