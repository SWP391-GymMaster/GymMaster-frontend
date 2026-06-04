import { http, HttpResponse, passthrough } from "msw"

import { foodItems, mealLogs } from "@/mocks/data/gymmaster.mock-data"
import {
  created,
  fail,
  getPage,
  ok,
  paged,
  requireRole,
} from "@/mocks/utils/api-response"

function calculateMealCalories(log: (typeof mealLogs)[number]) {
  return log.items.reduce((total, item) => {
    const food = foodItems.find((candidate) => candidate.id === item.foodItemId)

    return total + (food?.caloriesPerUnit ?? 0) * item.quantity
  }, 0)
}

function enrichMealLog(log: (typeof mealLogs)[number]) {
  return {
    ...log,
    items: log.items.map((item) => {
      const food = foodItems.find((candidate) => candidate.id === item.foodItemId)

      return {
        ...item,
        foodName: food?.name,
        unit: food?.unit,
        calories: (food?.caloriesPerUnit ?? 0) * item.quantity,
        proteinG: food?.proteinG != null ? Number(((food.proteinG) * item.quantity).toFixed(1)) : undefined,
        carbsG: food?.carbsG != null ? Number(((food.carbsG) * item.quantity).toFixed(1)) : undefined,
        fatG: food?.fatG != null ? Number(((food.fatG) * item.quantity).toFixed(1)) : undefined,
      }
    }),
  }
}

