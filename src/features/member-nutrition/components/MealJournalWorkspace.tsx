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
import { gymMasterAssets } from "@/lib/gymmaster-assets"

const today = getTodayDate()

export function MealJournalWorkspace() {
  const summary = useMemberCalorieSummary(today)
  const logs = useMemberMealLogs(today)

  return (
    <div className="grid gap-5">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 p-5 text-white shadow-xl md:p-6"
        style={{
          backgroundImage: `linear-gradient(115deg, rgba(24,24,27,0.94), rgba(24,24,27,0.72) 58%, rgba(24,24,27,0.36)), url(${gymMasterAssets.nutritionCover})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-zinc-950">
                <Utensils aria-hidden="true" className="size-5" />
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-100">
                Nhật ký hôm nay
              </span>
            </div>
            <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Ghi bữa nhanh, giữ calo đúng nhịp.
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-zinc-200">
              <CalendarDays aria-hidden="true" className="size-4 text-primary" />
              {today}
            </p>
          </div>
          <Button asChild className="min-h-12 rounded-full active:scale-[0.98]">
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
