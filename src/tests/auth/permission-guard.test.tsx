import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("PermissionGuard", () => {
  it("shows sign-in required state for unauthenticated users", () => {
    render(
      <PermissionGuard allowedRoles={["admin"]}>
        <p>Admin content</p>
      </PermissionGuard>,
    )

    expect(screen.getByText("Vui lòng đăng nhập để tiếp tục.")).toBeInTheDocument()
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument()
  })

  it("renders children for allowed role", async () => {
    useAuthSessionStore.getState().setSession({
      accessToken: "access-admin",
      refreshToken: "refresh-admin",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      role: "admin",
      user: {
        userId: 1,
        email: "admin@gymmaster.local",
        fullName: "Admin",
        role: "admin",
        status: "active",
      },
    })

    render(
      <PermissionGuard allowedRoles={["admin"]}>
        <p>Admin content</p>
      </PermissionGuard>,
    )

    expect(await screen.findByText("Admin content")).toBeInTheDocument()
  })

  it("denies authenticated users with the wrong role", async () => {
    useAuthSessionStore.getState().setSession({
      accessToken: "access-staff",
      refreshToken: "refresh-staff",
      expiresAt: new Date().toISOString(),
      role: "staff",
      user: {
        userId: 2,
        email: "staff@gymmaster.local",
        fullName: "Staff",
        role: "staff",
        status: "active",
      },
    })

    render(
      <PermissionGuard allowedRoles={["admin"]}>
        <p>Admin content</p>
      </PermissionGuard>,
    )

    expect(
      await screen.findByText("Bạn không có quyền truy cập khu vực này."),
    ).toBeInTheDocument()
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument()
  })

  it("refreshes an expired session before rendering protected content", async () => {
    useAuthSessionStore.getState().setSession({
      accessToken: "access-admin",
      refreshToken: "refresh-admin",
      expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
      role: "admin",
      user: {
        userId: 1,
        email: "admin@gymmaster.local",
        fullName: "Admin",
        role: "admin",
        status: "active",
      },
    })

    render(
      <PermissionGuard allowedRoles={["admin"]}>
        <p>Admin content</p>
      </PermissionGuard>,
    )

    expect(await screen.findByText("Admin content")).toBeInTheDocument()
    expect(useAuthSessionStore.getState().session?.refreshToken).not.toBe(
      "refresh-admin",
    )
  })

  it("shows a session-expired state when refresh token is invalid", async () => {
    useAuthSessionStore.getState().setSession({
      accessToken: "access-admin",
      refreshToken: "refresh-admin-stale",
      expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
      role: "admin",
      user: {
        userId: 1,
        email: "admin@gymmaster.local",
        fullName: "Admin",
        role: "admin",
        status: "active",
      },
    })

    render(
      <PermissionGuard allowedRoles={["admin"]}>
        <p>Admin content</p>
      </PermissionGuard>,
    )

    expect(
      await screen.findByText("Phiên đăng nhập đã hết hạn."),
    ).toBeInTheDocument()
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument()
  })
})
