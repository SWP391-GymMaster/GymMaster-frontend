"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, CheckCircle2, Scale, Utensils, Sunrise, Sun, Moon, Cookie } from "lucide-react"
import { useState, useEffect, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  useCreateMemberMealLog,
  useCurrentMemberProfileId,
} from "@/features/member-nutrition/api/member-nutrition.queries"
import { FoodSearchPanel } from "@/features/member-nutrition/components/FoodSearchPanel"
import {
  mealLogSchema,
  mealTypes,
  type MealLogFormInput,
  type MealLogInput,
} from "@/features/member-nutrition/schemas/meal-log.schema"
import type { FoodItem } from "@/features/member-nutrition/types/member-nutrition.types"
import {
  formatCalories,
  formatMealType,
} from "@/features/member-nutrition/utils/nutrition-formatters"

const LOCAL_STORAGE_KEY_RECENT_FOODS = "gymmaster-recent-foods"

function getRecentFoods(): FoodItem[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_RECENT_FOODS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecentFood(food: FoodItem) {
  if (typeof window === "undefined") return
  try {
    const current = getRecentFoods()
    const filtered = current.filter((f) => f.id !== food.id)
    const updated = [food, ...filtered].slice(0, 10) // store up to 10 recent items
    localStorage.setItem(LOCAL_STORAGE_KEY_RECENT_FOODS, JSON.stringify(updated))
  } catch (e) {
    console.warn(e)
  }
}

type MealLogFormProps = {
  date: string
  defaultMealType?: "breakfast" | "lunch" | "dinner" | "snack"
  onSuccess?: () => void
}

export function MealLogForm({ date, defaultMealType = "lunch", onSuccess }: MealLogFormProps) {
  const memberId = useCurrentMemberProfileId()
  const createMealLog = useCreateMemberMealLog()
  const [foodQuery, setFoodQuery] = useState("")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<MealLogFormInput, unknown, MealLogInput>({
    resolver: zodResolver(mealLogSchema),
    defaultValues: {
      foodItemId: 0,
      logDate: date,
      mealType: defaultMealType,
      quantity: 1,
    },
  })

  // Sync defaultMealType with form value when prop changes
  useEffect(() => {
    setValue("mealType", defaultMealType, { shouldValidate: true })
  }, [defaultMealType, setValue])

  const quantity = Number(watch("quantity") || 0)
  const estimatedCalories = selectedFood
    ? Math.round(selectedFood.caloriesPerUnit * quantity)
    : 0

  function selectFood(food: FoodItem) {
    setSelectedFood(food)
    setValue("foodItemId", food.id, { shouldValidate: true })
  }

  async function onSubmit(values: MealLogInput) {
    if (!memberId) {
      toast.error("Chưa có hồ sơ hội viên.")
      return
    }

    await createMealLog.mutateAsync({
      memberId,
      logDate: values.logDate,
      mealType: values.mealType,
      items: [
        {
          foodItemId: values.foodItemId,
          quantity: values.quantity,
        },
      ],
    })
    toast.success("Đã thêm bữa ăn")
    if (selectedFood) {
      saveRecentFood(selectedFood)
    }
    reset({
      foodItemId: 0,
      logDate: date,
      mealType: values.mealType,
      quantity: 1,
    })
    setSelectedFood(null)
    onSuccess?.()
  }

  // Calculate macro distribution percentages (MyFitnessPal Donut Chart)
  const cG = selectedFood ? Math.round((selectedFood.carbsG || 0) * quantity) : 0
  const pG = selectedFood ? Math.round((selectedFood.proteinG || 0) * quantity) : 0
  const fG = selectedFood ? Math.round((selectedFood.fatG || 0) * quantity) : 0

  const cCal = cG * 4
  const pCal = pG * 4
  const fCal = fG * 9
  const totalCal = cCal + pCal + fCal

  const carbsPct = totalCal > 0 ? Math.round((cCal / totalCal) * 100) : 0
  const proteinPct = totalCal > 0 ? Math.round((pCal / totalCal) * 100) : 0
  const fatPct = totalCal > 0 ? 100 - carbsPct - proteinPct : 0

  const mealIconMap = {
    breakfast: Sunrise,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie,
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" id="add-meal">
      <FoodSearchPanel
        onQueryChange={setFoodQuery}
        onSelectFood={selectFood}
        query={foodQuery}
        selectedFoodId={selectedFood?.id}
      />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Utensils aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Ghi nhận dinh dưỡng
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Điều chỉnh số lượng và chọn buổi ăn để ghi vào nhật ký hàng ngày.
              </p>
            </div>
          </div>

          {selectedFood ? (
            <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-5">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3 mb-4">
                <div>
                  <p className="text-base font-bold text-foreground">
                    {selectedFood.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Phân lượng gốc: {selectedFood.caloriesPerUnit} kcal / {selectedFood.unit}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Đã chọn
                </span>
              </div>

              {/* MyFitnessPal Conic-Gradient Macro Ring */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div 
                  className="relative flex size-28 items-center justify-center rounded-full shadow-inner" 
                  style={{
                    background: totalCal > 0 
                      ? `conic-gradient(rgb(34, 197, 94) 0% ${carbsPct}%, rgb(14, 165, 233) ${carbsPct}% ${carbsPct + proteinPct}%, rgb(245, 158, 11) ${carbsPct + proteinPct}% 100%)`
                      : "rgb(228, 228, 231)" // fallback neutral if macros are missing
                  }}
                >
                  <div className="absolute size-20 rounded-full bg-card flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Calo</span>
                    <span className="text-lg font-black text-foreground">{estimatedCalories}</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-2 w-full text-center">
                  <div className="rounded-xl bg-background border border-border/80 p-2">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-green-500">Carbs</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{cG}g</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">{carbsPct}% calo</p>
                  </div>
                  <div className="rounded-xl bg-background border border-border/80 p-2">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-sky-500">Protein</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{pG}g</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">{proteinPct}% calo</p>
                  </div>
                  <div className="rounded-xl bg-background border border-border/80 p-2">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-500">Fat</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{fG}g</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">{fatPct}% calo</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <StateBlock
              className="mt-5"
              description="Chọn một món ăn từ bảng tra cứu bên trái trước khi gửi."
              title="Chưa chọn món ăn."
              tone="empty"
            />
          )}

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("foodItemId")} />

            {/* Segmented Meal Type Control */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Utensils className="size-4 text-primary" />
                Loại bữa ăn
              </label>
              <input type="hidden" {...register("mealType")} />
              <div className="grid grid-cols-4 gap-2">
                {mealTypes.map((t) => {
                  const isActive = watch("mealType") === t
                  const Icon = mealIconMap[t as keyof typeof mealIconMap] || Utensils
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue("mealType", t, { shouldValidate: true })}
                      className={cn(
                        "flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-11 p-2 rounded-xl border text-xs font-semibold transition active:scale-95",
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-3.5 shrink-0 text-primary" />
                      <span>{formatMealType(t)}</span>
                    </button>
                  )
                })}
              </div>
              {errors.mealType ? (
                <p className="mt-1 text-xs font-medium text-destructive">
                  {errors.mealType.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ngày ghi nhận" icon={CalendarDays}>
                <input
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  data-testid="member-meal-date-input"
                  id="meal-date"
                  type="date"
                  {...register("logDate")}
                />
                {errors.logDate ? (
                  <p className="mt-2 text-sm font-medium text-destructive">
                    {errors.logDate.message}
                  </p>
                ) : null}
              </Field>

              <div className="space-y-2">
                <Field label="Số phần ăn (khẩu phần)" icon={Scale}>
                  <input
                    className="min-h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    data-testid="member-meal-quantity-input"
                    id="meal-quantity"
                    min="0"
                    step="0.1"
                    type="number"
                    {...register("quantity")}
                  />
                </Field>
                <div className="flex gap-2 flex-wrap">
                  {[0.5, 1, 1.5, 2, 3].map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setValue("quantity", mult, { shouldValidate: true })}
                      className={cn(
                        "min-h-11 px-3 py-2 text-xs rounded-xl border transition active:scale-95 flex items-center justify-center font-bold min-w-[48px]",
                        quantity === mult
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>
                {errors.quantity ? (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {errors.quantity.message}
                  </p>
                ) : null}
                {errors.foodItemId ? (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {errors.foodItemId.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 mt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Ước tính lượng Calo</span>
                <span className="text-lg font-bold text-foreground">
                  {formatCalories(estimatedCalories)}
                </span>
              </div>
            </div>

            <Button
              className="min-h-[52px] rounded-xl bg-foreground text-background hover:bg-foreground/90 w-full mt-2"
              data-testid="member-add-meal-button"
              disabled={createMealLog.isPending}
              type="submit"
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              {createMealLog.isPending ? "Đang ghi nhật ký..." : "Ghi bữa ăn vào Nhật ký"}
            </Button>
          </form>
        </div>

        {createMealLog.isError ? (
          <StateBlock
            className="mt-4"
            description="Kiểm tra món ăn và khẩu phần đã chọn, sau đó thử lại."
            title="Không thể thêm bữa ăn."
            tone="error"
          />
        ) : null}
      </section>
    </div>
  )
}

function Field({
  children,
  icon: Icon,
  label,
}: {
  children: ReactNode
  icon: typeof Utensils
  label: string
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon aria-hidden="true" className="size-4 text-primary" />
        {label}
      </span>
      {children}
    </label>
  )
}
