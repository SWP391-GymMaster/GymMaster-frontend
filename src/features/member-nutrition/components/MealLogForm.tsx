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
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectedFood.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCalories(selectedFood.caloriesPerUnit)} mỗi {selectedFood.unit}
                </p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Đã chọn
              </span>
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

            <Field label="Loại bữa" icon={Utensils}>
              <select
                className="min-h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                data-testid="member-meal-type-select"
                id="meal-type"
                {...register("mealType")}
              >
                {mealTypes.map((mealType) => (
                  <option key={mealType} value={mealType}>
                    {formatMealType(mealType)}
                  </option>
                ))}
              </select>
              {errors.mealType ? (
                <p className="mt-2 text-sm font-medium text-destructive">
                  {errors.mealType.message}
                </p>
              ) : null}
            </Field>
          </div>

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
            {errors.quantity ? (
              <p className="mt-2 text-sm font-medium text-destructive">
                {errors.quantity.message}
              </p>
            ) : null}
            {errors.foodItemId ? (
              <p className="mt-2 text-sm font-medium text-destructive">
                {errors.foodItemId.message}
              </p>
            ) : null}
          </Field>

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
