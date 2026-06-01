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
        description="Loading today's calorie target and intake."
        title="Loading nutrition summary..."
        tone="loading"
      />
    )
  }

  if (isError) {
    return (
      <StateBlock
        description="Refresh this workspace or try again after the service recovers."
        title="Nutrition summary could not be loaded."
        tone="error"
      />
    )
  }

  if (!summary) {
    return (
      <StateBlock
        description="Add your first meal to start tracking today's intake."
        title="No nutrition summary yet."
        tone="empty"
      />
    )
  }

  const hasConsumedCalories = summary.consumed > 0

  return (
    <section
      className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm"
      data-testid="member-nutrition-summary-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
            Today nutrition
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            {hasConsumedCalories ? formatCalories(summary.consumed) : "No meals yet"}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {getRemainingLabel(summary.remaining)}
          </p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-800">
          <Activity aria-hidden="true" className="size-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Target" value={formatCalories(summary.target)} />
        <Metric label="Consumed" value={formatCalories(summary.consumed)} />
        <Metric label="Remaining" value={formatCalories(summary.remaining)} />
      </div>

      {!compact ? (
        <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 sm:grid-cols-3">
          <Metric label="Protein" value={formatMacro(summary.proteinG)} />
          <Metric label="Carbs" value={formatMacro(summary.carbsG)} />
          <Metric label="Fat" value={formatMacro(summary.fatG)} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800">
          <Link href="/member/nutrition/meal-journal">
            Add meal
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/member/nutrition/summary">View summary</Link>
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
