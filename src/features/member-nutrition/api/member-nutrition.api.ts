import { apiRequest } from "@/lib/api/http-client"
import type {
  CalorieHistoryPoint,
  CalorieSummary,
  CreateMealLogDraft,
  FoodItem,
  MealLog,
  PagedResult,
  CreateCustomFoodInput,
  SetCalorieTargetInput,
  CalorieTarget,
} from "@/features/member-nutrition/types/member-nutrition.types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function searchFoodItems(accessToken: string, query: string) {
  return apiRequest<PagedResult<FoodItem>>(
    `/api/v1/food-items?query=${encodeURIComponent(query)}&page=1`,
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
    `/api/v1/meal-logs?memberId=${memberId}&date=${encodeURIComponent(date)}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

// Backend nhan mealType dang byte (enum): Breakfast=1, Lunch=2, Dinner=3, Snack=4.
const MEAL_TYPE_TO_BYTE: Record<string, number> = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
}

export async function createMemberMealLog(
  accessToken: string,
  draft: CreateMealLogDraft,
) {
  const body = {
    ...draft,
    mealType: MEAL_TYPE_TO_BYTE[draft.mealType] ?? draft.mealType,
  }
  return apiRequest<MealLog>("/api/v1/meal-logs", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  })
}

export async function getMemberCalorieSummary(
  accessToken: string,
  memberId: number,
  date: string,
) {
  return apiRequest<CalorieSummary>(
    `/api/v1/members/${memberId}/calorie-summary?date=${encodeURIComponent(date)}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export async function setMemberCalorieTarget(
  accessToken: string,
  memberId: number,
  input: SetCalorieTargetInput,
) {
  return apiRequest<CalorieTarget>(
    `/api/v1/members/${memberId}/calorie-target`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
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
    `/api/v1/members/${memberId}/calorie-history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export async function createCustomFoodItem(
  accessToken: string,
  input: CreateCustomFoodInput,
) {
  return apiRequest<FoodItem>("/api/v1/food-items", {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
}

type OpenFoodFactsProduct = {
  product_name_vi?: string
  product_name?: string
  brands?: string
  serving_size?: string
  nutriments?: Record<string, number | string | undefined>
}

function normalizeExternalFood(
  product: OpenFoodFactsProduct,
  fallbackName: string,
): CreateCustomFoodInput {
  let name = product.product_name_vi || product.product_name || fallbackName

  if (product.brands) {
    name = `${name} (${product.brands})`.trim()
  }

  if (name.length > 100) {
    name = `${name.slice(0, 97)}...`
  }

  let unit = product.serving_size || "100g"

  if (unit.length > 30) {
    unit = `${unit.slice(0, 27)}...`
  }

  const nutrients = product.nutriments || {}
  const caloriesPerUnit = Math.max(
    0,
    Math.round(
      Number(nutrients["energy-kcal_100g"] ?? nutrients["energy-kcal_serving"] ?? 0),
    ),
  )
  const proteinG = Math.max(
    0,
    Number(nutrients.proteins_100g ?? nutrients.proteins_serving ?? 0),
  )
  const carbsG = Math.max(
    0,
    Number(nutrients.carbohydrates_100g ?? nutrients.carbohydrates_serving ?? 0),
  )
  const fatG = Math.max(
    0,
    Number(nutrients.fat_100g ?? nutrients.fat_serving ?? 0),
  )

  return {
    name,
    unit,
    caloriesPerUnit,
    carbsG: Number(carbsG.toFixed(1)),
    proteinG: Number(proteinG.toFixed(1)),
    fatG: Number(fatG.toFixed(1)),
  }
}

async function tryBackendBarcodeProxy(
  barcode: string,
  accessToken?: string,
): Promise<CreateCustomFoodInput | null | undefined> {
  if (!accessToken) return undefined

  const response = await fetch(
    `/api/v1/food-items/barcode/${encodeURIComponent(barcode)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    return undefined
  }

  const payload = await response.json()

  return payload?.data ?? null
}

async function tryBackendOnlineSearchProxy(
  query: string,
  accessToken?: string,
): Promise<CreateCustomFoodInput[] | undefined> {
  if (!accessToken) return undefined

  const response = await fetch(
    `/api/v1/food-items/online-search?query=${encodeURIComponent(query)}&page=1&pageSize=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (response.status === 429) {
    throw new Error("Too Many Requests (429)")
  }

  if (!response.ok) {
    return undefined
  }

  const payload = await response.json()

  return Array.isArray(payload?.data) ? payload.data : undefined
}

export async function fetchFoodByBarcode(
  barcode: string,
  accessToken?: string,
): Promise<CreateCustomFoodInput | null> {
  try {
    const proxiedFood = await tryBackendBarcodeProxy(barcode, accessToken)

    if (proxiedFood !== undefined) {
      return proxiedFood
    }

    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (data.status !== 1 || !data.product) {
      return null
    }

    return normalizeExternalFood(data.product, `Sản phẩm ${barcode}`)
  } catch (error) {
    console.error("Open Food Facts fetch failed:", error)
    return null
  }
}

export async function searchFoodOnline(
  query: string,
  accessToken?: string,
): Promise<CreateCustomFoodInput[]> {
  try {
    const proxiedFoods = await tryBackendOnlineSearchProxy(query, accessToken)

    if (proxiedFoods) {
      return proxiedFoods
    }

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1`
    )
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

    return data.products
      .slice(0, 10)
      .map((product: OpenFoodFactsProduct) =>
        normalizeExternalFood(product, "Sản phẩm không tên"),
      )
  } catch (error) {
    console.error("Open Food Facts online search failed:", error)
    throw error
  }
}

