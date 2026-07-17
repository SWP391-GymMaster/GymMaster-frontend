import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { http } from "msw"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import AdminProfilePage from "@/app/(admin)/admin/profile/page"
import PtProfilePage from "@/app/(pt)/pt/profile/page"
import StaffProfilePage from "@/app/(staff)/staff/profile/page"
import { AppProviders } from "@/app/providers"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"
import { server } from "@/mocks/server"
import { fail, ok } from "@/mocks/utils/api-response"
import { PWA_INSTALL_DISMISSAL_KEY } from "@/lib/pwa/constants"
import type { AuthSession, UserRole } from "@/types/auth"

vi.mock("next/navigation", () => ({
  usePathname: () => "/staff/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/features/notifications/api/notifications.queries", () => ({
  useNotifications: () => ({
    data: [],
    isLoading: false,
  }),
  useMarkNotificationRead: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  }),
  useMarkAllNotificationsRead: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  }),
  useDeleteNotification: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  }),
}))

const sessions: Record<UserRole, AuthSession> = {
  admin: makeSession("admin", 1, "GymMaster Admin", "admin@gymmaster.local"),
  staff: makeSession("staff", 2, "Front Desk Staff", "staff@gymmaster.local"),
  pt: makeSession("pt", 3, "Coach PT", "pt@gymmaster.local"),
  member: {
    ...makeSession("member", 4, "Gym Member", "member@gymmaster.local"),
    user: {
      ...makeSession("member", 4, "Gym Member", "member@gymmaster.local").user,
      memberProfileId: 101,
    },
  },
}

function makeSession(
  role: UserRole,
  userId: number,
  fullName: string,
  email: string,
): AuthSession {
  return {
    accessToken: `access-${role}`,
    refreshToken: `refresh-${role}`,
    expiresAt: "2026-12-31T23:59:59.000Z",
    role,
    user: {
      userId,
      email,
      fullName,
      phone:
        role === "admin"
          ? "0900000001"
          : role === "staff"
            ? "0900000002"
            : role === "pt"
              ? "0900000003"
              : "0900000101",
      avatarUrl: null,
      role,
      status: "active",
    },
  }
}

function setSession(role: UserRole) {
  resetAuthSessionForTest()
  useAuthSessionStore.getState().setSession(sessions[role])
}

function renderWithProviders(ui: ReactNode) {
  return render(<AppProviders>{ui}</AppProviders>)
}

function openUserMenu() {
  const trigger = screen.getByTestId("workspace-user-menu-trigger")
  fireEvent.pointerDown(trigger, {
    button: 0,
    ctrlKey: false,
    pointerType: "mouse",
  })
}

afterEach(() => {
  resetAuthSessionForTest()
})

