"use client"

import { Sunrise, Sun, Moon, Cookie, X, Utensils } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { MealLogItem } from "@/features/member-nutrition/types/member-nutrition.types"
import { formatCalories } from "@/features/member-nutrition/utils/nutrition-formatters"

type MealKey = "breakfast" | "lunch" | "dinner" | "snack"

const mealMeta: Record<MealKey, { label: string; icon: typeof Sunrise }> = {
  breakfast: { label: "Bữa sáng", icon: Sunrise },
  lunch: { label: "Bữa trưa", icon: Sun },
  dinner: { label: "Bữa tối", icon: Moon },
  snack: { label: "Bữa phụ (nhẹ)", icon: Cookie },
}

type MealDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealKey: MealKey | null
  items: MealLogItem[]
}

function MacroPill({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass: string
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-xl border px-3 py-2 min-w-[64px]", colorClass)}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      <span className="mt-0.5 text-sm font-black">{value.toFixed(1)}g</span>
    </div>
  )
}

export function MealDetailSheet({
  open,
  onOpenChange,
  mealKey,
  items,
}: MealDetailSheetProps) {
  if (!mealKey) return null

  const meta = mealMeta[mealKey]
  const Icon = meta.icon

  // Aggregate totals for the meal
  const totalCal = items.reduce((sum, item) => sum + (item.calories ?? 0), 0)
  const totalProtein = items.reduce((sum, item) => sum + (item.proteinG ?? 0), 0)
  const totalCarbs = items.reduce((sum, item) => sum + (item.carbsG ?? 0), 0)
  const totalFat = items.reduce((sum, item) => sum + (item.fatG ?? 0), 0)
  const hasMacros = totalProtein > 0 || totalCarbs > 0 || totalFat > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[2rem] border-border bg-card p-0 max-h-[85dvh] flex flex-col"
        data-testid="meal-detail-sheet"
      >
        {/* Drag handle */}
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />

        {/* Header */}
        <SheetHeader className="shrink-0 flex flex-row items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                Chi tiết bữa ăn
              </p>
              <SheetTitle className="mt-0.5 text-lg font-black tracking-tight text-foreground">
                {meta.label}
              </SheetTitle>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">
              {formatCalories(totalCal)}
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted active:scale-95"
              aria-label="Đóng"
            >
              <X className="size-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <Utensils className="size-6" />
              </span>
              <p className="text-sm font-semibold text-foreground">Chưa có món ăn nào</p>
              <p className="text-xs text-muted-foreground mt-1">Thêm thực phẩm để xem chi tiết dinh dưỡng.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const hasMacro = (item.proteinG ?? 0) > 0 || (item.carbsG ?? 0) > 0 || (item.fatG ?? 0) > 0
              return (
                <div
                  key={`${item.foodItemId}-${index}`}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  {/* Item header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground leading-snug">
                        {item.foodName || "Món ăn thô"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Lượng: {item.quantity} {item.unit || "phần"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                      {formatCalories(item.calories ?? 0)}
                    </span>
                  </div>

                  {/* Macro breakdown per item */}
                  {hasMacro && (
                    <div className="mt-3 flex gap-2">
                      <MacroPill
                        label="Đạm"
                        value={item.proteinG ?? 0}
                        colorClass="border-sky-100 bg-sky-50 text-sky-700"
                      />
                      <MacroPill
                        label="Bột"
                        value={item.carbsG ?? 0}
                        colorClass="border-amber-100 bg-amber-50 text-amber-700"
                      />
                      <MacroPill
                        label="Béo"
                        value={item.fatG ?? 0}
                        colorClass="border-orange-100 bg-orange-50 text-orange-700"
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Meal macro summary footer */}
        {hasMacros && items.length > 0 && (
          <div className="shrink-0 border-t border-border bg-muted/40 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
              Tổng macro — {meta.label}
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calo</p>
                <p className="mt-1 text-base font-black text-foreground">{Math.round(totalCal)}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Đạm</p>
                <p className="mt-1 text-base font-black text-sky-700">{totalProtein.toFixed(1)}g</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Bột</p>
                <p className="mt-1 text-base font-black text-amber-700">{totalCarbs.toFixed(1)}g</p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Béo</p>
                <p className="mt-1 text-base font-black text-orange-700">{totalFat.toFixed(1)}g</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
