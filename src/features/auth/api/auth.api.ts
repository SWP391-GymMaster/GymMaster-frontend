import { apiRequest } from "@/lib/api/http-client"
import type {
  AuthMessageSuccess,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordSuccess,
  GoogleLoginRequest,
  LoginRequest,
  LoginSuccess,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types/auth"

const authBasePath = "/api/v1/auth"

export function login(request: LoginRequest) {
  return apiRequest<LoginSuccess>(`${authBasePath}/login`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function loginWithGoogle(request: GoogleLoginRequest) {
  return apiRequest<LoginSuccess>(`${authBasePath}/google`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function registerMember(request: RegisterRequest) {
  return apiRequest<LoginSuccess>(`${authBasePath}/register`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function forgotPassword(request: ForgotPasswordRequest) {
  return apiRequest<ForgotPasswordSuccess>(`${authBasePath}/forgot-password`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function resetPassword(request: ResetPasswordRequest) {
  return apiRequest<AuthMessageSuccess>(`${authBasePath}/reset-password`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function changePassword(request: ChangePasswordRequest, accessToken: string) {
  return apiRequest<AuthMessageSuccess>(`${authBasePath}/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  })
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<AuthUser>(`${authBasePath}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function refreshSession(refreshToken: string) {
  return apiRequest<LoginSuccess>(`${authBasePath}/refresh`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })
}

export function logout(accessToken: string) {
  return apiRequest<void>(`${authBasePath}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
