import { http, HttpResponse } from "msw"

import { members, userAccounts } from "@/mocks/data/gymmaster.mock-data"
import type { ApiResponse, AuthUser, LoginSuccess, UserRole } from "@/types/auth"
import {
  created,
  fail,
  getRoleFromRequest,
  noContent,
  ok,
} from "@/mocks/utils/api-response"

const baseDemoUsers: Record<UserRole, AuthUser> = {
  admin: {
    userId: 1,
    email: "admin@gymmaster.local",
    fullName: "GymMaster Admin",
    phone: "0900000001",
    avatarUrl: null,
    role: "admin",
    status: "active",
  },
  staff: {
    userId: 2,
    email: "staff@gymmaster.local",
    fullName: "Front Desk Staff",
    phone: "0900000002",
    avatarUrl: null,
    role: "staff",
    status: "active",
  },
  pt: {
    userId: 3,
    email: "pt@gymmaster.local",
    fullName: "Coach PT",
    phone: "0900000003",
    avatarUrl: null,
    role: "pt",
    status: "active",
  },
  member: {
    userId: 4,
    email: "member@gymmaster.local",
    fullName: "Gym Member",
    phone: "0900000101",
    avatarUrl: null,
    role: "member",
    status: "active",
    memberProfileId: 101,
  },
}

let demoUsers: Record<UserRole, AuthUser> = cloneDemoUsers()

const userRoles = ["admin", "staff", "pt", "member"] as const

const demoPasswords: Record<UserRole, string[]> = {
  admin: ["Password123!", "Admin123!"],
  staff: ["Password123!", "Staff123!"],
  pt: ["Password123!", "Pt123!"],
  member: ["Password123!", "Member123!"],
}

let refreshTokenSequence = 1
let validRefreshTokens = new Map<string, UserRole>()

export function resetAuthMockState() {
  refreshTokenSequence = 1
  demoUsers = cloneDemoUsers()
  validRefreshTokens = new Map(
    userRoles.map((role) => [`refresh-${role}`, role]),
  )
}

resetAuthMockState()

function nextRefreshToken(role: UserRole) {
  const token = `refresh-${role}-${refreshTokenSequence}`

  refreshTokenSequence += 1
  validRefreshTokens.set(token, role)

  return token
}

function revokeRoleRefreshTokens(role: UserRole) {
  for (const [token, tokenRole] of validRefreshTokens.entries()) {
    if (tokenRole === role) {
      validRefreshTokens.delete(token)
    }
  }
}

function cloneDemoUsers() {
  return Object.fromEntries(
    Object.entries(baseDemoUsers).map(([role, user]) => [role, { ...user }]),
  ) as Record<UserRole, AuthUser>
}

function toPascalAuthUser(user: AuthUser) {
  return {
    UserId: user.userId,
    Email: user.email,
    FullName: user.fullName,
    Phone: user.phone ?? null,
    AvatarUrl: user.avatarUrl ?? null,
    Role: user.role,
    Status: user.status,
    MemberProfileId: user.memberProfileId ?? null,
  }
}

function syncMockAccount(user: AuthUser) {
  const accountIndex = userAccounts.findIndex(
    (account) => account.userId === user.userId,
  )

  if (accountIndex >= 0) {
    userAccounts[accountIndex] = {
      ...userAccounts[accountIndex],
      fullName: user.fullName,
      phone: user.phone ?? userAccounts[accountIndex].phone,
      avatarUrl: user.avatarUrl ?? userAccounts[accountIndex].avatarUrl ?? null,
    }
  }

  if (user.role !== "member") {
    return
  }

  const memberIndex = members.findIndex(
    (member) => member.email === user.email && !member.isDeleted,
  )

  if (memberIndex >= 0) {
    members[memberIndex] = {
      ...members[memberIndex],
      fullName: user.fullName,
      phone: user.phone ?? members[memberIndex].phone,
      avatarUrl: user.avatarUrl ?? members[memberIndex].avatarUrl ?? null,
    }
  }
}

function hasDuplicatePhone(role: UserRole, phone?: string | null) {
  if (!phone) {
    return false
  }

  return Object.entries(demoUsers).some(
    ([itemRole, user]) => itemRole !== role && user.phone === phone,
  )
}

function loginSuccess(
  role: UserRole,
  refreshToken = `refresh-${role}`,
): ApiResponse<LoginSuccess> {
  validRefreshTokens.set(refreshToken, role)

  return {
    success: true,
    error: null,
    meta: null,
    data: {
      accessToken: `access-${role}`,
      refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      user: demoUsers[role],
      role,
      redirectPath: `/${role}`,
    },
  }
}

