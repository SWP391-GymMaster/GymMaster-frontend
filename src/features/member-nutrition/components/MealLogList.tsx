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
    <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Nhật ký ăn</h2>
      <div className="mt-4 grid gap-3" data-testid="member-meal-log-list">
        {logs.map((log) => (
          <article
            className="rounded-[1.25rem] border border-zinc-200 bg-white p-4"
            key={log.id}
          >
            <p className="font-semibold text-zinc-950">
              {formatMealType(log.mealType)}
            </p>
            <div className="mt-3 grid gap-2">
              {log.items.map((item) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-700"
                  key={`${log.id}-${item.foodItemId}`}
                >
                  <span>
                    {item.foodName ?? `Món #${item.foodItemId}`} · {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </span>
                  <span className="font-medium text-zinc-950">
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
