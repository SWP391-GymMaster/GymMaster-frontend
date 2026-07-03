import { z } from "zod"

export const memberSearchSchema = z.object({
  query: z.string().trim().optional(),
})

export const createMemberSchema = z.object({
  fullName: z.string().min(2, "Ho ten phai co it nhat 2 ky tu."),
  email: z.email("Nhap email hop le."),
  phone: z.string().min(8, "So dien thoai phai co it nhat 8 ky tu."),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
})

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Ho ten phai co it nhat 2 ky tu."),
  email: z.email("Nhap email hop le."),
  phone: z.string().optional(),
  role: z.enum(["staff", "admin"]),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 6, {
      message: "Mat khau phai co it nhat 6 ky tu.",
    }),
})

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Ho ten phai co it nhat 2 ky tu."),
  email: z.email("Nhap email hop le."),
  phone: z.string().optional(),
  role: z.enum(["staff", "admin"]).optional(),
})

export const createTrainerSchema = z
  .object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z
      .string()
      .optional()
      .refine((value) => !value || value.length >= 6, {
        message: "Mat khau phai co it nhat 6 ky tu.",
      }),
    specialty: z.string().min(2, "Vui long nhap chuyen mon."),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    yearsOfExperience: z
      .string()
      .optional()
      .refine((value) => !value || Number(value) >= 0, {
        message: "So nam kinh nghiem khong hop le.",
      }),
    bio: z.string().optional(),
    userId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.userId?.trim()) return

    if (!value.fullName?.trim() || value.fullName.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Ho ten phai co it nhat 2 ky tu.",
        path: ["fullName"],
      })
    }

    const email = value.email?.trim()
    if (!email || !z.email().safeParse(email).success) {
      ctx.addIssue({
        code: "custom",
        message: "Nhap email hop le.",
        path: ["email"],
      })
    }
  })

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>
export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>
