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
import { gymMasterAssets } from "@/lib/gymmaster-assets"

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
    <div className="grid gap-5">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 p-6 text-white shadow-xl"
        data-testid="member-calorie-summary"
        style={{
          backgroundImage: `linear-gradient(115deg, rgba(24,24,27,0.96), rgba(24,24,27,0.78) 58%, rgba(24,24,27,0.36)), url(${gymMasterAssets.nutritionCover})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Tổng kết calo ngày
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
            {getRemainingLabel(summary.data.remaining)}
          </h2>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${consumedPercent}%`,
              }}
            />
          </div>
        </div>
        <div className="relative mt-5 grid gap-4 md:grid-cols-3">
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
      </section>

      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Macro</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Giá trị macro sẽ hiển thị khi contract backend trả đủ dữ liệu.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Macro label="Protein" value={formatMacro(summary.data.proteinG)} />
          <Macro label="Carb" value={formatMacro(summary.data.carbsG)} />
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
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <Icon aria-hidden="true" className="size-5 text-primary" />
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
