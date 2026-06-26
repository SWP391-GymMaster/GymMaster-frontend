import { z } from "zod"

export const packageFormSchema = z.object({
  name: z.string().min(2, "Tên gói tập phải từ 2 ký tự trở lên"),
  durationDays: z.coerce
    .number({ message: "Vui lòng nhập số ngày" })
    .int("Thời hạn phải là số nguyên")
    .positive("Thời hạn phải là số ngày dương"),
  price: z.coerce
    .number({ message: "Vui lòng nhập giá tiền" })
    .nonnegative("Giá tiền không được nhỏ hơn 0"),
  status: z.enum(["active", "inactive"]),
  supportsPT: z.boolean(),
})

export type PackageFormInput = z.input<typeof packageFormSchema>
export type PackageFormValues = z.output<typeof packageFormSchema>
