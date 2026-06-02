import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")

export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().optional(),
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
})

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required."),
  newPassword: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: passwordSchema,
})

export type SignupFormValues = z.infer<typeof signupSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
