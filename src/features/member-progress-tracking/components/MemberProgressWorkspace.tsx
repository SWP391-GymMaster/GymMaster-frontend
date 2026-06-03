"use client"

import { Activity, TrendingUp, Percent, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { StateBlock } from "@/components/feedback/StateBlock"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { useMemberProgress, useCurrentMemberProfileId } from "@/features/member-progress-tracking/api/member-progress.queries"
import { ProgressLogForm } from "@/features/member-progress-tracking/components/ProgressLogForm"
import { ProgressChartsPanel } from "@/features/member-progress-tracking/components/ProgressChartsPanel"
import { ProgressHistoryTable } from "@/features/member-progress-tracking/components/ProgressHistoryTable"

export function MemberProgressWorkspace() {
  const memberId = useCurrentMemberProfileId()
  const { data: entries = [], isLoading, error, refetch } = useMemberProgress(memberId)

  // Sort entries descending to find the latest measurements
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
  )

  const latestEntry = sortedEntries[0]
  const prevEntry = sortedEntries[1]

  const weightVal = latestEntry ? `${latestEntry.weightKg} kg` : "—"
  const fatVal = latestEntry?.bodyFatPct !== undefined && latestEntry.bodyFatPct !== null ? `${latestEntry.bodyFatPct}%` : "—"

  let weightChangeStr = "—"
  let fatChangeStr = "—"

  if (latestEntry && prevEntry) {
    const wDiff = latestEntry.weightKg - prevEntry.weightKg
    const fDiff =
      latestEntry.bodyFatPct !== undefined &&
      latestEntry.bodyFatPct !== null &&
      prevEntry.bodyFatPct !== undefined &&
      prevEntry.bodyFatPct !== null
        ? latestEntry.bodyFatPct - prevEntry.bodyFatPct
        : null

    weightChangeStr = wDiff > 0 ? `+${wDiff.toFixed(1)} kg` : `${wDiff.toFixed(1)} kg`
    if (fDiff !== null) {
      fatChangeStr = fDiff > 0 ? `+${fDiff.toFixed(1)}%` : `${fDiff.toFixed(1)}%`
    }
  }

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Xem và ghi nhận cân nặng, tỷ lệ mỡ cơ thể và theo dõi biểu đồ tiến độ."
        role="member"
        title="Tiến độ của tôi"
      >
        <div className="space-y-6">
          {/* Top action rail */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Link href="/member/dashboard" className="hover:text-foreground flex items-center gap-1 transition">
                <ArrowLeft className="size-4" />
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-medium text-foreground">Tiến độ</span>
            </div>

            {memberId && (
              <div className="flex justify-end">
                <ProgressLogForm memberId={memberId} onSuccess={() => refetch()} />
              </div>
            )}
          </div>

          {/* Hero Banner with Latest Stats */}
          <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="size-5" />
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Theo dõi tiến độ & chỉ số cơ thể
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Ghi lại cân nặng và tỷ lệ mỡ thường xuyên để theo dõi biểu đồ thay đổi và tối ưu giáo án luyện tập/dinh dưỡng cùng PT.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[400px]">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="size-3.5 text-primary" />
                    Cân nặng mới nhất
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground" data-testid="latest-weight">
                    {weightVal}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Thay đổi: <span className="font-semibold text-foreground">{weightChangeStr}</span>
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground flex items-center gap-1">
                    <Percent className="size-3.5 text-primary" />
                    Tỷ lệ mỡ mới nhất
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground" data-testid="latest-fat">
                    {fatVal}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Thay đổi: <span className="font-semibold text-foreground">{fatChangeStr}</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {isLoading ? (
            <StateBlock tone="loading" title="Đang tải dữ liệu tiến độ..." />
          ) : error ? (
            <div className="space-y-4">
              <StateBlock
                tone="error"
                title="Không thể tải dữ liệu tiến độ"
                description={error instanceof Error ? error.message : "Vui lòng thử lại sau."}
              />
              <button
                onClick={() => refetch()}
                className="min-h-10 px-4 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98]"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {/* Double Charts Panel */}
              <ProgressChartsPanel entries={entries} />

              {/* History table */}
              <ProgressHistoryTable entries={entries} />
            </>
          )}
        </div>
      </WorkspaceShell>
    </PermissionGuard>
  )
}
