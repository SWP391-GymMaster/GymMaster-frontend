"use client"

import { Flame, Target, Utensils, Plus, Apple, Info } from "lucide-react"
import Link from "next/link"

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

  // MyFitnessPal SVG circular progress calculations
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (consumedPercent / 100) * circumference

  // Categorize log values
  const logsData = logs.data || []
  const breakfastLogs = logsData.filter(log => log.mealType?.toLowerCase() === "breakfast")
  const lunchLogs = logsData.filter(log => log.mealType?.toLowerCase() === "lunch")
  const dinnerLogs = logsData.filter(log => log.mealType?.toLowerCase() === "dinner")
  const snackLogs = logsData.filter(log => log.mealType?.toLowerCase() === "snack" || log.mealType?.toLowerCase() === "snacks")

  const getCaloriesSum = (mealLogs: typeof logsData) => {
    return mealLogs.reduce((sum, log) => {
      return sum + log.items.reduce((itemSum, item) => itemSum + (item.calories || 0), 0);
    }, 0);
  }

  const breakfastCal = getCaloriesSum(breakfastLogs)
  const lunchCal = getCaloriesSum(lunchLogs)
  const dinnerCal = getCaloriesSum(dinnerLogs)
  const snackCal = getCaloriesSum(snackLogs)

  // Define macro target limits based on 2200 kcal average target
  const pTarget = 140
  const cTarget = 270
  const fTarget = 75

  const pPercent = Math.min(100, Math.round(((summary.data.proteinG || 0) / pTarget) * 100))
  const cPercent = Math.min(100, Math.round(((summary.data.carbsG || 0) / cTarget) * 100))
  const fPercent = Math.min(100, Math.round(((summary.data.fatG || 0) / fTarget) * 100))

  return (
    <div className="grid gap-6">
      {/* Modern Circular Calorie Gauge Card */}
      <section
        className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm p-6 lg:p-8"
        data-testid="member-calorie-summary"
      >
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Circular Gauge Center */}
          <div className="flex flex-col items-center justify-center border-b border-border/50 pb-6 lg:border-b-0 lg:border-r lg:pr-8 lg:pb-0">
            <div className="relative flex items-center justify-center size-48">
              <svg className="size-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  className="stroke-muted"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  className="stroke-primary"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              {/* Inner Text remaining */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black tracking-tight text-foreground">
                  {summary.data.remaining}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                  Kcal còn lại
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
              <Info className="size-3 text-primary shrink-0" />
              <span>Tiến độ ăn: {consumedPercent}%</span>
            </p>
          </div>

          {/* Equation & Macros Right */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Tổng kết calo ngày
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Cân bằng Calorie hôm nay
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Biểu đồ đo lường tổng năng lượng nạp và tiêu thụ của cơ thể theo kế hoạch hàng ngày của bạn.
              </p>

              {/* Equation grid */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <Flame className="size-5 text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">Đã ăn</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{formatCalories(summary.data.consumed)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <Target className="size-5 text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">Mục tiêu</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{formatCalories(summary.data.target)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <Utensils className="size-5 text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">Còn lại</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{getRemainingLabel(summary.data.remaining)}</p>
                </div>
              </div>
            </div>

            {/* Micro macro ratios */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MacroTrack
                label="Protein"
                value={summary.data.proteinG}
                target={pTarget}
                percent={pPercent}
                colorClass="bg-primary"
              />
              <MacroTrack
                label="Carb"
                value={summary.data.carbsG}
                target={cTarget}
                percent={cPercent}
                colorClass="bg-[oklch(0.58_0.095_210)]"
              />
              <MacroTrack
                label="Fat"
                value={summary.data.fatG}
                target={fTarget}
                percent={fPercent}
                colorClass="bg-amber-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categorized Meal Blocks */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CategoryCard
          title="Bữa sáng"
          kcal={breakfastCal}
          count={breakfastLogs.length}
        />
        <CategoryCard
          title="Bữa trưa"
          kcal={lunchCal}
          count={lunchLogs.length}
        />
        <CategoryCard
          title="Bữa tối"
          kcal={dinnerCal}
          count={dinnerLogs.length}
        />
        <CategoryCard
          title="Bữa nhẹ"
          kcal={snackCal}
          count={snackLogs.length}
        />
      </section>

      {/* Timeline logs */}
      <MealLogList
        isError={logs.isError}
        isLoading={logs.isLoading}
        logs={logs.data}
      />
    </div>
  )
}

function MacroTrack({
  label,
  value,
  target,
  percent,
  colorClass,
}: {
  label: string
  value?: number
  target: number
  percent: number
  colorClass: string
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-background p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-xs font-bold text-foreground">
          {value !== undefined ? `${value}g / ${target}g` : "Chưa có"}
        </span>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${colorClass}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground/60 mt-1.5 block text-right">{percent}% mục tiêu</span>
      </div>
    </div>
  )
}

function CategoryCard({
  title,
  kcal,
  count,
}: {
  title: string
  kcal: number
  count: number
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{count} món ăn đã ghi</p>
        </div>
        <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <Apple className="size-4" />
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <span className="text-xl font-black text-foreground">
          {kcal} <span className="text-xs font-semibold text-muted-foreground">Kcal</span>
        </span>
        <Link
          href={`/member/nutrition/meal-journal#add-meal`}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground transition active:scale-90"
          title={`Thêm món vào ${title}`}
        >
          <Plus className="size-4" />
        </Link>
      </div>
    </div>
  )
}
