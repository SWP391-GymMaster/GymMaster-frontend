import { z } from "zod"

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const

export const mealLogSchema = z.object({
  foodItemId: z.coerce
    .number({
      message: "Choose a food item.",
    })
    .int("Choose a food item.")
    .positive("Choose a food item."),
  logDate: z.string().min(1, "Choose a log date."),
  mealType: z.enum(mealTypes, {
    message: "Choose a meal type.",
  }),
  quantity: z.coerce
    .number({
      message: "Enter quantity.",
    })
    .positive("Quantity must be greater than zero."),
})

export type MealLogFormInput = z.input<typeof mealLogSchema>
export type MealLogInput = z.output<typeof mealLogSchema>
