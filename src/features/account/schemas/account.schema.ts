import { z } from "zod"

const vnPhonePattern = /^(0|\+84)(\d{9,10})$/

export const accountSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || vnPhonePattern.test(value), {
      message: "Số điện thoại Việt Nam không hợp lệ.",
    }),
})

export type AccountFormValues = z.infer<typeof accountSchema>
