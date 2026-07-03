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

const today = new Date()
today.setHours(0, 0, 0, 0)

export const accountPersonalProfileSchema = z.object({
  dateOfBirth: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true
      const date = new Date(value)
      return !Number.isNaN(date.getTime()) && date <= today
    }, "Ngày sinh không được ở tương lai."),
  gender: z.enum(["", "male", "female", "other"]).optional(),
  address: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
})

export type AccountFormValues = z.infer<typeof accountSchema>
export type AccountPersonalProfileFormValues = z.infer<typeof accountPersonalProfileSchema>
