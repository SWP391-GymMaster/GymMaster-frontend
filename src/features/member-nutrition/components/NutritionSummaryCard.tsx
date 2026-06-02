import Link from "next/link"
import { Activity, ArrowRight } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import type { CalorieSummary } from "@/features/member-nutrition/types/member-nutrition.types"
import {
  formatCalories,
  formatMacro,
  getRemainingLabel,
} from "@/features/member-nutrition/utils/nutrition-formatters"

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

  return (
    <section
      className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm"
      data-testid="member-nutrition-summary-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Dinh dưỡng hôm nay
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            {hasConsumedCalories ? formatCalories(summary.consumed) : "Chưa có bữa ăn"}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {getRemainingLabel(summary.remaining)}
          </p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Activity aria-hidden="true" className="size-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Mục tiêu" value={formatCalories(summary.target)} />
        <Metric label="Đã ăn" value={formatCalories(summary.consumed)} />
        <Metric label="Còn lại" value={formatCalories(summary.remaining)} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          <span>Tiến độ</span>
          <span>{consumedPercent}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${consumedPercent}%` }}
          />
        </div>
      </div>

      {!compact ? (
        <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 sm:grid-cols-3">
          <Metric label="Protein" value={formatMacro(summary.proteinG)} />
          <Metric label="Carb" value={formatMacro(summary.carbsG)} />
          <Metric label="Fat" value={formatMacro(summary.fatG)} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800">
          <Link href="/member/nutrition/meal-journal">
            Thêm bữa ăn
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/member/nutrition/summary">Xem tổng kết</Link>
        </Button>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-zinc-950">{value}</p>
    </div>
  )
}
