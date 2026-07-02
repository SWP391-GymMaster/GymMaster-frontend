"use client"

import Link from "next/link"
import { useMemo, useState, type FormEvent } from "react"
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MoreHorizontal,
  Phone,
  Search,
  UserPlus,
  UsersRound,
} from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"
import { useStaffMemberSearch } from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { staffSearchSchema } from "@/features/staff-front-desk/schemas/staff-front-desk.schemas"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"
import { toStatusPillStatus } from "@/features/staff-front-desk/utils/staff-status"
import type { StaffFrontDeskMemberSummary } from "@/features/staff-front-desk/types/staff-front-desk.types"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function MemberSearchPanel() {
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [validationMessage, setValidationMessage] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const search = useStaffMemberSearch(submittedQuery)
  const members = search.data?.items ?? []
  const selectedMember = members.find((member) => member.id === selectedId) ?? members[0] ?? null

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = staffSearchSchema.safeParse({ query })

    if (!parsed.success) {
      setValidationMessage(parsed.error.issues[0]?.message ?? "Từ khóa tìm kiếm không hợp lệ.")
      return
    }

    setValidationMessage("")
    setSubmittedQuery(parsed.data.query)
    setSelectedId(null)
  }

  const error = search.error ? mapStaffOperationError(search.error) : null
  const hasSearched = submittedQuery.length >= 2

  const metrics = useMemo(() => {
    const active = members.filter((member) => member.membershipStatus === "active").length
    const expired = members.filter((member) => member.membershipStatus === "expired").length
    const pending = members.filter((member) => member.membershipStatus === "pending").length

    return [
      { label: "Tổng kết quả", value: members.length, helper: "Trong kết quả tìm kiếm", icon: UsersRound },
      { label: "Active", value: active, helper: "Có gói còn hiệu lực", icon: CheckCircle2 },
      { label: "Sắp/hết hạn", value: expired, helper: "Cần gia hạn", icon: CalendarDays },
      { label: "Pending", value: pending, helper: "Chờ thanh toán", icon: UserPlus },
    ]
  }, [members])

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <ContextCard
          label="Ngữ cảnh tìm kiếm"
          title={submittedQuery ? `Từ khóa: ${submittedQuery}` : "Chưa nhập từ khóa"}
        />
        <ContextCard label="Gói tập & trạng thái" title="Tất cả gói tập" />
        <ContextCard label="Bước tiếp theo" title="Chọn hội viên để xem chi tiết" />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            helper={metric.helper}
            icon={metric.icon}
            key={metric.label}
            label={metric.label}
            value={String(metric.value)}
          />
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="gm-panel overflow-hidden">
          <div className="border-b border-border p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Member CRM
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Danh sách hội viên
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý hồ sơ, gói tập, trạng thái và lịch sử hoạt động của hội viên.
            </p>
          </div>

          <div className="border-b border-border p-5">
            <form className="flex flex-col gap-3 md:flex-row" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="staff-member-search">
                Tìm hội viên
              </label>
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  className="gm-field min-h-12 w-full pl-12 pr-4 text-sm text-foreground transition placeholder:text-muted-foreground"
                  data-testid="staff-member-search-input"
                  data-shortcut-search
                  id="staff-member-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tên, email, số điện thoại hoặc mã hội viên"
                  value={query}
                />
              </div>
              <Button
                className="min-h-12 rounded-xl bg-primary px-6 text-primary-foreground hover:brightness-95"
                data-testid="staff-member-search-button"
                type="submit"
              >
                Tìm
              </Button>
            </form>

            {validationMessage ? (
              <p className="mt-3 text-sm font-medium text-destructive">{validationMessage}</p>
            ) : null}
          </div>

          <div className="p-5">
            {search.isLoading ? (
              <StateBlock
                description="Đang đối chiếu hồ sơ hội viên theo contract backend."
                title="Đang tải kết quả..."
                tone="loading"
              />
            ) : null}

            {error ? (
              <StateBlock
                description="Thử lại hoặc kiểm tra giá trị tra cứu trước khi tiếp tục."
                title={error.message}
                tone="error"
              />
            ) : null}

            {hasSearched && members.length === 0 ? (
              <StateBlock
                description="Kiểm tra chính tả hoặc tạo hội viên mới từ workflow lễ tân đã duyệt."
                title="Không tìm thấy hội viên."
                tone="empty"
              />
            ) : null}

            {!hasSearched ? (
              <StateBlock
                description="Kết quả dùng contract member từ backend/MSW."
                title="Nhập ít nhất hai ký tự để tìm."
                tone="empty"
              />
            ) : null}

            {members.length ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <span>Hội viên</span>
                  <span>Liên hệ</span>
                  <span>Gói tập</span>
                  <span>Trạng thái</span>
                  <span className="text-right">Thao tác</span>
                </div>
                <div className="divide-y divide-border">
                  {members.map((member) => (
                    <button
                      className="grid w-full grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto] items-center gap-4 px-4 py-4 text-left transition hover:bg-muted/35 data-[selected=true]:bg-primary/5"
                      data-selected={selectedMember?.id === member.id}
                      data-testid="staff-member-result"
                      key={member.id}
                      onClick={() => setSelectedId(member.id)}
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials(member.fullName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-foreground">
                            {member.fullName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {member.email}
                          </span>
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">{member.phone}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.currentPackageName ?? "Chưa có"}
                      </span>
                      <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
                      <span className="flex justify-end gap-2">
                        <Link
                          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                          href={staffRoutes.memberDetail(member.id)}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Mở hồ sơ
                        </Link>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <MemberPreview member={selectedMember} />
      </div>
    </div>
  )
}

function ContextCard({ label, title }: { label: string; title: string }) {
  return (
    <section className="gm-panel p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</p>
    </section>
  )
}

function MetricCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string
  icon: typeof UsersRound
  label: string
  value: string
}) {
  return (
    <section className="gm-panel p-5">
      <div className="flex items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
    </section>
  )
}

function MemberPreview({
  member,
}: {
  member: StaffFrontDeskMemberSummary | null
}) {
  if (!member) {
    return (
      <aside className="gm-panel p-6">
        <StateBlock
          description="Tìm và chọn một hội viên để xem member 360 nhanh."
          title="Chưa chọn hội viên"
          tone="empty"
        />
      </aside>
    )
  }

  return (
    <aside className="gm-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Member 360°
          </p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">Thông tin hội viên</h3>
        </div>
        <button className="text-muted-foreground" type="button">
          <MoreHorizontal aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4">
          <span className="relative flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {initials(member.fullName)}
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-primary ring-2 ring-card" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-semibold text-foreground">{member.fullName}</p>
              <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{member.memberCode}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <PreviewRow icon={CreditCard} label="Gói hiện tại" value={member.currentPackageName ?? "Chưa có"} />
          <PreviewRow icon={Phone} label="Số điện thoại" value={member.phone} />
          <PreviewRow icon={CalendarDays} label="Hết hạn" value={member.membershipEndsAt ?? "Chưa có"} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
            href={staffRoutes.checkIn}
          >
            Check-in
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
            href={staffRoutes.memberDetail(member.id)}
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </aside>
  )
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CreditCard
  label: string
  value: string
}) {
  return (
    <div className="gm-panel-muted flex items-center gap-3 p-3">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}
