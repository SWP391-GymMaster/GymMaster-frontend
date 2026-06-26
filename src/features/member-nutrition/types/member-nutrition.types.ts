export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export type FoodItem = {
  id: number
  name: string
  unit: string
  caloriesPerUnit: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  isCustom?: boolean
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export type MealLogItemInput = {
  foodItemId: number
  quantity: number
}

export type MealLogItem = MealLogItemInput & {
  foodName?: string
  unit?: string
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
}

export type MealLog = {
  id: number
  memberId: number
  logDate: string
  mealType: MealType | string
  items: MealLogItem[]
}

export type CreateMealLogDraft = {
  memberId: number
  logDate: string
  mealType: MealType
  items: MealLogItemInput[]
}

export type CalorieSummary = {
  date: string
  consumed: number
  target: number | null
  remaining: number | null
  consumedProteinG: number
  consumedCarbG: number
  consumedFatG: number
  targetProteinG: number | null
  targetCarbG: number | null
  targetFatG: number | null
  remainingProteinG: number | null
  remainingCarbG: number | null
  remainingFatG: number | null
}

export type CalorieHistoryPoint = {
  date: string
  consumed: number
  target: number
}

// Spec 007 — POST /members/{id}/calorie-target (dat muc tieu calo/macro)
export type SetCalorieTargetInput = {
  dailyCalories: number
  proteinG?: number
  carbG?: number
  fatG?: number
  effectiveDate?: string
}

export type CalorieTarget = {
  id: number
  memberId: number
  effectiveDate: string
  dailyCalories: number
  proteinG?: number
  carbG?: number
  fatG?: number
}

export type CreateCustomFoodInput = {
  name: string
  unit: string
  caloriesPerUnit: number
  carbsG?: number
  proteinG?: number
  fatG?: number
}
