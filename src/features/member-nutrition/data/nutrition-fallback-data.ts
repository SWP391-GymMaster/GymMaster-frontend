export type NutritionFoodSeed = {
  id: number
  name: string
  aliases: string[]
  unit: string
  caloriesPerUnit: number
  proteinG: number
  carbsG: number
  fatG: number
  source: "fallback"
  servingDescription?: string
}

export const fallbackNutritionFoods: NutritionFoodSeed[] = [
  { id: 9001, name: "Ức gà luộc", aliases: ["uc ga", "chicken breast"], unit: "100g", caloriesPerUnit: 165, proteinG: 31, carbsG: 0, fatG: 3.6, source: "fallback" },
  { id: 9002, name: "Đùi gà bỏ da", aliases: ["dui ga", "chicken thigh"], unit: "100g", caloriesPerUnit: 177, proteinG: 24, carbsG: 0, fatG: 8, source: "fallback" },
  { id: 9003, name: "Thịt bò nạc", aliases: ["beef lean", "bo nac"], unit: "100g", caloriesPerUnit: 217, proteinG: 26, carbsG: 0, fatG: 12, source: "fallback" },
  { id: 9004, name: "Thịt heo nạc", aliases: ["pork lean", "heo nac"], unit: "100g", caloriesPerUnit: 242, proteinG: 27, carbsG: 0, fatG: 14, source: "fallback" },
  { id: 9005, name: "Cá hồi", aliases: ["salmon", "ca hoi"], unit: "100g", caloriesPerUnit: 208, proteinG: 20, carbsG: 0, fatG: 13, source: "fallback" },
  { id: 9006, name: "Cá ngừ", aliases: ["tuna", "ca ngu"], unit: "100g", caloriesPerUnit: 132, proteinG: 28, carbsG: 0, fatG: 1, source: "fallback" },
  { id: 9007, name: "Tôm luộc", aliases: ["shrimp", "tom"], unit: "100g", caloriesPerUnit: 99, proteinG: 24, carbsG: 0.2, fatG: 0.3, source: "fallback" },
  { id: 9008, name: "Trứng gà", aliases: ["egg", "trung ga"], unit: "1 quả", caloriesPerUnit: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, source: "fallback" },
  { id: 9009, name: "Lòng trắng trứng", aliases: ["egg white", "long trang trung"], unit: "1 lòng trắng", caloriesPerUnit: 17, proteinG: 3.6, carbsG: 0.2, fatG: 0.1, source: "fallback" },
  { id: 9010, name: "Đậu phụ", aliases: ["tofu", "dau phu"], unit: "100g", caloriesPerUnit: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8, source: "fallback" },
  { id: 9011, name: "Sữa chua Hy Lạp không đường", aliases: ["greek yogurt", "sua chua hy lap"], unit: "100g", caloriesPerUnit: 59, proteinG: 10, carbsG: 3.6, fatG: 0.4, source: "fallback" },
  { id: 9012, name: "Whey protein", aliases: ["whey", "protein powder"], unit: "1 muỗng", caloriesPerUnit: 120, proteinG: 24, carbsG: 3, fatG: 1.5, source: "fallback" },
  { id: 9020, name: "Cơm trắng", aliases: ["com", "rice", "white rice"], unit: "100g", caloriesPerUnit: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3, source: "fallback" },
  { id: 9021, name: "Cơm gạo lứt", aliases: ["brown rice", "gao lut"], unit: "100g", caloriesPerUnit: 111, proteinG: 2.6, carbsG: 23, fatG: 0.9, source: "fallback" },
  { id: 9022, name: "Yến mạch", aliases: ["oats", "yen mach"], unit: "40g", caloriesPerUnit: 150, proteinG: 5, carbsG: 27, fatG: 3, source: "fallback" },
  { id: 9023, name: "Khoai lang", aliases: ["sweet potato", "khoai lang"], unit: "100g", caloriesPerUnit: 86, proteinG: 1.6, carbsG: 20, fatG: 0.1, source: "fallback" },
  { id: 9024, name: "Khoai tây luộc", aliases: ["potato", "khoai tay"], unit: "100g", caloriesPerUnit: 87, proteinG: 1.9, carbsG: 20, fatG: 0.1, source: "fallback" },
  { id: 9025, name: "Bánh mì trắng", aliases: ["bread", "banh mi"], unit: "1 lát", caloriesPerUnit: 80, proteinG: 2.7, carbsG: 14, fatG: 1, source: "fallback" },
  { id: 9026, name: "Bún tươi", aliases: ["bun", "rice vermicelli"], unit: "100g", caloriesPerUnit: 110, proteinG: 1.7, carbsG: 25, fatG: 0.2, source: "fallback" },
  { id: 9027, name: "Phở tươi", aliases: ["pho noodle"], unit: "100g", caloriesPerUnit: 140, proteinG: 2.5, carbsG: 31, fatG: 0.4, source: "fallback" },
  { id: 9028, name: "Mì spaghetti chín", aliases: ["spaghetti", "pasta"], unit: "100g", caloriesPerUnit: 158, proteinG: 5.8, carbsG: 31, fatG: 0.9, source: "fallback" },
  { id: 9029, name: "Quinoa chín", aliases: ["quinoa"], unit: "100g", caloriesPerUnit: 120, proteinG: 4.4, carbsG: 21, fatG: 1.9, source: "fallback" },
  { id: 9040, name: "Chuối", aliases: ["banana", "chuoi"], unit: "1 quả", caloriesPerUnit: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, source: "fallback" },
  { id: 9041, name: "Táo", aliases: ["apple", "tao"], unit: "1 quả", caloriesPerUnit: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3, source: "fallback" },
  { id: 9042, name: "Cam", aliases: ["orange", "cam"], unit: "1 quả", caloriesPerUnit: 62, proteinG: 1.2, carbsG: 15, fatG: 0.2, source: "fallback" },
  { id: 9043, name: "Bơ", aliases: ["avocado", "bo"], unit: "100g", caloriesPerUnit: 160, proteinG: 2, carbsG: 8.5, fatG: 14.7, source: "fallback" },
  { id: 9044, name: "Dâu tây", aliases: ["strawberry", "dau tay"], unit: "100g", caloriesPerUnit: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3, source: "fallback" },
  { id: 9045, name: "Việt quất", aliases: ["blueberry", "viet quat"], unit: "100g", caloriesPerUnit: 57, proteinG: 0.7, carbsG: 14.5, fatG: 0.3, source: "fallback" },
  { id: 9046, name: "Xoài", aliases: ["mango", "xoai"], unit: "100g", caloriesPerUnit: 60, proteinG: 0.8, carbsG: 15, fatG: 0.4, source: "fallback" },
  { id: 9060, name: "Bông cải xanh", aliases: ["broccoli", "bong cai xanh"], unit: "100g", caloriesPerUnit: 34, proteinG: 2.8, carbsG: 6.6, fatG: 0.4, source: "fallback" },
  { id: 9061, name: "Rau bina", aliases: ["spinach", "rau bina"], unit: "100g", caloriesPerUnit: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4, source: "fallback" },
  { id: 9062, name: "Cà rốt", aliases: ["carrot", "ca rot"], unit: "100g", caloriesPerUnit: 41, proteinG: 0.9, carbsG: 10, fatG: 0.2, source: "fallback" },
  { id: 9063, name: "Dưa leo", aliases: ["cucumber", "dua leo"], unit: "100g", caloriesPerUnit: 15, proteinG: 0.7, carbsG: 3.6, fatG: 0.1, source: "fallback" },
  { id: 9064, name: "Cà chua", aliases: ["tomato", "ca chua"], unit: "100g", caloriesPerUnit: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2, source: "fallback" },
  { id: 9065, name: "Rau xà lách", aliases: ["lettuce", "xa lach"], unit: "100g", caloriesPerUnit: 15, proteinG: 1.4, carbsG: 2.9, fatG: 0.2, source: "fallback" },
  { id: 9066, name: "Bắp ngô", aliases: ["corn", "bap"], unit: "100g", caloriesPerUnit: 96, proteinG: 3.4, carbsG: 21, fatG: 1.5, source: "fallback" },
  { id: 9080, name: "Sữa tươi không đường", aliases: ["milk", "sua tuoi"], unit: "250ml", caloriesPerUnit: 122, proteinG: 8, carbsG: 12, fatG: 4.8, source: "fallback" },
  { id: 9081, name: "Sữa hạt không đường", aliases: ["almond milk", "sua hat"], unit: "250ml", caloriesPerUnit: 40, proteinG: 1, carbsG: 2, fatG: 3, source: "fallback" },
  { id: 9082, name: "Phô mai cottage", aliases: ["cottage cheese"], unit: "100g", caloriesPerUnit: 98, proteinG: 11, carbsG: 3.4, fatG: 4.3, source: "fallback" },
  { id: 9100, name: "Hạnh nhân", aliases: ["almond", "hanh nhan"], unit: "30g", caloriesPerUnit: 174, proteinG: 6.4, carbsG: 6.1, fatG: 15, source: "fallback" },
  { id: 9101, name: "Đậu phộng", aliases: ["peanut", "dau phong"], unit: "30g", caloriesPerUnit: 170, proteinG: 7.3, carbsG: 4.8, fatG: 14, source: "fallback" },
  { id: 9102, name: "Hạt điều", aliases: ["cashew", "hat dieu"], unit: "30g", caloriesPerUnit: 166, proteinG: 5.2, carbsG: 9, fatG: 13, source: "fallback" },
  { id: 9103, name: "Dầu olive", aliases: ["olive oil", "dau olive"], unit: "1 muỗng canh", caloriesPerUnit: 119, proteinG: 0, carbsG: 0, fatG: 13.5, source: "fallback" },
  { id: 9104, name: "Bơ đậu phộng", aliases: ["peanut butter", "bo dau phong"], unit: "1 muỗng canh", caloriesPerUnit: 94, proteinG: 4, carbsG: 3.2, fatG: 8, source: "fallback" },
  { id: 9120, name: "Phở bò", aliases: ["pho bo", "beef pho"], unit: "1 tô", caloriesPerUnit: 450, proteinG: 28, carbsG: 55, fatG: 12, source: "fallback" },
  { id: 9121, name: "Bún thịt nướng", aliases: ["bun thit nuong"], unit: "1 tô", caloriesPerUnit: 520, proteinG: 25, carbsG: 68, fatG: 16, source: "fallback" },
  { id: 9122, name: "Cơm tấm sườn", aliases: ["com tam", "broken rice"], unit: "1 phần", caloriesPerUnit: 650, proteinG: 32, carbsG: 82, fatG: 22, source: "fallback" },
  { id: 9123, name: "Bánh mì thịt", aliases: ["banh mi thit"], unit: "1 ổ", caloriesPerUnit: 550, proteinG: 22, carbsG: 70, fatG: 18, source: "fallback" },
  { id: 9124, name: "Gỏi cuốn tôm thịt", aliases: ["goi cuon", "spring roll"], unit: "1 cuốn", caloriesPerUnit: 95, proteinG: 5, carbsG: 13, fatG: 2, source: "fallback" },
  { id: 9125, name: "Canh rau", aliases: ["vegetable soup", "canh rau"], unit: "1 bát", caloriesPerUnit: 60, proteinG: 2, carbsG: 8, fatG: 2, source: "fallback" },
  { id: 9126, name: "Salad ức gà", aliases: ["chicken salad"], unit: "1 phần", caloriesPerUnit: 350, proteinG: 32, carbsG: 20, fatG: 15, source: "fallback" },
]

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

export function searchFallbackNutritionFoods(query: string, limit = 20) {
  const normalizedQuery = normalizeText(query)

  if (normalizedQuery.length < 2) return []

  return fallbackNutritionFoods
    .filter((food) => {
      const haystack = [food.name, ...food.aliases].map(normalizeText).join(" ")
      return haystack.includes(normalizedQuery)
    })
    .slice(0, limit)
}

