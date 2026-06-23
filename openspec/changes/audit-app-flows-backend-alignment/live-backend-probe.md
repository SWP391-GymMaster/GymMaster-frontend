# Live Backend Probe - Sanitized

> Scope: safe discovery against the configured `NEXT_PUBLIC_API_BASE_URL` from `.env.local`. Host, token, secret, and full env values are intentionally not stored. No mutating business endpoint was called.

## Summary

- Backend base is configured and reachable.
- `GET /` returns JSON with `app,status` keys.
- Public Swagger/OpenAPI paths were not exposed; common Swagger/OpenAPI/ReDoc/Scalar paths returned `404`.
- `POST /api/v1/auth/login` with invalid credentials returns a GymMaster JSON envelope with `INVALID_CREDENTIALS`.
- Most frontend `GET /api/v1/**` assumptions return empty `401` without credentials, which indicates the routes are likely registered and protected.
- Nutrition online/barcode routes return `404`, including both `/api/v1/food-items/...` and docs-style `/api/food-items/...` paths.

## Documentation Discovery

| Method/Path | Result | Notes |
|---|---|---|
| `GET /swagger/v1/swagger.json` | `404` | No public Swagger JSON at common ASP.NET path. |
| `GET /swagger/index.html` | `404` | No public Swagger UI at common path. |
| `GET /openapi.json` | `404` | No public OpenAPI JSON at root path. |
| `GET /api-docs` | `404` | No public api-docs path. |
| `GET /docs` | `404` | No public docs path. |
| `GET /swagger-ui.html` | `404` | No public Swagger UI alternate path. |
| `GET /swagger-ui/index.html` | `404` | No public Swagger UI alternate path. |
| `GET /redoc` | `404` | No public ReDoc path. |
| `GET /scalar` | `404` | No public Scalar path. |
| `GET /api/swagger/v1/swagger.json` | `404` | No nested Swagger JSON path. |

## Safe Endpoint Surface Probe

| Area | Method/Path | Live result | Notes |
|---|---|---|---|
| Root | `GET /` | `200 application/json` | JSON keys: `app,status`. |
| Auth login | `POST /api/v1/auth/login` | `401 application/json` | Invalid credentials return JSON envelope with `INVALID_CREDENTIALS`. |
| Auth me | `GET /api/v1/auth/me` | `401 text/html`, empty body | Protected route. |
| Packages | `GET /api/v1/packages` | `401 text/html`, empty body | Protected route. |
| Memberships | `GET /api/v1/memberships` | `401 text/html`, empty body | Protected route. |
| Check-ins | `GET /api/v1/checkins` | `401 text/html`, empty body | Protected route. |
| Members search | `GET /api/v1/members?query=an&page=1` | `401 text/html`, empty body | Protected route. |
| Member detail | `GET /api/v1/members/101` | `401 text/html`, empty body | Protected route. |
| Payments | `GET /api/v1/payments` | `401 text/html`, empty body | Protected route. |
| Payments summary | `GET /api/v1/payments/summary` | `401 text/html`, empty body | Protected route. |
| Member payments | `GET /api/v1/members/101/payments` | `401 text/html`, empty body | Protected route. |
| Member check-ins | `GET /api/v1/members/101/checkins` | `401 text/html`, empty body | Protected route. |
| Users | `GET /api/v1/users` | `401 text/html`, empty body | Protected route. |
| Trainers | `GET /api/v1/trainers` | `401 text/html`, empty body | Protected route. |
| Assignment member candidates | `GET /api/v1/assignments/candidates/members?query=an` | `401 text/html`, empty body | Protected route. |
| Assignment trainer candidates | `GET /api/v1/assignments/candidates/trainers?query=an` | `401 text/html`, empty body | Protected route. |
| PT assigned members | `GET /api/v1/pt/members` | `401 text/html`, empty body | Protected route. |
| Member workout plans | `GET /api/v1/members/101/workout-plans` | `401 text/html`, empty body | Protected route. |
| Member notes | `GET /api/v1/members/101/notes` | `401 text/html`, empty body | Protected route. |
| Member self workout plans | `GET /api/v1/members/me/workout-plans` | `401 text/html`, empty body | Protected route. |
| Member self notes | `GET /api/v1/members/me/notes` | `401 text/html`, empty body | Protected route. |
| Member 360 canonical | `GET /api/v1/members/101/profile-360` | `401 text/html`, empty body | Protected route. |
| Member 360 alias | `GET /api/v1/members/101/360` | `401 text/html`, empty body | Protected route. |
| Progress | `GET /api/v1/members/101/progress` | `401 text/html`, empty body | Protected route. |
| Dashboard | `GET /api/v1/dashboard/summary` | `401 text/html`, empty body | Protected route. |
| Audit logs | `GET /api/v1/audit-logs` | `401 text/html`, empty body | Protected route. |
| Food items v1 | `GET /api/v1/food-items?query=rice&page=1` | `401 text/html`, empty body | Protected route. |
| Food online v1 | `GET /api/v1/food-items/online-search?query=rice&page=1&pageSize=10` | `404 text/html`, empty body | Missing route or different path. |
| Food barcode v1 | `GET /api/v1/food-items/barcode/8934673573058` | `404 text/html`, empty body | Missing route or different path. |
| Food items docs path | `GET /api/food-items?query=rice&page=1` | `404 text/html`, empty body | Docs path is not active at configured base. |
| Food online docs path | `GET /api/food-items/online-search?query=rice&page=1&pageSize=10` | `404 text/html`, empty body | Docs path is not active at configured base. |
| Food barcode docs path | `GET /api/food-items/barcode/8934673573058` | `404 text/html`, empty body | Docs path is not active at configured base. |
| Meal logs | `GET /api/v1/meal-logs?memberId=101&date=2026-06-23` | `401 text/html`, empty body | Protected route. |
| Calorie summary | `GET /api/v1/members/101/calorie-summary?date=2026-06-23` | `401 text/html`, empty body | Protected route. |
| Calorie history | `GET /api/v1/members/101/calorie-history?from=2026-06-01&to=2026-06-23` | `401 text/html`, empty body | Protected route. |
| Notifications | `GET /api/v1/notifications?role=admin` | `401 text/html`, empty body | Protected route. |

## Interpretation

`401` without credentials is not proof that DTOs and business rules match, but it is enough to confirm many route paths are registered and protected. Mutation flows, RBAC/ownership behavior, payload shape, and success DTOs still require valid role tokens or official backend route documentation.
