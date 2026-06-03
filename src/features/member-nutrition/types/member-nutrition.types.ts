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
  memberId: number
  date: string
  consumed: number
  target: number
  remaining: number
  proteinG?: number
  carbsG?: number
  fatG?: number
}

export type CalorieHistoryPoint = {
  date: string
  consumed: number
  target: number
}

export type CreateCustomFoodInput = {
  name: string
  unit: string
  caloriesPerUnit: number
  carbsG?: number
  proteinG?: number
  fatG?: number
}
