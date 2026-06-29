"use client"

import { useState } from "react"
import { Plus, Sunrise, Sun, Moon, Cookie, ChevronRight } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { StateBlock } from "@/components/feedback/StateBlock"
import { MealDetailSheet } from "@/features/member-nutrition/components/MealDetailSheet"
import type { MealLog, MealLogItem } from "@/features/member-nutrition/types/member-nutrition.types"
import { formatCalories } from "@/features/member-nutrition/utils/nutrition-formatters"

type MealKey = "breakfast" | "lunch" | "dinner" | "snack"

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
  const [selectedMeal, setSelectedMeal] = useState<MealKey | null>(null)

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
  const groupedItems: Record<MealKey, MealLogItem[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  }

  logs?.forEach((log) => {
    const type = log.mealType?.toLowerCase()
    const normalizedType: MealKey =
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
      groupedItems[normalizedType].push(item)
    })
  })

  // Calculate subtotals
  const getSubtotal = (items: MealLogItem[]) =>
    items.reduce((sum, item) => sum + (item.calories ?? 0), 0)

  const breakfastSum = getSubtotal(groupedItems.breakfast)
  const lunchSum = getSubtotal(groupedItems.lunch)
  const dinnerSum = getSubtotal(groupedItems.dinner)
  const snackSum = getSubtotal(groupedItems.snack)

  const totalConsumed = breakfastSum + lunchSum + dinnerSum + snackSum
  const remaining = calorieTarget - totalConsumed

  const mealTypesList = [
    { key: "breakfast" as MealKey, label: "Bữa sáng", icon: Sunrise, items: groupedItems.breakfast, sum: breakfastSum },
    { key: "lunch" as MealKey, label: "Bữa trưa", icon: Sun, items: groupedItems.lunch, sum: lunchSum },
    { key: "dinner" as MealKey, label: "Bữa tối", icon: Moon, items: groupedItems.dinner, sum: dinnerSum },
    { key: "snack" as MealKey, label: "Bữa phụ (nhẹ)", icon: Cookie, items: groupedItems.snack, sum: snackSum },
  ]

  const selectedMealItems = selectedMeal ? groupedItems[selectedMeal] : []

  return (
    <>
      <section className="gm-panel p-5">
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
            <div key={key} className="gm-panel-muted overflow-hidden">
              {/* Clickable header */}
              <button
                type="button"
                onClick={() => setSelectedMeal(key)}
                className={cn(
                  "flex w-full items-center justify-between bg-muted/30 px-4 py-3 border-b border-border",
                  "transition hover:bg-muted/50 active:scale-[0.99]",
                  "group"
                )}
                aria-label={`Xem chi tiết ${label}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4.5 text-primary" />
                  <span className="font-bold text-foreground text-sm">{label}</span>
                  {items.length > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {items.length} món
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-foreground">{formatCalories(sum)}</span>
                  <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </button>

              {/* Food items list (preview only — max 3) */}
              <div className="p-3 divide-y divide-border/60">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2 px-1">
                    Chưa ghi nhận món ăn nào cho buổi này.
                  </p>
                ) : (
                  <>
                    {items.slice(0, 3).map((item, index) => (
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
                        <span className="font-bold text-foreground">{formatCalories(item.calories ?? 0)}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMeal(key)}
                        className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-primary hover:brightness-90 active:scale-95 transition"
                      >
                        Xem thêm {items.length - 3} món
                        <ChevronRight className="size-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Footer with add link */}
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

      {/* Meal Detail Sheet */}
      <MealDetailSheet
        open={selectedMeal !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMeal(null)
        }}
        mealKey={selectedMeal}
        items={selectedMealItems}
      />
    </>
  )
}
