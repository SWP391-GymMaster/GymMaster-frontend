import type { MealType } from "@/features/member-nutrition/types/member-nutrition.types"

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ",
}

export function formatCalories(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")} kcal`
}

export function formatMacro(value?: number) {
  if (typeof value !== "number") {
    return "Chưa có"
  }

  return `${Math.round(value).toLocaleString("vi-VN")} g`
}

export function formatMealType(value: string) {
  return mealTypeLabels[value as MealType] ?? value
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function getRemainingLabel(value: number) {
  if (value < 0) {
    return `Vượt ${formatCalories(Math.abs(value))}`
  }

  return `Còn ${formatCalories(value)}`
}
