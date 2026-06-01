# 14 — Error, Loading & Empty States

## 1. Vì sao cần

GymMaster có nhiều API và nhiều role. Nếu thiếu trạng thái loading/error/empty, UI sẽ tạo cảm giác lỗi hoặc chưa hoàn thiện.

## 2. Loading state

Dùng:

- Skeleton cho card/table.
- Button loading cho submit.
- Page loading cho route transition nếu cần.

## 3. Empty state

Các empty state cần có:

| Case | Message |
|---|---|
| No members | Chưa có hội viên nào |
| No assigned members | Bạn chưa được phân công hội viên |
| No meal logs | Chưa có bữa ăn nào hôm nay |
| No trainer notes | Chưa có ghi chú từ PT |
| No payments | Chưa có giao dịch |
| No audit logs | Chưa có audit log |

## 4. Error state

Error state cần có:

- message rõ
- retry action nếu phù hợp
- không hiện raw server error
- support contact/dev message nếu demo

## 5. Permission denied

Khi user không có quyền:

```text
Bạn không có quyền truy cập trang này.
```

Nên có button về dashboard.

## 6. Session expired

Khi token hết hạn:

```text
Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
```

Không để user mắc kẹt ở màn hình trắng.

## 7. Submit failed

Form submit lỗi:

- field error nếu do validation
- toast error nếu do server
- không mất toàn bộ dữ liệu form nếu có thể
