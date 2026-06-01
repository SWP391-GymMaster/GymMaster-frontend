# 13 — Team Workflow

# GymMaster — Team Working Agreement

---

# 1. Working Principles

- Không merge code chưa review.
- Không tự ý đổi scope.
- Không tự ý thêm external API.
- Không lock quyết định lớn nếu chưa team vote.
- Mỗi task phải có owner.
- Mỗi feature core phải có use case và acceptance criteria.
- Demo phải chạy bằng dữ liệu thật từ workflow.

---

# 2. Git Workflow

## Branch Types

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/module-description` | `feat/member-management` |
| Fix | `fix/module-description` | `fix/checkin-expired-member` |
| Docs | `docs/topic` | `docs/update-srs` |
| Spec | `spec/feature` | `spec/calorie-tracking` |
| Chore | `chore/task` | `chore/setup-eslint` |

## Commit Format

```text
<type>(<scope>): <description>
```

Examples:

```text
feat(member): add create member form
fix(checkin): reject expired membership
docs(scope): update MVP scope
spec(calorie): add meal journal use cases
```

---

# 3. Pull Request Checklist

- [ ] PR title rõ ràng.
- [ ] Có mô tả thay đổi.
- [ ] Có link task/use case.
- [ ] Không hardcode secret.
- [ ] Có screenshot/video nếu là UI.
- [ ] Có test happy path.
- [ ] Có test error case nếu có logic.
- [ ] Có update docs nếu thay đổi requirement.
- [ ] Có ít nhất 1 reviewer.

---

# 4. Meeting Rhythm

| Meeting | Frequency | Purpose |
|---|---|---|
| Scope/Decision Meeting | Khi cần | Chốt decisions lớn |
| Weekly Planning | Mỗi tuần | Chia task, update progress |
| Mid-week Sync | 1 lần/tuần | Check blocker |
| Demo Review | Cuối phase | Demo phần đã làm |
| Retrospective | Sau milestone | Rút kinh nghiệm |

---

# 5. Task Status

| Status | Meaning |
|---|---|
| Todo | Chưa bắt đầu |
| In Progress | Đang làm |
| Review | Đang chờ review |
| Testing | Đang test |
| Done | Hoàn thành |
| Blocked | Bị chặn bởi decision/task khác |