export const authHandlers = [
  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email ?? ""

    if (email === "locked@gymmaster.local") {
      return fail("ACCOUNT_LOCKED", "Account is locked", 423)
    }

    if (email === "too-many@gymmaster.local") {
      return fail("TOO_MANY_ATTEMPTS", "Too many login attempts", 429)
    }

    if (email === "missing-role@gymmaster.local") {
      const payload = loginSuccess("member")

      return HttpResponse.json({
        ...payload,
        data: payload.data
          ? {
              ...payload.data,
              role: undefined,
              user: {
                ...payload.data.user,
                role: undefined,
              },
            }
          : null,
      })
    }

    const role = userRoles.find((item) =>
      email.startsWith(`${item}@`),
    )

    if (!role || !demoPasswords[role].includes(body.password ?? "")) {
      return fail("INVALID_CREDENTIALS", "Invalid credentials", 401)
    }

    return HttpResponse.json(loginSuccess(role))
  }),
  http.get("/api/v1/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader?.startsWith("Bearer access-")) {
      return fail("UNAUTHORIZED", "Unauthorized", 401)
    }

    const role = authHeader.replace("Bearer access-", "") as UserRole
    const user = demoUsers[role]

    if (!user) {
      return fail("UNAUTHORIZED", "Unauthorized", 401)
    }

    return ok(toPascalAuthUser(user))
  }),
  http.put("/api/v1/users/me", async ({ request }) => {
    const role = getRoleFromRequest(request)

    if (!role) {
      return fail("UNAUTHORIZED", "Unauthorized", 401)
    }

    const currentUser = demoUsers[role]
    const body = (await request.json()) as {
      FullName?: string | null
      fullName?: string | null
      Phone?: string | null
      phone?: string | null
    }
    const nextPhone = body.Phone ?? body.phone ?? currentUser.phone ?? null

    if (hasDuplicatePhone(role, nextPhone)) {
      return fail(
        "DUPLICATE",
        "So dien thoai nay da duoc su dung.",
        409,
      )
    }

    demoUsers[role] = {
      ...currentUser,
      fullName: body.FullName ?? body.fullName ?? currentUser.fullName,
      phone: nextPhone,
    }
    syncMockAccount(demoUsers[role])

    return ok(toPascalAuthUser(demoUsers[role]))
  }),
  http.post("/api/v1/users/me/avatar", async ({ request }) => {
    const role = getRoleFromRequest(request)

    if (!role) {
      return fail("UNAUTHORIZED", "Unauthorized", 401)
    }

    const contentType = request.headers.get("Content-Type") ?? ""
    let file: { type: string; size: number } | null = null

    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData()
      const formFile = formData.get("file")

      if (formFile && typeof formFile !== "string") {
        file = formFile
      }
    } else {
      // Vitest/jsdom co the gui FormData vao MSW ma khong gan Content-Type.
      file = { type: "image/webp", size: 1 }
    }

    if (!file) {
      return fail("VALIDATION_ERROR", "Vui long chon anh dai dien.", 422)
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return fail("VALIDATION_ERROR", "Chi ho tro anh JPG, PNG hoac WebP.", 422)
    }

    if (file.size > 5 * 1024 * 1024) {
      return fail("VALIDATION_ERROR", "Anh dai dien toi da 5 MB.", 422)
    }

    demoUsers[role] = {
      ...demoUsers[role],
      avatarUrl: `https://cdn.gymmaster.local/avatars/user_${demoUsers[role].userId}.webp`,
    }
    syncMockAccount(demoUsers[role])

    return ok(toPascalAuthUser(demoUsers[role]))
  }),
  http.post("/api/v1/auth/refresh", async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string }
    const refreshToken = body.refreshToken ?? ""
    const role = validRefreshTokens.get(refreshToken)

    if (!role) {
      return fail("INVALID_REFRESH_TOKEN", "Invalid refresh token", 401)
    }

    validRefreshTokens.delete(refreshToken)

    return HttpResponse.json(loginSuccess(role, nextRefreshToken(role)))
  }),
  http.post("/api/v1/auth/register", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      fullName?: string
      phone?: string
    }

    if (
      body.email === "member@gymmaster.local" ||
      body.email === "existing@gymmaster.local"
    ) {
      return fail("EMAIL_EXISTS", "Email already exists", 409)
    }

    if (body.phone === "0900000000") {
      return fail("PHONE_EXISTS", "Phone already exists", 409)
    }

    return created({
      accessToken: "access-member",
      refreshToken: "refresh-member",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      user: {
        ...demoUsers.member,
        email: body.email ?? demoUsers.member.email,
        fullName: body.fullName ?? demoUsers.member.fullName,
        phone: body.phone ?? demoUsers.member.phone,
        avatarUrl: null,
      },
      role: "member",
      redirectPath: "/member",
    })
  }),
  http.post("/api/v1/auth/forgot-password", async ({ request }) => {
    await request.json()

    return ok({
      message: "Neu email ton tai, he thong se tao yeu cau dat lai mat khau.",
      resetToken: "123456",
    })
  }),
  http.post("/api/v1/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as { resetToken?: string }

    if (body.resetToken !== "123456") {
      return fail("INVALID_RESET_TOKEN", "Invalid reset token", 401)
    }

    return ok({
      message: "Dat lai mat khau thanh cong.",
    })
  }),
  http.post("/api/v1/auth/change-password", async ({ request }) => {
    const role = getRoleFromRequest(request)

    if (!role) {
      return fail("UNAUTHORIZED", "Unauthorized", 401)
    }

    const body = (await request.json()) as { currentPassword?: string }

    if (body.currentPassword !== "Password123!") {
      return fail("INVALID_CURRENT_PASSWORD", "Invalid current password", 401)
    }

    return ok({
      message: "Doi mat khau thanh cong.",
    })
  }),
  http.post("/api/v1/auth/google", async ({ request }) => {
    const body = (await request.json()) as { idToken?: string }

    if (body.idToken === "google-not-configured") {
      return fail("GOOGLE_NOT_CONFIGURED", "Google login is not configured", 500)
    }

    if (body.idToken === "invalid-google-token") {
      return fail("INVALID_GOOGLE_TOKEN", "Invalid Google token", 400)
    }

    return HttpResponse.json(loginSuccess("member"))
  }),
  http.post("/api/v1/auth/logout", ({ request }) => {
    const role = getRoleFromRequest(request)

    if (role) {
      revokeRoleRefreshTokens(role)
    }

    return noContent()
  }),
]
