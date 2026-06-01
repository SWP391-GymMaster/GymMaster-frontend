export type UserRole = "admin" | "staff" | "pt" | "member"

export type AuthUser = {
  userId: number
  email: string
  fullName: string
  role: UserRole
  status: "active" | "locked" | string
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
