import type { MealType } from "@/features/member-nutrition/types/member-nutrition.types"

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
}

export function formatCalories(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} kcal`
}

export function formatMacro(value?: number) {
  if (typeof value !== "number") {
    return "Not available"
  }

  return `${Math.round(value).toLocaleString("en-US")} g`
}

export function formatMealType(value: string) {
  return mealTypeLabels[value as MealType] ?? value
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function getRemainingLabel(value: number) {
  if (value < 0) {
    return `${formatCalories(Math.abs(value))} over target`
  }

  return `${formatCalories(value)} remaining`
}
