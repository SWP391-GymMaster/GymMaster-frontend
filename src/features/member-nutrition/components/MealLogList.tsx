import { Clock3, Utensils } from "lucide-react"

import { StateBlock } from "@/components/feedback/StateBlock"
import type { MealLog } from "@/features/member-nutrition/types/member-nutrition.types"
import {
  formatCalories,
  formatMealType,
} from "@/features/member-nutrition/utils/nutrition-formatters"

type MealLogListProps = {
  logs?: MealLog[]
  isLoading?: boolean
  isError?: boolean
}

export function MealLogList({
  logs,
  isLoading = false,
  isError = false,
}: MealLogListProps) {
  if (isLoading) {
    return (
      <StateBlock
        description="Đang tải các bữa ăn trong ngày đã chọn."
        title="Đang tải nhật ký ăn..."
        tone="loading"
      />
    )
  }

  if (isError) {
    return (
      <StateBlock
        description="Thử lại sau khi dịch vụ nhật ký ăn ổn định."
        title="Không thể tải nhật ký ăn."
        tone="error"
      />
    )
  }

  if (!logs?.length) {
    return (
      <StateBlock
        description="Ghi một bữa ăn để bắt đầu nhật ký hôm nay."
        title="Hôm nay chưa có bữa ăn."
        tone="empty"
      />
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Meal Timeline
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Nhật ký ăn
          </h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {logs.length} bữa
        </span>
      </div>

      <div className="relative mt-5 grid gap-3" data-testid="member-meal-log-list">
        {logs.map((log) => (
          <article
            className="rounded-xl border border-border bg-background p-4"
            key={log.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Utensils aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">
                    {formatMealType(log.mealType)}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    Đã ghi hôm nay
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {log.items.map((item) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
                  key={`${log.id}-${item.foodItemId}`}
                >
                  <span>
                    {item.foodName ?? `Món #${item.foodItemId}`} · {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCalories(item.calories ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
