"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Dumbbell,
  NotebookPen,
  ScanLine,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import {
  usePtAssignedMembers,
  usePtTodayCheckIns,
} from "@/features/pt-dashboard/api/pt-dashboard.queries"
import { cn } from "@/lib/utils"
import { formatVnTime } from "@/lib/date/vn-time"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function PtDashboardContent() {
  const [search, setSearch] = useState("")
  const membersQuery = usePtAssignedMembers()
  const todayQuery = usePtTodayCheckIns()

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data])
  const todayCheckIns = useMemo(() => todayQuery.data ?? [], [todayQuery.data])

  // memberId -> gio check-in dau tien hom nay (de hien "da den hom nay").
  const checkedInToday = useMemo(() => {
    const map = new Map<number, string>()
    for (const record of todayCheckIns) {
      if (!map.has(record.memberId)) {
        map.set(record.memberId, record.checkInAt)
      }
    }
    return map
  }, [todayCheckIns])

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return members
    return members.filter(
      (member) =>
        member.fullName.toLowerCase().includes(query) ||
        member.memberCode.toLowerCase().includes(query) ||
        (member.phone && member.phone.includes(query)),
    )
  }, [members, search])

  // Danh sach hoi vien da check-in hom nay (kem gio) — du lieu that tu /pt/checkins/today.
  const todayAttendance = useMemo(() => {
    return members
      .filter((member) => checkedInToday.has(member.id))
      .map((member) => ({ member, checkInAt: checkedInToday.get(member.id)! }))
      .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt))
  }, [members, checkedInToday])

  if (membersQuery.error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">
          {membersQuery.error instanceof Error
            ? membersQuery.error.message
            : "Không thể tải danh sách hội viên."}
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:brightness-95 active:scale-[0.97]"
          onClick={() => membersQuery.refetch()}
          type="button"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (membersQuery.isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="gm-panel p-5"
              key={i}
            >
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="gm-panel h-80 animate-pulse" />
          <div className="gm-panel h-80 animate-pulse" />
        </div>
      </div>
    )
  }

  const activeCount = members.filter((member) => member.status === "active").length
  const followUpCount = Math.max(members.length - activeCount, 0)
  const todayCount = todayAttendance.length

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <CoachSummaryCard
          helper="Được admin phân công"
          icon={Users}
          label="Hội viên"
          value={String(members.length)}
        />
        <CoachSummaryCard
          helper="Có gói active"
          icon={CheckCircle2}
          label="Đang active"
          tone="success"
          value={String(activeCount)}
        />
        <CoachSummaryCard
          helper="Chưa có gói active"
          icon={NotebookPen}
          label="Cần theo dõi"
          tone="warning"
          value={String(followUpCount)}
        />
        <CoachSummaryCard
          helper="Học viên đã đến hôm nay"
          icon={ShieldCheck}
          label="Check-in hôm nay"
          tone="info"
          value={String(todayCount)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="gm-panel relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Coach Command Center
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Quản lý học viên, giáo án và ghi chú trong một workspace rõ ràng.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Mở hồ sơ 360, điểm danh học viên, tạo giáo án và ghi chú sau buổi tập mà không mất ngữ cảnh huấn luyện.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/pt/members"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
              >
                <Users aria-hidden="true" className="size-4" />
                Xem hội viên
              </Link>
              <Link
                href="/pt/check-in"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
              >
                <ScanLine aria-hidden="true" className="size-4" />
                Điểm danh học viên
              </Link>
            </div>
          </div>
        </div>

        <aside className="gm-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Đã đến hôm nay</p>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {todayCount}/{members.length}
            </span>
          </div>

          {todayAttendance.length > 0 ? (
            <div className="mt-4 space-y-2">
              {todayAttendance.map(({ member, checkInAt }) => (
                <div
                  className="gm-panel-muted flex items-center gap-3 p-3"
                  key={member.id}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(member.fullName)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {member.fullName}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock aria-hidden="true" className="size-3.5" />
                    {formatVnTime(checkInAt, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <Clock aria-hidden="true" className="size-4" />
              Chưa có học viên check-in hôm nay.
            </div>
          )}

          <div className="gm-panel-muted mt-6 p-4">
            <p className="text-sm font-semibold text-foreground">Gợi ý ưu tiên</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ưu tiên hội viên có trạng thái active, cập nhật giáo án hoặc ghi chú cho từng hồ sơ sau buổi tập.
            </p>
          </div>
        </aside>
      </section>

      {members.length > 0 ? (
        <section className="gm-panel overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Assigned Roster
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Hội viên được phân công
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Danh sách học viên đang thuộc workspace huấn luyện của bạn.
              </p>
            </div>

            <label className="relative block w-full md:max-w-xs">
              <span className="sr-only">Tìm hội viên được phân công</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="gm-field min-h-11 w-full pl-11 pr-3 text-sm text-foreground transition placeholder:text-muted-foreground"
                placeholder="Tìm học viên..."
                onChange={(event) => setSearch(event.target.value)}
                value={search}
              />
            </label>
          </div>

          <div className="grid gap-4 p-5 xl:grid-cols-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const checkInAt = checkedInToday.get(member.id)
                return (
                  <Link
                    className="gm-interactive-card group p-4 active:scale-[0.98]"
                    href={`/pt/members/${member.id}`}
                    key={member.id}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                        {initials(member.fullName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-semibold text-foreground">
                          {member.fullName}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {member.memberCode}
                          {member.phone ? ` · ${member.phone}` : ""}
                        </span>
                      </span>
                      <StatusPill status={member.status} />
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </div>

                    <div className="mt-4 border-t border-border/60 pt-3 text-xs font-medium">
                      {checkInAt ? (
                        <span className="inline-flex items-center gap-1.5 text-primary">
                          <CheckCircle2 aria-hidden="true" className="size-3.5" />
                          Đã đến hôm nay ·{" "}
                          {formatVnTime(checkInAt, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Clock aria-hidden="true" className="size-3.5" />
                          Chưa check-in hôm nay
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                Không tìm thấy hội viên nào khớp với từ khóa tìm kiếm.
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          <Dumbbell
            aria-hidden="true"
            className="mx-auto size-8 text-muted-foreground"
          />
          <p className="mt-3 font-medium text-foreground">
            Chưa có hội viên được phân công
          </p>
          <p className="mt-1">
            Hội viên sẽ xuất hiện tại đây sau khi Admin phân công PT.
          </p>
        </div>
      )}
    </div>
  )
}

function CoachSummaryCard({
  helper,
  icon: Icon,
  label,
  tone = "primary",
  value,
}: {
  helper: string
  icon: LucideIcon
  label: string
  tone?: "primary" | "success" | "warning" | "info"
  value: string
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-primary/10 text-primary",
    warning: "bg-[var(--status-warning)]/15 text-[var(--status-warning)]",
    info: "bg-[var(--status-info)]/15 text-[var(--status-info)]",
  }[tone]

  return (
    <article className="gm-panel p-5">
      <div className="flex items-center gap-4">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", toneClass)}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
    </article>
  )
}
