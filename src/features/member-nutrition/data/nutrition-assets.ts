export type NutritionAsset = {
  src: string
  title: string
  category: "protein" | "carb" | "fruit" | "vegetable" | "supplement" | "meal"
}

const nutritionAssetByFoodName: Record<string, NutritionAsset> = {
  "ức gà": { src: "/assets/gymmaster/nutrition/chicken-breast.jpg", title: "Ức gà", category: "protein" },
  "ức gà luộc": { src: "/assets/gymmaster/nutrition/chicken-breast.jpg", title: "Ức gà luộc", category: "protein" },
  "cơm": { src: "/assets/gymmaster/nutrition/white-rice.jpg", title: "Cơm trắng", category: "carb" },
  "cơm trắng": { src: "/assets/gymmaster/nutrition/white-rice.jpg", title: "Cơm trắng", category: "carb" },
  "yến mạch": { src: "/assets/gymmaster/nutrition/oats.jpg", title: "Yến mạch", category: "carb" },
  oats: { src: "/assets/gymmaster/nutrition/oats.jpg", title: "Oats", category: "carb" },
  chuối: { src: "/assets/gymmaster/nutrition/banana.jpg", title: "Chuối", category: "fruit" },
  banana: { src: "/assets/gymmaster/nutrition/banana.jpg", title: "Banana", category: "fruit" },
  salad: { src: "/assets/gymmaster/nutrition/salad-bowl.jpg", title: "Salad", category: "vegetable" },
  "salad ức gà": { src: "/assets/gymmaster/nutrition/salad-bowl.jpg", title: "Salad ức gà", category: "meal" },
  whey: { src: "/assets/gymmaster/nutrition/whey-protein.jpg", title: "Whey Protein", category: "supplement" },
  "whey protein": { src: "/assets/gymmaster/nutrition/whey-protein.jpg", title: "Whey Protein", category: "supplement" },
}

export const defaultNutritionAsset: NutritionAsset = {
  src: "/assets/gymmaster/nutrition/salad-bowl.jpg",
  title: "Food",
  category: "meal",
}

function normalizeFoodName(value: string) {
  return value.trim().toLowerCase()
}

export function getNutritionAssetForFood(name: string) {
  const normalizedName = normalizeFoodName(name)

  if (nutritionAssetByFoodName[normalizedName]) {
    return nutritionAssetByFoodName[normalizedName]
  }

  const partialMatch = Object.entries(nutritionAssetByFoodName).find(([key]) =>
    normalizedName.includes(key),
  )

  return partialMatch?.[1] ?? defaultNutritionAsset
}
