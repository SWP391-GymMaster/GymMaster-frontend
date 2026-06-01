"use client"

import { MealLogForm } from "@/features/member-nutrition/components/MealLogForm"
import { MealLogList } from "@/features/member-nutrition/components/MealLogList"
import { NutritionSummaryCard } from "@/features/member-nutrition/components/NutritionSummaryCard"
import {
  useMemberCalorieSummary,
  useMemberMealLogs,
} from "@/features/member-nutrition/api/member-nutrition.queries"
import { getTodayDate } from "@/features/member-nutrition/utils/nutrition-formatters"

const today = getTodayDate()

export function MealJournalWorkspace() {
  const summary = useMemberCalorieSummary(today)
  const logs = useMemberMealLogs(today)

  return (
    <div className="grid gap-5">
      <NutritionSummaryCard
        compact
        isError={summary.isError}
        isLoading={summary.isLoading}
        summary={summary.data}
      />
      <MealLogForm date={today} />
      <MealLogList
        isError={logs.isError}
        isLoading={logs.isLoading}
        logs={logs.data}
      />
    </div>
  )
}