export const nutritionHandlers = [
  http.post("/api/members/:id/calorie-target", async ({ params, request }) => {
    const role = requireRole(request, ["member", "pt"])
    if (typeof role !== "string") return role
    const body = (await request.json()) as Record<string, unknown>

    return created({
      memberId: Number(params.id),
      ...body,
    })
  }),
  http.get("/api/food-items", ({ request }) => {
    const role = requireRole(request, ["member", "pt", "admin"])
    if (typeof role !== "string") return role

    const query = new URL(request.url).searchParams.get("query")?.toLowerCase()
    const filtered = query
      ? foodItems.filter((item) => {
          const nameLower = item.name.toLowerCase()
          const terms = query.trim().split(/\s+/)
          return terms.every((term) => nameLower.includes(term))
        })
      : foodItems

    return paged(filtered, getPage(request.url))
  }),
  http.post("/api/food-items", async ({ request }) => {
    const role = requireRole(request, ["member"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as unknown as Record<string, unknown>
    const food = {
      id: Math.max(...foodItems.map((item) => item.id)) + 1,
      name: (body.name as string) ?? "Custom food",
      unit: (body.unit as string) ?? "serving",
      caloriesPerUnit: (body.caloriesPerUnit as number) ?? 0,
      carbsG: (body.carbsG as number) ?? 0,
      proteinG: (body.proteinG as number) ?? 0,
      fatG: (body.fatG as number) ?? 0,
    } as unknown as (typeof foodItems)[number]
    foodItems.push(food)

    return created(food)
  }),
  http.get("/api/meal-logs", ({ request }) => {
    const role = requireRole(request, ["member"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const memberId = Number(url.searchParams.get("memberId") ?? "0")
    const date = url.searchParams.get("date")

    if (!memberId || !date) {
      return fail("VALIDATION_ERROR", "Member and date are required", 422)
    }

    return ok(
      mealLogs
        .filter((log) => log.memberId === memberId && log.logDate === date)
        .map(enrichMealLog),
    )
  }),
  http.post("/api/meal-logs", async ({ request }) => {
    const role = requireRole(request, ["member"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as Partial<(typeof mealLogs)[number]>

    if (!body.items?.length) {
      return fail("VALIDATION_ERROR", "Meal log requires at least one item", 422)
    }

    const invalidItem = body.items.find((item) => item.quantity <= 0)
    if (invalidItem) {
      return fail("INVALID_QUANTITY", "Quantity must be greater than zero", 422)
    }

    const missingFood = body.items.find(
      (item) => !foodItems.some((food) => food.id === item.foodItemId),
    )
    if (missingFood) {
      return fail("FOOD_NOT_FOUND", "Food item was not found", 404)
    }

    const log = {
      id: Math.max(...mealLogs.map((item) => item.id)) + 1,
      memberId: body.memberId ?? 101,
      logDate: body.logDate ?? new Date().toISOString().slice(0, 10),
      mealType: body.mealType ?? "meal",
      items: body.items,
    }
    mealLogs.push(log)

    return created(enrichMealLog(log))
  }),
  http.get("/api/members/:id/calorie-summary", ({ params, request }) => {
    const role = requireRole(request, ["member", "pt"])
    if (typeof role !== "string") return role

    const date =
      new URL(request.url).searchParams.get("date") ??
      new Date().toISOString().slice(0, 10)
    const target = 2200
    const consumed = mealLogs
      .filter(
        (item) => item.memberId === Number(params.id) && item.logDate === date,
      )
      .reduce((total, item) => total + calculateMealCalories(item), 0)

    return ok({
      memberId: Number(params.id),
      date,
      consumed,
      target,
      remaining: target - consumed,
    })
  }),
  http.get("/api/members/:id/calorie-history", ({ params, request }) => {
    const role = requireRole(request, ["member", "pt"])
    if (typeof role !== "string") return role

    const memberLogs = mealLogs.filter(
      (item) => item.memberId === Number(params.id),
    )
    const daily = memberLogs.map((log) => ({
      date: log.logDate,
      consumed: calculateMealCalories(log),
      target: 2200,
    }))

    return ok(daily)
  }),
  http.get("https://world.openfoodfacts.org/cgi/search.pl", ({ request }) => {
    const url = new URL(request.url)
    const terms = url.searchParams.get("search_terms")?.toLowerCase() || ""

    if (terms.includes("sữa")) {
      return HttpResponse.json({
        products: [
          {
            product_name_vi: "Sữa tươi TH True Milk ít đường",
            product_name: "Sữa tươi TH True Milk ít đường 180ml",
            brands: "TH True Milk",
            serving_size: "180ml",
            nutriments: {
              "energy-kcal_100g": 70,
              proteins_100g: 3,
              carbohydrates_100g: 7.5,
              fat_100g: 3.3,
            },
          },
          {
            product_name_vi: "Sữa đậu nành Fami nguyên chất",
            product_name: "Sữa đậu nành Fami nguyên chất 200ml",
            brands: "Fami",
            serving_size: "200ml",
            nutriments: {
              "energy-kcal_100g": 54,
              proteins_100g: 2.1,
              carbohydrates_100g: 7.2,
              fat_100g: 1.8,
            },
          },
        ],
      })
    }

    if (terms.includes("mì tôm") || terms.includes("mì hảo hảo")) {
      return HttpResponse.json({
        products: [
          {
            product_name_vi: "Mì Hảo Hảo chua cay",
            product_name: "Mì tôm Hảo Hảo chua cay",
            brands: "Acecook",
            serving_size: "75g",
            nutriments: {
              "energy-kcal_100g": 466,
              proteins_100g: 9.2,
              carbohydrates_100g: 62.4,
              fat_100g: 20.1,
            },
          },
        ],
      })
    }

    return passthrough()
  }),
  http.get("https://world.openfoodfacts.org/api/v2/product/*", ({ request }) => {
    const url = new URL(request.url)
    const match = url.pathname.match(/\/product\/(\d+)\.json$/)
    const barcode = match ? match[1] : ""

    if (barcode === "8936079015707") {
      return HttpResponse.json({
        status: 1,
        product: {
          product_name_vi: "Sữa tươi TH True Milk ít đường",
          product_name: "Sữa tươi TH True Milk ít đường 180ml",
          brands: "TH True Milk",
          serving_size: "180ml",
          nutriments: {
            "energy-kcal_100g": 70,
            proteins_100g: 3,
            carbohydrates_100g: 7.5,
            fat_100g: 3.3,
          },
        },
      })
    }
    if (barcode === "8934822903102") {
      return HttpResponse.json({
        status: 1,
        product: {
          product_name_vi: "Nước ngọt Coca-Cola 320ml",
          product_name: "Coca-Cola 320ml",
          brands: "Coca-Cola",
          serving_size: "320ml",
          nutriments: {
            "energy-kcal_100g": 42,
            proteins_100g: 0,
            carbohydrates_100g: 10.6,
            fat_100g: 0,
          },
        },
      })
    }
    return passthrough()
  }),
]
