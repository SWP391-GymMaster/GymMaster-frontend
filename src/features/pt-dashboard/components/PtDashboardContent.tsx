"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  NotebookPen,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { usePtAssignedMembers } from "@/features/pt-dashboard/api/pt-dashboard.queries"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function PtDashboardContent() {
  const { data, isLoading, error, refetch } = usePtAssignedMembers()

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">
          {error instanceof Error ? error.message : "Không thể tải danh sách hội viên."}
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:brightness-95 active:scale-[0.97]"
          onClick={() => refetch()}
          type="button"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              key={i}
            >
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
      </div>
    )
  }

  const members = data ?? []
  const activeCount = members.filter((member) => member.status === "active").length
  const followUpCount = Math.max(members.length - activeCount, 0)

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
          helper="Cần kiểm tra lại"
          icon={NotebookPen}
          label="Cần theo dõi"
          tone="warning"
          value={String(followUpCount)}
        />
        <CoachSummaryCard
          helper="Kế hoạch hôm nay"
          icon={CalendarDays}
          label="Buổi PT"
          tone="purple"
          value={String(Math.max(activeCount * 2, 1))}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Coach Command Center
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Quản lý học viên, giáo án và ghi chú trong một workspace rõ ràng.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Mở hồ sơ 360, kiểm tra trạng thái gói, tạo giáo án và ghi chú sau buổi tập mà không mất ngữ cảnh huấn luyện.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <HeroMetric icon={Users} label="Roster" value={`${members.length} hội viên`} />
              <HeroMetric icon={Trophy} label="Adherence" value="88%" />
              <HeroMetric icon={Dumbbell} label="Load" value="32/40 suất" />
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Nhịp huấn luyện hôm nay</p>
          <div className="mt-4 space-y-3">
            <CoachTask label="Kiểm tra hội viên active" done={activeCount > 0} />
            <CoachTask label="Cập nhật giáo án chính" done={members.length > 0} />
            <CoachTask label="Ghi chú sau buổi tập" done={false} />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Gợi ý ưu tiên</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Bắt đầu với hội viên có trạng thái active, sau đó cập nhật giáo án hoặc ghi chú cho từng hồ sơ.
            </p>
          </div>
        </aside>
      </section>

      {members.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
                className="min-h-11 w-full rounded-xl border border-border bg-background pl-11 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
                placeholder="Tìm học viên..."
                readOnly
              />
            </label>
          </div>

          <div className="grid gap-4 p-5 xl:grid-cols-2">
            {members.map((member) => (
              <Link
                className="group rounded-2xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
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
                      {member.memberCode} · {member.phone}
                    </span>
                  </span>
                  <StatusPill status={member.status} />
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <RosterStat label="Buổi còn lại" value="12" />
                  <RosterStat label="Tuần này" value="3/4" />
                  <RosterStat label="Ghi chú" value="2 mới" />
                </div>
              </Link>
            ))}
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
  tone?: "primary" | "success" | "warning" | "purple"
  value: string
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-orange-500/10 text-orange-600",
    purple: "bg-violet-500/10 text-violet-600",
  }[tone]

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <Icon aria-hidden="true" className="size-5 text-primary" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CoachTask({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className={done ? "text-primary" : "text-muted-foreground"}>
        {done ? "Sẵn sàng" : "Chờ cập nhật"}
      </span>
    </div>
  )
}

function RosterStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl border border-border bg-card p-3">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="mt-1 block text-sm font-semibold text-foreground">{value}</span>
    </span>
  )
}
