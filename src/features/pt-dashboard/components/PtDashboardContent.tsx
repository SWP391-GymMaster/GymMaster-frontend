"use client"

import Link from "next/link"
import { ArrowRight, Dumbbell, NotebookPen, Trophy, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { usePtAssignedMembers } from "@/features/pt-dashboard/api/pt-dashboard.queries"

export function PtDashboardContent() {
  const { data, isLoading, error, refetch } = usePtAssignedMembers()

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-800">
          {error instanceof Error ? error.message : "Không thể tải danh sách hội viên."}
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-700 active:scale-[0.97]"
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
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm"
            >
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[1.25rem] border border-zinc-200 bg-white p-4"
            />
          ))}
        </div>
      </div>
    )
  }

  const members = data ?? []
  const activeCount = members.filter((m) => m.status === "active").length

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-white/10 bg-gym-iron p-6 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Coach hub PT
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
            Theo dõi hội viên được phân công trong một màn hình.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            Mở hồ sơ 360, cập nhật giáo án và ghi chú luyện tập mà không mất ngữ cảnh vận hành.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <CoachMetric icon={Users} label="Hội viên" value={String(members.length)} />
            <CoachMetric icon={Trophy} label="Đang active" value={String(activeCount)} />
            <CoachMetric icon={NotebookPen} label="Cần theo dõi" value={String(members.length - activeCount)} />
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/90 p-5 shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground">
            Nhịp huấn luyện hôm nay
          </p>
          <div className="mt-4 space-y-3">
            <MiniChecklist label="Kiểm tra hội viên active" done={activeCount > 0} />
            <MiniChecklist label="Cập nhật giáo án chính" done={members.length > 0} />
            <MiniChecklist label="Ghi chú sau buổi tập" done={false} />
          </div>
        </div>
      </section>

      {members.length > 0 ? (
        <section className="rounded-xl border border-white/70 bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users aria-hidden="true" className="size-5 text-primary" />
              <p className="text-sm font-semibold text-muted-foreground">
                Hội viên được phân công
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              PT workspace
            </p>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {members.map((member) => (
              <Link
                className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.97]"
                href={`/pt/members/${member.id}`}
                key={member.id}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Dumbbell aria-hidden="true" className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-semibold text-zinc-950">
                    {member.fullName}
                  </span>
                  <span className="mt-0.5 block text-sm text-zinc-600">
                    {member.memberCode} · {member.phone}
                  </span>
                </span>
                <StatusPill status={member.status} />
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-zinc-400"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
          <Dumbbell
            aria-hidden="true"
            className="mx-auto size-8 text-zinc-300"
          />
          <p className="mt-3 font-medium">
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

function CoachMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      <p className="mt-3 text-xs text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

function MiniChecklist({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className={done ? "text-primary" : "text-muted-foreground"}>
        {done ? "Sẵn sàng" : "Chờ cập nhật"}
      </span>
    </div>
  )
}
