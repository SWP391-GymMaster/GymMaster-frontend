export type UserRole = "admin" | "staff" | "pt" | "member"

export type AuthUser = {
  userId: number
  email: string
  fullName: string
  role: UserRole
  status: "active" | "locked" | string
  // Id hồ sơ hội viên (member_profiles) — khác userId. null nếu chưa có hồ sơ.
  memberProfileId?: number | null
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: AuthUser
  role: UserRole
}

export type LoginRequest = {
  email: string
  password: string
}

export type GoogleLoginRequest = {
  idToken: string
}

export type RegisterRequest = {
  fullName: string
  email: string
  phone?: string
  password: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ForgotPasswordSuccess = {
  message: string
  resetToken?: string
}

export type ResetPasswordRequest = {
  email: string
  resetToken: string
  newPassword: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type AuthMessageSuccess = {
  message: string
}

export type LoginSuccess = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: AuthUser
  role?: UserRole | string
  redirectPath?: string
}

export type ApiError = {
  code: string
  message: string
  requestId?: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: ApiError | null
  meta: unknown
}

export type AuthError = {
  code: string
  message: string
  requestId?: string
}
