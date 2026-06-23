## Why

GymMaster đã có nhiều flow MVP chạy song song giữa route UI, feature API client, MSW mock, tài liệu `docs/init/`, `docs/backend/`, và một số OpenSpec đã archive. Cần một audit có cấu trúc để phát hiện sớm flaw, lệch backend contract, thiếu state/test/RBAC, hoặc sai scope trước khi tiếp tục implement/fix.

Audit này ưu tiên demo stability: những rủi ro có thể làm login, role redirect, bán/gia hạn gói, check-in, phân công PT, workout/note, nutrition, dashboard/audit log bị fail sẽ được đưa lên trước để owner review và quyết định thứ tự xử lý.

## What Changes

- Tạo một OpenSpec change để quản lý audit module/flow toàn app theo SDD, chưa implement fix runtime.
- Sinh bảng đánh giá ưu tiên theo từng module/flow, gồm: mức ưu tiên, bằng chứng, rủi ro, phía nghi vấn chịu trách nhiệm (FE/BE/Both/Config), cách verify, và khuyến nghị tiếp theo.
- Chuẩn hóa tiêu chí audit:
  - So route/page hiện có với route map và MVP scope trong `AGENTS.md` + `docs/init/`.
  - So feature API client/MSW mock với backend contract đã có trong `docs/backend/` và API expectation trong docs.
  - So auth/RBAC/session/error handling với yêu cầu product/backend.
  - So loading/error/empty/success/permission states và test coverage với Definition of Done.
- Dừng ở review gate: owner xem bảng ưu tiên trước, sau đó mới chọn module/flow để audit sâu hoặc fix.
- Không thêm dependency, không đổi route, không đổi API, không sửa UI/runtime trong change này.

## Capabilities

### New Capabilities

- `app-flow-backend-audit`: Quy định quy trình và đầu ra của audit module/flow GymMaster giữa frontend, backend contract, mock data, RBAC, UI state, và test coverage.

### Modified Capabilities

- None. Các spec hiện có như `online-food-search` và `nutrition-barcode-lookup` chỉ là đối tượng audit; change này chưa đổi requirement của chúng.

## Impact

- Affected docs/planning:
  - `openspec/changes/audit-app-flows-backend-alignment/proposal.md`
  - `openspec/changes/audit-app-flows-backend-alignment/design.md`
  - `openspec/changes/audit-app-flows-backend-alignment/specs/app-flow-backend-audit/spec.md`
  - `openspec/changes/audit-app-flows-backend-alignment/tasks.md`
  - `openspec/changes/audit-app-flows-backend-alignment/audit-matrix.md`
- Affected review surface:
  - Routes under `src/app/(auth)`, `(admin)`, `(staff)`, `(pt)`, `(member)`.
  - Feature API clients under `src/features/**/api`.
  - Auth/session and API infrastructure under `src/features/auth/**` and `src/lib/api`.
  - MSW handlers under `src/mocks`.
  - Source-of-truth docs under `docs/init/`, `docs/backend/`, `docs/design/`.
  - Existing tests under `src/tests`, `tests`, or repo-local test folders if present.
- No runtime code, package, schema, or backend change is included before owner approval.
