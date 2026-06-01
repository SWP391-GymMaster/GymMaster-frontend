# 11 — State, API & Data Fetching

## 1. State ownership

| Loại state | Tool |
|---|---|
| Server data | TanStack Query |
| Form state | React Hook Form |
| Local UI state | useState/useReducer |
| Global UI state nhỏ | Zustand |
| URL filters | Search params |

Không dùng Redux trong MVP.

## 2. API client

`lib/api/http-client.ts` nên xử lý:

- baseURL
- auth token attach
- refresh token nếu frontend chịu trách nhiệm
- response unwrap
- error normalize

## 3. API response format kỳ vọng

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "errors": []
}
```

## 4. Query key convention

```ts
export const queryKeys = {
  members: {
    all: ['members'],
    list: (filters) => ['members', 'list', filters],
    detail: (id) => ['members', 'detail', id],
  },
};
```

## 5. Mutation rule

Sau mutation:

```text
Create/update/delete
→ show toast
→ invalidate relevant query
→ close modal/form
→ optional redirect
```

## 6. Error handling

API error phải map về:

```text
message
fieldErrors nếu có
status code
```

Không hiển thị raw stack trace cho user.

## 7. Mock strategy

Khi backend chưa sẵn sàng:

- tạo mock data trong `mocks/data`
- tạo mock handler bằng MSW nếu cần
- giữ interface giống API thật
- không để mock data hardcode trong page
