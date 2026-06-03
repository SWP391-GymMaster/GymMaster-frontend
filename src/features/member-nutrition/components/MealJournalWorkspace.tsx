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
    <div className="grid gap-6">
      <section className="relative min-h-[300px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950 shadow-xl">
        <div
          className="absolute inset-0 scale-[1.02]"
          style={{
            backgroundImage: `url(${gymMasterAssets.nutritionCover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(34,197,94,0.28),transparent_34%),linear-gradient(90deg,rgba(3,7,6,0.95)_0%,rgba(3,7,6,0.82)_42%,rgba(3,7,6,0.48)_74%,rgba(3,7,6,0.25)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 to-transparent" />

        <div className="relative flex min-h-[300px] flex-col justify-between p-6 md:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-primary shadow-sm backdrop-blur-md">
                <Utensils aria-hidden="true" className="size-5" />
              </span>
              <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
                Nhật ký hôm nay
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-md">
                <CalendarDays aria-hidden="true" className="size-3.5 text-primary" />
                {today}
              </span>
            </div>

            <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Ghi bữa nhanh, giữ calo đúng nhịp.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-200/90 md:text-base">
              Tìm món, chọn khẩu phần và cập nhật nhật ký ăn trong ngày với dữ liệu calo rõ ràng.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="min-h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-95 active:scale-[0.98]"
            >
              <a href="#add-meal">
                <Plus aria-hidden="true" className="size-4" />
                Thêm bữa
              </a>
            </Button>
            <div className="rounded-2xl border border-white/15 bg-white/[0.13] px-4 py-3 shadow-sm backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Mục tiêu hôm nay
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                2.200 kcal
              </p>
            </div>
          </div>
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
