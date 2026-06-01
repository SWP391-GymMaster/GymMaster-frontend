import { apiRequest } from "@/lib/api/http-client"
import type { AuthUser, LoginRequest, LoginSuccess } from "@/types/auth"

const authBasePath = "/api/v1/auth"

export function login(request: LoginRequest) {
  return apiRequest<LoginSuccess>(`${authBasePath}/login`, {
    method: "POST",
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
