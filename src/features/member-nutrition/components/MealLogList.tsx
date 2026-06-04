"use client"

import { Plus, Sunrise, Sun, Moon, Cookie } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { StateBlock } from "@/components/feedback/StateBlock"
import type { MealLog } from "@/features/member-nutrition/types/member-nutrition.types"
import { formatCalories } from "@/features/member-nutrition/utils/nutrition-formatters"

type MealLogListProps = {
  logs?: MealLog[]
  isLoading?: boolean
  isError?: boolean
  calorieTarget?: number
}

export function MealLogList({
  logs,
  isLoading = false,
  isError = false,
  calorieTarget = 2200,
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

  // Group foods by meal type
  const groupedItems = {
    breakfast: [] as { foodName?: string; quantity: number; unit?: string; calories: number }[],
    lunch: [] as { foodName?: string; quantity: number; unit?: string; calories: number }[],
    dinner: [] as { foodName?: string; quantity: number; unit?: string; calories: number }[],
    snack: [] as { foodName?: string; quantity: number; unit?: string; calories: number }[],
  }

  logs?.forEach((log) => {
    const type = log.mealType?.toLowerCase()
    const normalizedType =
      type === "snacks" || type === "snack"
        ? "snack"
        : type === "breakfast"
        ? "breakfast"
        : type === "lunch"
        ? "lunch"
        : type === "dinner"
        ? "dinner"
        : "snack"

    log.items.forEach((item) => {
      groupedItems[normalizedType].push({
        foodName: item.foodName,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories ?? 0,
      })
    })
  })

  // Calculate subtotals
  const getSubtotal = (items: typeof groupedItems.breakfast) => {
    return items.reduce((sum, item) => sum + item.calories, 0)
  }

  const breakfastSum = getSubtotal(groupedItems.breakfast)
  const lunchSum = getSubtotal(groupedItems.lunch)
  const dinnerSum = getSubtotal(groupedItems.dinner)
  const snackSum = getSubtotal(groupedItems.snack)

  const totalConsumed = breakfastSum + lunchSum + dinnerSum + snackSum
  const remaining = calorieTarget - totalConsumed

  const mealTypesList = [
    { key: "breakfast", label: "Bữa sáng", icon: Sunrise, items: groupedItems.breakfast, sum: breakfastSum },
    { key: "lunch", label: "Bữa trưa", icon: Sun, items: groupedItems.lunch, sum: lunchSum },
    { key: "dinner", label: "Bữa tối", icon: Moon, items: groupedItems.dinner, sum: dinnerSum },
    { key: "snack", label: "Bữa phụ (nhẹ)", icon: Cookie, items: groupedItems.snack, sum: snackSum },
  ] as const

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Nhật ký ăn uống
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Nhật ký hôm nay
          </h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {logs?.length || 0} bữa đã ghi
        </span>
      </div>

      <div className="space-y-6" data-testid="member-meal-log-list">
        {mealTypesList.map(({ key, label, icon: Icon, items, sum }) => (
          <div key={key} className="rounded-xl border border-border bg-background/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon className="size-4.5 text-primary" />
                <span className="font-bold text-foreground text-sm">{label}</span>
              </div>
              <span className="font-black text-sm text-foreground">{formatCalories(sum)}</span>
            </div>

            {/* Food items list */}
            <div className="p-3 divide-y divide-border/60">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2 px-1">
                  Chưa ghi nhận món ăn nào cho buổi này.
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${key}-${index}`}
                    className="flex items-center justify-between py-2 text-sm px-1"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.foodName || "Món ăn thô"}</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        Lượng: {item.quantity} {item.unit || "phần"}
                      </p>
                    </div>
                    <span className="font-bold text-foreground">{formatCalories(item.calories)}</span>
                  </div>
                ))
              )}
            </div>

            {/* Footer with link */}
            <div className="bg-muted/10 border-t border-border/40 text-left">
              <Link
                href={`/member/nutrition/meal-journal?view=add&type=${key}`}
                className="flex min-h-11 w-full items-center gap-1.5 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:brightness-95 active:scale-95 transition"
              >
                <Plus className="size-3.5" />
                Thêm thực phẩm
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* MyFitnessPal Signature Calorie Equation Bar */}
      <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground text-center mb-3">
          Cân bằng calo trong ngày
        </p>
        <div className="grid grid-cols-5 items-center text-center gap-1">
          <div>
            <span className="block text-lg font-black text-foreground">{calorieTarget}</span>
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wide">Mục tiêu</span>
          </div>
          <div className="text-muted-foreground text-sm font-bold">-</div>
          <div>
            <span className="block text-lg font-black text-primary">{totalConsumed}</span>
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wide">Đã ăn</span>
          </div>
          <div className="text-muted-foreground text-sm font-bold">=</div>
          <div>
            <span className={cn("block text-lg font-black", remaining >= 0 ? "text-foreground" : "text-destructive")}>
              {remaining}
            </span>
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wide">Còn lại</span>
          </div>
        </div>
      </div>
    </section>
  )
}