describe("account profile pages", () => {
  it("surfaces the shared PWA install action on an eligible staff profile", async () => {
    window.localStorage.removeItem(PWA_INSTALL_DISMISSAL_KEY)
    setSession("staff")
    renderWithProviders(<StaffProfilePage />)
    await screen.findByText("Thông tin cá nhân")

    act(() => {
      window.dispatchEvent(new Event("beforeinstallprompt", { cancelable: true }))
    })

    expect(await screen.findByText("Cài ứng dụng để mở nhanh hơn")).toBeInTheDocument()
  })

  it("renders the staff profile page with the personal profile card", async () => {
    setSession("staff")
    renderWithProviders(<StaffProfilePage />)

    expect(await screen.findByText("Thông tin cá nhân")).toBeInTheDocument()
    expect(screen.getByText("Thông tin tài khoản")).toBeInTheDocument()
    expect(screen.queryByText("Hồ sơ chuyên môn")).not.toBeInTheDocument()
  })

  it("renders the PT profile page with personal and read-only professional cards", async () => {
    setSession("pt")
    renderWithProviders(<PtProfilePage />)

    expect(await screen.findByText("Thông tin cá nhân")).toBeInTheDocument()
    expect(screen.getByText("Hồ sơ chuyên môn")).toBeInTheDocument()
    expect(await screen.findByText("Strength and conditioning")).toBeInTheDocument()
    expect(screen.getByText(/Chuyên môn do quản trị viên quản lý/)).toBeInTheDocument()
  })

  it("shows the PT empty state when there is no trainer profile", async () => {
    server.use(
      http.get("/api/v1/users/me/profile", () =>
        fail("NOT_FOUND", "Trainer profile not found", 404),
      ),
      http.get("/api/v1/trainers/me", () =>
        fail("NOT_FOUND", "Trainer profile not found", 404),
      ),
    )
    setSession("pt")
    renderWithProviders(<PtProfilePage />)

    expect((await screen.findAllByText("Chưa có hồ sơ huấn luyện viên")).length).toBeGreaterThanOrEqual(1)
  })

  it("saves personal profile fields through the profile endpoint", async () => {
    let submittedBody: unknown = null
    let personalProfile = {
      DateOfBirth: "1995-09-09",
      Gender: "female",
      Address: "45 Le Loi, Quan 3",
      EmergencyContact: "Anh Hai - 0911000222",
    }
    server.use(
      http.get("/api/v1/users/me/profile", () => ok(personalProfile)),
      http.put("/api/v1/users/me/profile", async ({ request }) => {
        submittedBody = await request.json()
        personalProfile = submittedBody as typeof personalProfile

        return ok(personalProfile)
      }),
    )
    setSession("staff")
    renderWithProviders(<StaffProfilePage />)

    const addressInput = await screen.findByTestId("account-profile-address")
    await waitFor(() => {
      expect(addressInput).toHaveValue("45 Le Loi, Quan 3")
    })

    fireEvent.change(addressInput, {
      target: { value: "99 Pasteur, Quan 1" },
    })
    fireEvent.change(screen.getByTestId("account-profile-emergency-contact"), {
      target: { value: "Ba - 0905555666" },
    })
    await waitFor(() => {
      expect(addressInput).toHaveValue("99 Pasteur, Quan 1")
    })

    const submitButton = screen.getByTestId("account-personal-submit")
    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })
    fireEvent.submit(submitButton.closest("form") as HTMLFormElement)

    await waitFor(() => {
      expect(submittedBody).toEqual({
        DateOfBirth: "1995-09-09",
        Gender: "female",
        Address: "99 Pasteur, Quan 1",
        EmergencyContact: "Ba - 0905555666",
      })
    })
    await waitFor(() => {
      expect(screen.getByTestId("account-profile-address")).toHaveValue("99 Pasteur, Quan 1")
    })
  })

  it.each([
    ["admin", "/admin/profile"],
    ["staff", "/staff/profile"],
    ["pt", "/pt/profile"],
    ["member", "/member/profile/edit"],
  ] as const)("navigates the user menu account item for %s", async (role, href) => {
    setSession(role)
    renderWithProviders(
      <WorkspaceShell description="Workspace" role={role} title="Dashboard" />,
    )

    openUserMenu()

    expect(await screen.findByTestId("my-account-link")).toHaveAttribute("href", href)
    expect(screen.queryByRole("dialog", { name: /Tài khoản của tôi/i })).not.toBeInTheDocument()
  })

  it("denies cross-role access to the staff profile page", async () => {
    setSession("admin")
    renderWithProviders(<StaffProfilePage />)

    expect(await screen.findByRole("link")).toHaveAttribute("href", "/admin/dashboard")
  })

  it("renders the admin profile page for admin role", async () => {
    setSession("admin")
    renderWithProviders(<AdminProfilePage />)

    expect(await screen.findByText("Thông tin cá nhân")).toBeInTheDocument()
    expect(screen.getAllByText("GymMaster Admin").length).toBeGreaterThan(0)
  })
})
