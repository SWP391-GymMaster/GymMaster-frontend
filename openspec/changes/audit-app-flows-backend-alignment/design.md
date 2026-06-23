## Context

GymMaster Frontend đang có đủ nhiều phần để cần audit theo flow thay vì chỉ đọc từng file riêng lẻ: route trong `src/app`, API client theo feature trong `src/features/**/api`, MSW handlers trong `src/mocks`, test ở `src/tests`, và source-of-truth trong `AGENTS.md`, `docs/init/`, `docs/backend/`, `docs/design/`.

Hiện trạng ban đầu:

- MVP route/page đã có cho auth, admin, staff, PT, member dashboard, membership, workout, notes, progress, meal journal, calorie summary.
- Một số route trong source-of-truth chưa thấy page runtime tương ứng, nổi bật là `/member/check-in`, `/member/nutrition`, `/member/nutrition/food-search`, `/member/profile`, và các nested route PT workout/notes/progress/nutrition dưới `/pt/members/[id]`.
- API clients đang dùng nhiều endpoint `/api/v1/**`; phần lớn contract cụ thể hiện nằm trong mock/MSW và docs init, không phải tài liệu backend riêng cho từng module.
- `docs/backend/online-food-search-integration.md` là backend contract cụ thể nhất hiện có cho nutrition online/barcode.
- Test coverage nội bộ khá rộng, nhưng cần tách rõ "mock/MSW pass" với "đã verify live backend".

## Goals / Non-Goals

**Goals:**

- Tạo framework audit theo từng module/flow, ưu tiên MVP trước secondary.
- So khớp frontend với source-of-truth product, backend expectation, route map, API response shape, RBAC, error handling, UI states, và test coverage.
- Sinh bảng đánh giá ưu tiên để owner review trước khi audit sâu hoặc sửa code.
- Giữ mọi finding có evidence path, owner nghi vấn, bước verify, và khuyến nghị tiếp theo.
- Dùng OpenSpec làm nơi theo dõi audit và review gate.

**Non-Goals:**

- Không sửa code runtime, route, API client, test, config, hoặc dependency trong bước review này.
- Không giả định backend live đúng/sai nếu chưa có log, Swagger/OpenAPI, hoặc chạy API thật.
- Không thay thế docs/backend còn thiếu bằng suy đoán; thiếu contract sẽ được đánh dấu là risk.
- Không mở rộng scope MVP sang AI vision, booking, payment gateway, hoặc notification nâng cao.

## Decisions

### Decision 1: Audit theo flow nghiệp vụ, không theo folder

Audit sẽ nhóm theo flow: Auth, Member Management, Membership/Payment, Check-in, PT Assignment, PT Training, Member 360, Progress, Nutrition, Dashboard/Audit, Notifications, và Cross-cutting API/RBAC/Test.

Rationale: Bug demo thường xuất hiện ở đường đi end-to-end giữa UI, API client, mock/backend, guard, và test. Audit theo folder dễ bỏ sót lệch contract giữa các lớp.

Alternative considered: audit theo từng folder `src/features/*`. Cách này tốt để inventory nhưng kém hơn cho việc ưu tiên rủi ro demo.

### Decision 2: Source-of-truth precedence rõ ràng

Thứ tự so khớp:

1. `AGENTS.md` cho rule bắt buộc của repo.
2. `docs/init/` cho product scope, use case, acceptance, database/business rules.
3. `docs/backend/` cho endpoint/RBAC/error contract cụ thể.
4. `docs/design/` cho route, UX state, frontend data fetching, testing.
5. Code hiện tại trong `src/`, `src/mocks`, `src/tests`.

Rationale: Repo có nhiều tài liệu lịch sử; audit cần ưu tiên rule mới nhất và tránh kéo UI/runtime theo spec cũ.

### Decision 3: Dùng rubric P0-P3

- `P0 - Blocker`: có thể làm fail auth, demo core flow, security/RBAC, hoặc không thể tích hợp backend thật.
- `P1 - High`: có thể làm fail module MVP, lệch API/error/business rule quan trọng, hoặc thiếu route/state chính.
- `P2 - Medium`: ảnh hưởng secondary, consistency, UX/test confidence, hoặc cần canonicalize contract.
- `P3 - Low`: housekeeping, docs hygiene, polish, hoặc rủi ro thấp cho demo.

Rationale: Owner cần review thứ tự xử lý trước. Priority phải phản ánh blast radius demo hơn là số lượng file.

### Decision 4: Mỗi finding phải có evidence và verify step

Mỗi dòng audit matrix sẽ có:

- Module/flow.
- Evidence path trong repo hoặc lỗi/log do owner cung cấp.
- Rủi ro/nghi vấn.
- Suspected owner: FE, BE, Both, Config, hoặc Docs.
- Verification step.
- Recommendation.

Rationale: Bảng này dùng để quyết định việc tiếp theo; thiếu verify step sẽ biến audit thành nhận xét chung chung.

### Decision 5: Tách mock pass và live backend pass

Audit sẽ ghi riêng:

- "MSW/mock hiện có" nếu chỉ thấy handler/test mock.
- "Backend contract documented" nếu có docs/backend hoặc Swagger/OpenAPI.
- "Live backend verified" chỉ khi có chạy API thật hoặc log từ backend.

Rationale: Nhiều test pass vẫn có thể fail khi đổi từ mock sang backend thật do path, response shape, status code, hoặc auth header.

## Risks / Trade-offs

- [Risk] Backend docs chưa đủ cho mọi endpoint -> [Mitigation] đánh dấu "contract gap" và yêu cầu Swagger/OpenAPI/log trước khi kết luận backend sai.
- [Risk] Audit quá rộng, mất trọng tâm -> [Mitigation] ưu tiên P0/P1 theo demo path trước, secondary sau.
- [Risk] Route thiếu có thể là intentional staging -> [Mitigation] phân loại "missing vs staged" và chờ owner xác nhận trước khi tạo fix tasks.
- [Risk] OpenSpec artifacts đang bị `.gitignore` bỏ qua -> [Mitigation] nhắc owner quyết định track/unignore nếu muốn review qua git/PR.
- [Risk] Live API cần credential/backend đang chạy -> [Mitigation] để bước verify live backend thành task riêng, không block bảng review ban đầu.

## Migration Plan

Không có migration runtime ở bước này. Sau khi owner review bảng ưu tiên:

1. Chốt module/flow cần audit sâu hoặc fix trước.
2. Tạo hoặc cập nhật OpenSpec change riêng cho từng fix có rủi ro cao.
3. Chỉ implement sau khi proposal/tasks được duyệt.
4. Run targeted checks trước, sau đó mở rộng typecheck/lint/test/e2e theo blast radius.

## Open Questions

- Owner có muốn `openspec/` được track trong git không, hay chỉ dùng local planning artifact?
- Backend có Swagger/OpenAPI hoặc collection Postman/Bruno mới nhất để audit contract chính xác hơn không?
- Ưu tiên review theo demo script nào trước: Staff core ops, Admin assignment/audit, PT training, hay Member nutrition?
