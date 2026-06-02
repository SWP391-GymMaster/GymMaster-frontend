import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Nhập email hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

const passwordSchema = z
  .string()
  .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")

export const signupSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  email: z.email("Nhập email hợp lệ."),
  phone: z.string().trim().optional(),
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: z.email("Nhập email hợp lệ."),
})

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Vui lòng nhập mã đặt lại mật khẩu."),
  newPassword: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
  newPassword: passwordSchema,
})

export type SignupFormValues = z.infer<typeof signupSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
