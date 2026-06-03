"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, CheckCircle2, Scale, Utensils } from "lucide-react"
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
    const updated = [food, ...filtered].slice(0, 5)
    localStorage.setItem(LOCAL_STORAGE_KEY_RECENT_FOODS, JSON.stringify(updated))
  } catch (e) {
    console.warn(e)
  }
}

type MealLogFormProps = {
  date: string
  onSuccess?: () => void
}

export function MealLogForm({ date, onSuccess }: MealLogFormProps) {
  const memberId = useCurrentMemberProfileId()
  const createMealLog = useCreateMemberMealLog()
  const [foodQuery, setFoodQuery] = useState("")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])

  useEffect(() => {
    setRecentFoods(getRecentFoods())
  }, [selectedFood])
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
      mealType: "lunch",
      quantity: 1,
    },
  })

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

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" id="add-meal">
      <FoodSearchPanel
        onQueryChange={setFoodQuery}
        onSelectFood={selectFood}
        query={foodQuery}
        selectedFoodId={selectedFood?.id}
      />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Utensils aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Thêm bữa ăn
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Chọn món, loại bữa và khẩu phần. Calo được tính từ cơ sở dữ liệu món ăn.
            </p>
          </div>
        </div>

        {recentFoods.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
              Gợi ý gần đây:
            </p>
            <div className="flex flex-wrap gap-2">
              {recentFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => selectFood(food)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition active:scale-95",
                    selectedFood?.id === food.id
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  {food.name}
                </button>
              ))}
            </div>
          </div>
        )}

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

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-background border border-border p-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Calo</p>
                <p className="mt-1 text-sm font-bold text-foreground">{estimatedCalories}</p>
              </div>
              <div className="rounded-xl bg-background border border-border p-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Carbs</p>
                <p className="mt-1 text-sm font-bold text-foreground">{Math.round((selectedFood.carbsG || 0) * quantity)}g</p>
              </div>
              <div className="rounded-xl bg-background border border-border p-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-500">Protein</p>
                <p className="mt-1 text-sm font-bold text-foreground">{Math.round((selectedFood.proteinG || 0) * quantity)}g</p>
              </div>
              <div className="rounded-xl bg-background border border-border p-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500">Fat</p>
                <p className="mt-1 text-sm font-bold text-foreground">{Math.round((selectedFood.fatG || 0) * quantity)}g</p>
              </div>
            </div>
          </div>
        ) : (
          <StateBlock
            className="mt-5"
            description="Chọn một món ăn trước khi gửi bữa."
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
                const isActive = watch("mealType") === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("mealType", t, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition active:scale-95",
                      isActive
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {formatMealType(t)}
                  </button>
                );
              })}
            </div>
            {errors.mealType ? (
              <p className="mt-1 text-xs font-medium text-destructive">
                {errors.mealType.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ngày" icon={CalendarDays}>
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
              <Field label="Khẩu phần" icon={Scale}>
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
              <div className="flex gap-1.5 flex-wrap">
                {[0.5, 1, 1.5, 2, 3].map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setValue("quantity", mult, { shouldValidate: true })}
                    className={cn(
                      "px-2.5 py-1 text-[11px] rounded-lg border transition active:scale-95",
                      quantity === mult
                        ? "border-primary bg-primary/10 text-primary font-semibold"
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

          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ước tính bữa ăn</span>
              <span className="text-lg font-semibold text-foreground">
                {formatCalories(estimatedCalories)}
              </span>
            </div>
          </div>

          <Button
            className="min-h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
            data-testid="member-add-meal-button"
            disabled={createMealLog.isPending}
            type="submit"
          >
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {createMealLog.isPending ? "Đang thêm..." : "Thêm bữa ăn"}
          </Button>
        </form>

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
