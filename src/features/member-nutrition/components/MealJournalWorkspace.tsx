"use client"

import { CalendarDays, Plus, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Utensils aria-hidden="true" className="size-5" />
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Nhật ký hôm nay
              </span>
            </div>
            <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-foreground">
              Ghi bữa nhanh, giữ calo đúng nhịp.
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays aria-hidden="true" className="size-4 text-primary" />
              {today}
            </p>
          </div>
          <Button asChild className="min-h-12 rounded-xl active:scale-[0.98]">
            <a href="#add-meal">
              <Plus aria-hidden="true" className="size-4" />
              Thêm bữa
            </a>
          </Button>
        </div>
      </section>

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
