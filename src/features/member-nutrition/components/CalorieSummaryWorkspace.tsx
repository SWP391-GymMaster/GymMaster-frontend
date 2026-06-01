"use client"

import { Flame, Target, Utensils } from "lucide-react"

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
        description="Loading calories, target, and meal breakdown."
        title="Loading daily summary..."
        tone="loading"
      />
    )
  }

  if (summary.isError) {
    return (
      <StateBlock
        description="Refresh this page or try again after the service recovers."
        title="Daily summary could not be loaded."
        tone="error"
      />
    )
  }

  if (!summary.data) {
    return (
      <StateBlock
        description="Add a meal to begin tracking calories."
        title="No summary available."
        tone="empty"
      />
    )
  }

  return (
    <div className="grid gap-5">
      <section
        className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl"
        data-testid="member-calorie-summary"
      >
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
          Daily calorie summary
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <HeroMetric
            icon={Flame}
            label="Consumed"
            value={formatCalories(summary.data.consumed)}
          />
          <HeroMetric
            icon={Target}
            label="Target"
            value={formatCalories(summary.data.target)}
          />
          <HeroMetric
            icon={Utensils}
            label="Remaining"
            value={getRemainingLabel(summary.data.remaining)}
          />
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Macro readiness</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Macro values will appear when the backend contract starts returning them.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Macro label="Protein" value={formatMacro(summary.data.proteinG)} />
          <Macro label="Carbs" value={formatMacro(summary.data.carbsG)} />
          <Macro label="Fat" value={formatMacro(summary.data.fatG)} />
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
  icon: typeof Flame
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <Icon aria-hidden="true" className="size-5 text-emerald-300" />
      <p className="mt-4 text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-zinc-950">{value}</p>
    </div>
  )
}
