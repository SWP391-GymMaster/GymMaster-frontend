import {
  fallbackNutritionFoods,
  searchFallbackNutritionFoods,
  type NutritionFoodSeed,
} from "@/features/member-nutrition/data/nutrition-fallback-data"

type NutritionSearchOptions = {
  usdaApiKey?: string
  preferOpenFoodFacts?: boolean
  signal?: AbortSignal
}

type ExternalNutritionFood = Omit<NutritionFoodSeed, "source"> & {
  source: "usda" | "open-food-facts" | "fallback"
  externalId?: string
}

const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
const OPEN_FOOD_FACTS_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"

export async function searchNutritionFoods(
  query: string,
  options: NutritionSearchOptions = {},
): Promise<ExternalNutritionFood[]> {
  const trimmedQuery = query.trim()

  if (trimmedQuery.length < 2) return []

  try {
    if (options.preferOpenFoodFacts) {
      const openFoodFacts = await searchOpenFoodFacts(trimmedQuery, options.signal)
      if (openFoodFacts.length > 0) return openFoodFacts
    }

    if (options.usdaApiKey) {
      const usdaFoods = await searchUsdaFoodDataCentral(
        trimmedQuery,
        options.usdaApiKey,
        options.signal,
      )
      if (usdaFoods.length > 0) return usdaFoods
    }

    const openFoodFacts = await searchOpenFoodFacts(trimmedQuery, options.signal)
    if (openFoodFacts.length > 0) return openFoodFacts
  } catch {
    // Keep the UI usable offline or when external APIs rate-limit.
  }

  return searchFallbackNutritionFoods(trimmedQuery).map((food) => ({
    ...food,
    source: "fallback",
  }))
}

async function searchUsdaFoodDataCentral(
  query: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<ExternalNutritionFood[]> {
  const url = new URL(USDA_SEARCH_URL)
  url.searchParams.set("api_key", apiKey)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      query,
      pageSize: 15,
      dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"],
    }),
  })

  if (!response.ok) return []

  const payload = (await response.json()) as {
    foods?: {
      fdcId: number
      description?: string
      servingSize?: number
      servingSizeUnit?: string
      foodNutrients?: {
        nutrientName?: string
        nutrientNumber?: string
        value?: number
      }[]
    }[]
  }

  return (payload.foods ?? []).map((food, index) => {
    const nutrients = food.foodNutrients ?? []
    const calories = findNutrient(nutrients, ["Energy", "208"])
    const protein = findNutrient(nutrients, ["Protein", "203"])
    const carbs = findNutrient(nutrients, ["Carbohydrate, by difference", "205"])
    const fat = findNutrient(nutrients, ["Total lipid (fat)", "204"])

    return {
      id: 500000 + index,
      externalId: String(food.fdcId),
      name: titleCase(food.description ?? `USDA food ${food.fdcId}`),
      aliases: [query],
      unit: food.servingSizeUnit
        ? `${food.servingSize ?? 100}${food.servingSizeUnit}`
        : "100g",
      caloriesPerUnit: Math.round(calories || 0),
      proteinG: roundMacro(protein),
      carbsG: roundMacro(carbs),
      fatG: roundMacro(fat),
      source: "usda",
    }
  })
}

async function searchOpenFoodFacts(
  query: string,
  signal?: AbortSignal,
): Promise<ExternalNutritionFood[]> {
  const url = new URL(OPEN_FOOD_FACTS_SEARCH_URL)
  url.searchParams.set("search_terms", query)
  url.searchParams.set("search_simple", "1")
  url.searchParams.set("action", "process")
  url.searchParams.set("json", "1")
  url.searchParams.set("page_size", "15")
  url.searchParams.set("fields", "code,product_name,nutriments,serving_size")

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    signal,
  })

  if (!response.ok) return []

  const payload = (await response.json()) as {
    products?: {
      code?: string
      product_name?: string
      serving_size?: string
      nutriments?: {
        "energy-kcal_100g"?: number
        proteins_100g?: number
        carbohydrates_100g?: number
        fat_100g?: number
      }
    }[]
  }

  return (payload.products ?? [])
    .filter((product) => product.product_name)
    .map((product, index) => ({
      id: 600000 + index,
      externalId: product.code,
      name: product.product_name ?? "Open Food Facts item",
      aliases: [query],
      unit: product.serving_size || "100g",
      caloriesPerUnit: Math.round(product.nutriments?.["energy-kcal_100g"] ?? 0),
      proteinG: roundMacro(product.nutriments?.proteins_100g),
      carbsG: roundMacro(product.nutriments?.carbohydrates_100g),
      fatG: roundMacro(product.nutriments?.fat_100g),
      source: "open-food-facts",
    }))
}

function findNutrient(
  nutrients: { nutrientName?: string; nutrientNumber?: string; value?: number }[],
  namesOrNumbers: string[],
) {
  return (
    nutrients.find((nutrient) =>
      namesOrNumbers.some(
        (target) =>
          nutrient.nutrientName === target ||
          nutrient.nutrientNumber === target,
      ),
    )?.value ?? 0
  )
}

function roundMacro(value?: number) {
  return Math.round((value ?? 0) * 10) / 10
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export { fallbackNutritionFoods, searchFallbackNutritionFoods }
