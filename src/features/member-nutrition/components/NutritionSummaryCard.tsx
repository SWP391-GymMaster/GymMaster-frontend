import Link from "next/link"
import { Activity, ArrowRight, Flame, Target, Utensils } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import type { CalorieSummary } from "@/features/member-nutrition/types/member-nutrition.types"
import {
  formatCalories,
  formatMacro,
  getRemainingLabel,
} from "@/features/member-nutrition/utils/nutrition-formatters"

import { gymMasterAssets } from "@/lib/gymmaster-assets"


type NutritionSummaryCardProps = {
  summary?: CalorieSummary
  isLoading?: boolean
  isError?: boolean
  compact?: boolean
}

export function NutritionSummaryCard({
  summary,
  isLoading = false,
  isError = false,
  compact = false,
}: NutritionSummaryCardProps) {
  if (isLoading) {
    return (
      <StateBlock
        description="Đang tải mục tiêu calo và lượng đã ăn hôm nay."
        title="Đang tải tổng kết dinh dưỡng..."
        tone="loading"
      />
    )
  }

  if (isError) {
    return (
      <StateBlock
        description="Tải lại workspace hoặc thử lại sau khi dịch vụ ổn định."
        title="Không thể tải tổng kết dinh dưỡng."
        tone="error"
      />
    )
  }

  if (!summary) {
    return (
      <StateBlock
        description="Thêm bữa ăn đầu tiên để bắt đầu theo dõi hôm nay."
        title="Chưa có tổng kết dinh dưỡng."
        tone="empty"
      />
    )
  }

  const hasConsumedCalories = summary.consumed > 0
  const consumedPercent = Math.min(
    100,
    Math.max(0, Math.round((summary.consumed / Math.max(summary.target, 1)) * 100)),
  )
  const remainingIsOver = summary.remaining < 0

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      data-testid="member-nutrition-summary-card"
    >
      <div className="grid h-full gap-0 lg:grid-cols-[280px_minmax(0,1fr)]" >
        <div className="flex h-full flex-col items-center justify-center border-b border-border bg-primary/5 p-6 text-center lg:border-b-0 lg:border-r"             style={{
              backgroundImage: `url(${gymMasterAssets.nutritionCover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
          <div
            className="flex size-44 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--primary)) 0deg ${
                consumedPercent * 3.6
              }deg, hsl(var(--muted)) ${consumedPercent * 3.6}deg 360deg)`,
            }}
          >
            <div className="flex size-32 flex-col items-center justify-center rounded-full border border-border bg-card shadow-sm">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {consumedPercent}%
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Đã ăn
              </p>
            </div>
          </div>

          <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
            {hasConsumedCalories
              ? formatCalories(summary.consumed)
              : "Chưa có bữa ăn"}
          </h2>
          <p
            className={`mt-1 text-sm font-medium ${
              remainingIsOver ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {getRemainingLabel(summary.remaining)}
          </p>
        </div>

        <div className="p-5">
          <div
            className="flex flex-wrap items-start justify-between gap-4"

          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Dinh dưỡng hôm nay
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Daily Nutrition
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                Theo dõi calo đã ăn, mục tiêu còn lại và macro để giữ nhịp tập luyện.
              </p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity aria-hidden="true" className="size-5" />
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric icon={Target} label="Mục tiêu" value={formatCalories(summary.target)} />
            <Metric icon={Flame} label="Đã ăn" value={formatCalories(summary.consumed)} />
            <Metric icon={Utensils} label="Còn lại" value={formatCalories(summary.remaining)} />
          </div>

          {!compact ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MacroBar label="Protein" value={formatMacro(summary.proteinG)} percent={summary.proteinG ? 68 : 0} />
              <MacroBar label="Carb" value={formatMacro(summary.carbsG)} percent={summary.carbsG ? 54 : 0} />
              <MacroBar label="Fat" value={formatMacro(summary.fatG)} percent={summary.fatG ? 42 : 0} />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
              <Link href="/member/nutrition/meal-journal">
                Thêm bữa ăn
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild className="rounded-xl border-border bg-card text-foreground hover:bg-muted" variant="outline">
              <Link href="/member/nutrition/summary">Xem tổng kết</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

function MacroBar({
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
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  )
}
