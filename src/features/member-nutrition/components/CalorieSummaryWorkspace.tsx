"use client"

import { Flame, Target, Utensils } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import { MealLogList } from "@/features/member-nutrition/components/MealLogList"
import {
  useMemberCalorieSummary,
  useMemberMealLogs,
} from "@/features/member-nutrition/api/member-nutrition.queries"
import {
  formatCalories,
  formatMacro,
  getRemainingLabel,
  getTodayDate,
} from "@/features/member-nutrition/utils/nutrition-formatters"

const today = getTodayDate()

export function CalorieSummaryWorkspace() {
  const summary = useMemberCalorieSummary(today)
  const logs = useMemberMealLogs(today)

  if (summary.isLoading) {
    return (
      <StateBlock
        description="Đang tải calo, mục tiêu và phân tích bữa ăn."
        title="Đang tải tổng kết ngày..."
        tone="loading"
      />
    )
  }

  if (summary.isError) {
    return (
      <StateBlock
        description="Tải lại trang hoặc thử lại sau khi dịch vụ ổn định."
        title="Không thể tải tổng kết ngày."
        tone="error"
      />
    )
  }

  if (!summary.data) {
    return (
      <StateBlock
        description="Thêm bữa ăn để bắt đầu theo dõi calo."
        title="Chưa có dữ liệu tổng kết."
        tone="empty"
      />
    )
  }

  const consumedPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round((summary.data.consumed / Math.max(summary.data.target, 1)) * 100),
    ),
  )

  return (
    <div className="grid gap-6">
      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        data-testid="member-calorie-summary"
      >
        <div className="grid gap-0 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="flex flex-col items-center justify-center border-b border-border bg-primary/5 p-6 text-center xl:border-b-0 xl:border-r">
            <div
              className="flex size-52 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) 0deg ${
                  consumedPercent * 3.6
                }deg, hsl(var(--muted)) ${consumedPercent * 3.6}deg 360deg)`,
              }}
            >
              <div className="flex size-36 flex-col items-center justify-center rounded-full border border-border bg-card shadow-sm">
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {formatCalories(summary.data.consumed)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Đã ăn
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Tiến độ hôm nay</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {consumedPercent}%
            </p>
          </div>

          <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Tổng kết calo ngày
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-foreground">
              {getRemainingLabel(summary.data.remaining)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Theo dõi đã ăn, mục tiêu, phần còn lại và macro trong ngày.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <HeroMetric
                icon={Flame}
                label="Đã ăn"
                value={formatCalories(summary.data.consumed)}
              />
              <HeroMetric
                icon={Target}
                label="Mục tiêu"
                value={formatCalories(summary.data.target)}
              />
              <HeroMetric
                icon={Utensils}
                label="Còn lại"
                value={getRemainingLabel(summary.data.remaining)}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Macro label="Protein" value={formatMacro(summary.data.proteinG)} percent={summary.data.proteinG ? 68 : 0} />
              <Macro label="Carb" value={formatMacro(summary.data.carbsG)} percent={summary.data.carbsG ? 54 : 0} />
              <Macro label="Fat" value={formatMacro(summary.data.fatG)} percent={summary.data.fatG ? 42 : 0} />
            </div>
          </div>
        </div>
      </section>

      <MealLogList
        isError={logs.isError}
        isLoading={logs.isLoading}
        logs={logs.data}
      />
    </div>
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
    <div className="rounded-xl border border-border bg-background p-4">
      <Icon aria-hidden="true" className="size-5 text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Macro({
  label,
  percent,
  value,
}: {
  label: string
  percent: number
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
