"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

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
import { formatCalories } from "@/features/member-nutrition/utils/nutrition-formatters"

type MealLogFormProps = {
  date: string
}

export function MealLogForm({ date }: MealLogFormProps) {
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
  } = useForm<MealLogFormInput, unknown, MealLogInput>({
    resolver: zodResolver(mealLogSchema),
    defaultValues: {
      foodItemId: 0,
      logDate: date,
      mealType: "lunch",
      quantity: 1,
    },
  })

  function selectFood(food: FoodItem) {
    setSelectedFood(food)
    setValue("foodItemId", food.id, { shouldValidate: true })
  }

  async function onSubmit(values: MealLogInput) {
    if (!memberId) {
      toast.error("Member profile is not available.")
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
    toast.success("Meal added")
    reset({
      foodItemId: 0,
      logDate: date,
      mealType: values.mealType,
      quantity: 1,
    })
    setSelectedFood(null)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <FoodSearchPanel
        onQueryChange={setFoodQuery}
        onSelectFood={selectFood}
        query={foodQuery}
        selectedFoodId={selectedFood?.id}
      />

      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Add meal</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Choose a food, meal type, and quantity. Calories are calculated from the
          food database.
        </p>

        {selectedFood ? (
          <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              {selectedFood.name}
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              {formatCalories(selectedFood.caloriesPerUnit)} per {selectedFood.unit}
            </p>
          </div>
        ) : (
          <StateBlock
            className="mt-4"
            description="Select a food result before submitting the meal."
            title="No food selected."
            tone="empty"
          />
        )}

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("foodItemId")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-zinc-800" htmlFor="meal-date">
                Date
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                data-testid="member-meal-date-input"
                id="meal-date"
                type="date"
                {...register("logDate")}
              />
              {errors.logDate ? (
                <p className="mt-2 text-sm font-medium text-red-700">
                  {errors.logDate.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-800" htmlFor="meal-type">
                Meal type
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                data-testid="member-meal-type-select"
                id="meal-type"
                {...register("mealType")}
              >
                {mealTypes.map((mealType) => (
                  <option key={mealType} value={mealType}>
                    {mealType[0].toUpperCase()}
                    {mealType.slice(1)}
                  </option>
                ))}
              </select>
              {errors.mealType ? (
                <p className="mt-2 text-sm font-medium text-red-700">
                  {errors.mealType.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-800" htmlFor="meal-quantity">
              Quantity
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-2xl border border-zinc-200 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              data-testid="member-meal-quantity-input"
              id="meal-quantity"
              min="0"
              step="0.1"
              type="number"
              {...register("quantity")}
            />
            {errors.quantity ? (
              <p className="mt-2 text-sm font-medium text-red-700">
                {errors.quantity.message}
              </p>
            ) : null}
            {errors.foodItemId ? (
              <p className="mt-2 text-sm font-medium text-red-700">
                {errors.foodItemId.message}
              </p>
            ) : null}
          </div>

          <Button
            className="min-h-12 rounded-full bg-zinc-950 text-white hover:bg-zinc-800"
            data-testid="member-add-meal-button"
            disabled={createMealLog.isPending}
            type="submit"
          >
            {createMealLog.isPending ? "Adding..." : "Add meal"}
          </Button>
        </form>

        {createMealLog.isError ? (
          <StateBlock
            className="mt-4"
            description="Review the selected food and quantity, then try again."
            title="Meal could not be added."
            tone="error"
          />
        ) : null}
      </section>
    </div>
  )
}
