import { z } from "zod"

export const customFoodSchema = z.object({
  name: z.string()
    .min(2, "Tên món ăn phải có ít nhất 2 ký tự.")
    .max(100, "Tên món ăn không được dài quá 100 ký tự."),
  unit: z.string()
    .min(1, "Nhập đơn vị tính (ví dụ: gam, cái, chén).")
    .max(30, "Đơn vị tính không được dài quá 30 ký tự."),
  caloriesPerUnit: z.coerce
    .number({
      message: "Nhập hàm lượng calo.",
    })
    .nonnegative("Hàm lượng calo không được là số âm."),
})

export type CustomFoodFormInput = z.input<typeof customFoodSchema>
export type CustomFoodFormValues = z.output<typeof customFoodSchema>
