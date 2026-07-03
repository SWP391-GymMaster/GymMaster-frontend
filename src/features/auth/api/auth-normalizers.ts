import { ApiClientError } from "@/lib/api/http-client"
import { isUserRole } from "@/lib/auth/roles"
import type { AuthUser, LoginSuccess, UserRole } from "@/types/auth"

export type RawAuthUser = Partial<AuthUser> & {
  UserId?: number
  Email?: string
  FullName?: string
  Phone?: string | null
  AvatarUrl?: string | null
  Role?: string
  Status?: string
  MemberProfileId?: number | null
}

type RawLoginSuccess = Partial<LoginSuccess> & {
  AccessToken?: string
  RefreshToken?: string
  ExpiresAt?: string
  User?: RawAuthUser
  Role?: string
  RedirectPath?: string
}

export function readAuthUserRole(raw: RawAuthUser | undefined | null) {
  return raw?.Role ?? raw?.role
}

export function normalizeAuthUser(raw: RawAuthUser): AuthUser {
  const role = readAuthUserRole(raw)

  if (!isUserRole(role)) {
    throw new ApiClientError({
      code: "UNKNOWN_ROLE",
      message: "Vai trò sau khi xác thực không hợp lệ.",
    })
  }

  return {
    userId: raw.UserId ?? raw.userId ?? 0,
    email: raw.Email ?? raw.email ?? "",
    fullName: raw.FullName ?? raw.fullName ?? "",
    phone: raw.Phone ?? raw.phone ?? null,
    avatarUrl: raw.AvatarUrl ?? raw.avatarUrl ?? null,
    role,
    status: raw.Status ?? raw.status ?? "",
    memberProfileId: raw.MemberProfileId ?? raw.memberProfileId ?? null,
  }
}

export function normalizeLoginSuccess(data: LoginSuccess): LoginSuccess {
  const raw = data as RawLoginSuccess
  const rawUser = raw.User ?? raw.user
  const role = raw.Role ?? raw.role ?? readAuthUserRole(rawUser)

  if (!role) {
    throw new ApiClientError({
      code: "MISSING_ROLE",
      message: "Thiếu vai trò sau khi xác thực.",
    })
  }

  if (!rawUser) {
    throw new ApiClientError({
      code: "UNKNOWN_ROLE",
      message: "Vai trò sau khi xác thực không hợp lệ.",
    })
  }

  if (!isUserRole(role) || !isUserRole(readAuthUserRole(rawUser))) {
    throw new ApiClientError({
      code: "UNKNOWN_ROLE",
      message: "Vai trò sau khi xác thực không hợp lệ.",
    })
  }

  const user = normalizeAuthUser(rawUser)

  return {
    accessToken: raw.AccessToken ?? raw.accessToken ?? "",
    refreshToken: raw.RefreshToken ?? raw.refreshToken ?? "",
    expiresAt: raw.ExpiresAt ?? raw.expiresAt ?? "",
    user: {
      ...user,
      role: role as UserRole,
    },
    role,
    redirectPath: raw.RedirectPath ?? raw.redirectPath,
  }
}
