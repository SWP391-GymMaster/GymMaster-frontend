import { z } from "zod"

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const

export const mealLogSchema = z.object({
  foodItemId: z.coerce
    .number({
      message: "Chọn món ăn.",
    })
    .int("Chọn món ăn.")
    .positive("Chọn món ăn."),
  logDate: z.string().min(1, "Chọn ngày ghi nhận."),
  mealType: z.enum(mealTypes, {
    message: "Chọn loại bữa ăn.",
  }),
  quantity: z.coerce
    .number({
      message: "Nhập khẩu phần.",
    })
    .positive("Khẩu phần phải lớn hơn 0."),
})

export type MealLogFormInput = z.input<typeof mealLogSchema>
export type MealLogInput = z.output<typeof mealLogSchema>
