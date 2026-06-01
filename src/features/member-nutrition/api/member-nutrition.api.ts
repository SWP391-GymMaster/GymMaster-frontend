import { apiRequest } from "@/lib/api/http-client"
import type {
  CalorieHistoryPoint,
  CalorieSummary,
  CreateMealLogDraft,
  FoodItem,
  MealLog,
  PagedResult,
} from "@/features/member-nutrition/types/member-nutrition.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function searchFoodItems(accessToken: string, query: string) {
  return apiRequest<PagedResult<FoodItem>>(
    `/api/food-items?query=${encodeURIComponent(query)}&page=1`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export async function getMemberMealLogs(
  accessToken: string,
  memberId: number,
  date: string,
) {
  return apiRequest<MealLog[]>(
    `/api/meal-logs?memberId=${memberId}&date=${encodeURIComponent(date)}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export async function createMemberMealLog(
  accessToken: string,
  draft: CreateMealLogDraft,
) {
  return apiRequest<MealLog>("/api/meal-logs", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(draft),
  })
}

export async function getMemberCalorieSummary(
  accessToken: string,
  memberId: number,
  date: string,
) {
  return apiRequest<CalorieSummary>(
    `/api/members/${memberId}/calorie-summary?date=${encodeURIComponent(date)}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export async function getMemberCalorieHistory(
  accessToken: string,
  memberId: number,
  from: string,
  to: string,
) {
  return apiRequest<CalorieHistoryPoint[]>(
    `/api/members/${memberId}/calorie-history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}
