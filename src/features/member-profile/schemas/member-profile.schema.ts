import { z } from "zod"

import { vnTodayIso } from "@/lib/date/vn-time"

const vnPhonePattern = /^(0|\+84)(\d{9,10})$/

export const memberProfileGenderValues = ["male", "female", "other"] as const
const memberProfileGenderSchemaValues = [
  "",
  ...memberProfileGenderValues,
] as const

export const memberProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || vnPhonePattern.test(value), {
      message: "Số điện thoại Việt Nam không hợp lệ.",
    }),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value <= vnTodayIso(), {
      message: "Ngày sinh không được ở tương lai.",
    }),
  gender: z.enum(memberProfileGenderSchemaValues).optional(),
  address: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
})

export type MemberProfileFormValues = z.infer<typeof memberProfileSchema>
