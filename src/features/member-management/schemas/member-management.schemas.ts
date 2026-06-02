import { z } from "zod"

export const memberSearchSchema = z.object({
  query: z.string().trim().optional(),
})

export const createMemberSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  email: z.email("Nhập email hợp lệ."),
  phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 ký tự."),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
})

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  email: z.email("Nhập email hợp lệ."),
  phone: z.string().optional(),
  role: z.enum(["staff", "pt", "member"]),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự.",
    }),
})

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  email: z.email("Nhập email hợp lệ."),
  phone: z.string().optional(),
  role: z.enum(["staff", "pt", "member"]),
})

export const createTrainerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  specialty: z.string().min(2, "Vui lòng nhập chuyên môn."),
  userId: z.string().optional(),
})

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>
export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>
