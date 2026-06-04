import { apiRequest } from "@/lib/api/http-client"
import type {
  CalorieHistoryPoint,
  CalorieSummary,
  CreateMealLogDraft,
  FoodItem,
  MealLog,
  PagedResult,
  CreateCustomFoodInput,
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

export async function createCustomFoodItem(
  accessToken: string,
  input: CreateCustomFoodInput,
) {
  return apiRequest<FoodItem>("/api/food-items", {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
}

export async function fetchFoodByBarcode(barcode: string): Promise<CreateCustomFoodInput | null> {
  try {
    console.log(`[DEBUG] fetchFoodByBarcode called for barcode: ${barcode}`)
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`)
    console.log(`[DEBUG] fetch response status: ${response.status}, ok: ${response.ok}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    console.log(`[DEBUG] parsed json data:`, JSON.stringify(data))
    if (data.status !== 1 || !data.product) {
      return null
    }

    const p = data.product
    
    // Truncate name to 100 chars for Zod schema compliance
    let name = p.product_name_vi || p.product_name || `Sản phẩm ${barcode}`
    if (p.brands) {
      name = `${name} (${p.brands})`.trim()
    }
    if (name.length > 100) {
      name = name.slice(0, 97) + "..."
    }

    // Truncate unit to 30 chars
    let unit = p.serving_size || "100g"
    if (unit.length > 30) {
      unit = unit.slice(0, 27) + "..."
    }

    // Safe nutrient calculations >= 0
    const nut = p.nutriments || {}
    const caloriesPerUnit = Math.max(0, Math.round(nut["energy-kcal_100g"] || nut["energy-kcal_serving"] || 0))
    const proteinG = Math.max(0, Number(nut.proteins_100g || nut.proteins_serving || 0))
    const carbsG = Math.max(0, Number(nut.carbohydrates_100g || nut.carbohydrates_serving || 0))
    const fatG = Math.max(0, Number(nut.fat_100g || nut.fat_serving || 0))

    return {
      name,
      unit,
      caloriesPerUnit,
      carbsG: Number(carbsG.toFixed(1)),
      proteinG: Number(proteinG.toFixed(1)),
      fatG: Number(fatG.toFixed(1)),
    }
  } catch (error) {
    console.error("Open Food Facts fetch failed:", error)
    return null
  }
}

export async function searchFoodOnline(query: string): Promise<CreateCustomFoodInput[]> {
  try {
    console.log(`[DEBUG] searchFoodOnline called for query: ${query}`)
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1`
    )
    console.log(`[DEBUG] searchFoodOnline response status: ${response.status}, ok: ${response.ok}`)
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too Many Requests (429)")
      }
      throw new Error(`HTTP Error ${response.status}`)
    }
    const data = await response.json()
    if (!data.products || !Array.isArray(data.products)) {
      return []
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.products.slice(0, 10).map((p: any) => {
      let name = p.product_name_vi || p.product_name || "Sản phẩm không tên"
      if (p.brands) {
        name = `${name} (${p.brands})`.trim()
      }
      if (name.length > 100) {
        name = name.slice(0, 97) + "..."
      }

      let unit = p.serving_size || "100g"
      if (unit.length > 30) {
        unit = unit.slice(0, 27) + "..."
      }

      const nut = p.nutriments || {}
      const caloriesPerUnit = Math.max(
        0,
        Math.round(nut["energy-kcal_100g"] || nut["energy-kcal_serving"] || 0)
      )
      const proteinG = Math.max(0, Number(nut.proteins_100g || nut.proteins_serving || 0))
      const carbsG = Math.max(0, Number(nut.carbohydrates_100g || nut.carbohydrates_serving || 0))
      const fatG = Math.max(0, Number(nut.fat_100g || nut.fat_serving || 0))

      return {
        name,
        unit,
        caloriesPerUnit,
        carbsG: Number(carbsG.toFixed(1)),
        proteinG: Number(proteinG.toFixed(1)),
        fatG: Number(fatG.toFixed(1)),
      }
    })
  } catch (error) {
    console.error("Open Food Facts online search failed:", error)
    throw error
  }
}


