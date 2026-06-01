# 10 — Tables, Dashboard & Charts

## 1. DataTable standard

Mọi table quản lý nên có:

```text
Search
Filter
Status filter
Pagination
Sort cơ bản
Row action menu
Loading skeleton
Empty state
Error state
```

## 2. Row action menu

Không đặt quá nhiều button trên row. Dùng dropdown:

```text
View detail
Edit
Lock/Deactivate
Delete nếu được phép
```

## 3. Core tables

| Table | Columns chính |
|---|---|
| Members | name, phone, membership status, PT, actions |
| Staff | name, phone, position, status, actions |
| PT | name, specialization, assigned members, status, actions |
| Packages | name, duration, price, status, actions |
| Payments | member, amount, status, method, paid_at |
| Audit Logs | actor, action, entity, created_at |
| Food Items | name, calories, macros, source |

## 4. Dashboard layout

Dashboard gồm 3 tầng:

```text
1. KPI cards
2. Chart chính
3. Recent activity/table
```

## 5. Admin dashboard widgets

```text
Total revenue
Active members
Expired members
Today check-ins
Pending payments
Revenue by month chart
Check-ins by day chart
Recent payments
Recent audit logs
```

## 6. PT dashboard widgets

```text
Assigned members
Today notes
Recent progress updates
Nutrition alerts nếu có
```

## 7. Member dashboard widgets

```text
Membership status
Next expiration
Current PT
Today calories
Workout plan summary
Recent notes
```

## 8. Chart rules

Dùng Recharts, không quá nhiều chart trong MVP.

Chart nên có:

- loading state
- empty state
- tooltip
- label dễ hiểu
- không cần animation phức tạp
