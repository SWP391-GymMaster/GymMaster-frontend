import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { http } from "msw"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AppProviders } from "@/app/providers"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { AccountDialog } from "@/features/account/components/AccountDialog"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"
import { server } from "@/mocks/server"
import { fail } from "@/mocks/utils/api-response"
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

class LoadedImage {
  onload: (() => void) | null = null
  private listeners = new Set<() => void>()

  addEventListener(event: string, listener: () => void) {
    if (event === "load") {
      this.listeners.add(listener)
    }
  }

  removeEventListener(event: string, listener: () => void) {
    if (event === "load") {
      this.listeners.delete(listener)
    }
  }

  set src(_value: string) {
    setTimeout(() => {
      this.onload?.()
      this.listeners.forEach((listener) => listener())
    }, 0)
  }
}

const sessions: Record<UserRole, AuthSession> = {
  admin: makeSession("admin", 1, "GymMaster Admin", "admin@gymmaster.local"),
  staff: makeSession("staff", 2, "Front Desk Staff", "staff@gymmaster.local"),
  pt: makeSession("pt", 3, "Coach PT", "pt@gymmaster.local"),
  member: {
    ...makeSession("member", 4, "Gym Member", "member@gymmaster.local"),
    user: {
      ...makeSession("member", 4, "Gym Member", "member@gymmaster.local").user,
      phone: "0900000101",
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
    expiresAt: "2026-07-02T12:00:00.000Z",
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
  useAuthSessionStore.getState().setSession(sessions[role])
}

function renderShell(role: UserRole) {
  resetAuthSessionForTest()
  setSession(role)

  return render(
    <AppProviders>
      <WorkspaceShell description="Workspace" role={role} title="Dashboard" />
    </AppProviders>,
  )
}

function renderAccountDialog(role: UserRole = "member") {
  resetAuthSessionForTest()
  setSession(role)

  return render(
    <AppProviders>
      <AccountDialog open onOpenChange={vi.fn()} />
    </AppProviders>,
  )
}

async function openAccountDialogFromMenu() {
  const trigger = screen.getByRole("button", { name: /Mở menu người dùng/i })
  fireEvent.pointerDown(trigger, {
    button: 0,
    ctrlKey: false,
    pointerType: "mouse",
  })

  fireEvent.click(
    await screen.findByRole("menuitem", { name: /Tài khoản của tôi/i }),
  )
}

describe("AccountDialog", () => {
  beforeEach(() => {
    vi.stubGlobal("Image", LoadedImage)
  })

  afterEach(() => {
    resetAuthSessionForTest()
  })

  it.each(["admin", "staff", "pt"] as const)(
    "opens from the workspace user menu for %s",
    async (role) => {
      renderShell(role)

      await openAccountDialogFromMenu()

      expect(
        await screen.findByRole("dialog", { name: /Tài khoản của tôi/i }),
      ).toBeInTheDocument()
    },
  )

  it("maps DUPLICATE phone conflicts to the phone field", async () => {
    server.use(
      http.put("/api/v1/users/me", () =>
        fail("DUPLICATE", "So dien thoai nay da duoc su dung.", 409),
      ),
    )

    renderAccountDialog()

    fireEvent.change(screen.getByTestId("account-phone"), {
      target: { value: "0900000002" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Lưu tài khoản/i }))

    expect(
      await screen.findByText("Số điện thoại này đã được sử dụng."),
    ).toBeInTheDocument()
  })

  it("shows client-side avatar file errors before upload", async () => {
    renderAccountDialog()

    const fileInput = screen.getByTestId("account-avatar-input")
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["not-image"], "avatar.txt", { type: "text/plain" })],
      },
    })

    expect(
      await screen.findByText("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP."),
    ).toBeInTheDocument()

    fireEvent.change(fileInput, {
      target: {
        files: [
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], "avatar.png", {
            type: "image/png",
          }),
        ],
      },
    })

    expect(await screen.findByText("Ảnh đại diện tối đa 5 MB.")).toBeInTheDocument()
  })

  it("updates the workspace header avatar after upload succeeds", async () => {
    renderShell("staff")
    await openAccountDialogFromMenu()

    fireEvent.change(screen.getByTestId("account-avatar-input"), {
      target: {
        files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
      },
    })

    await waitFor(() => {
      expect(
        within(screen.getByTestId("workspace-user-avatar")).getByRole("img", {
          hidden: true,
        }),
      ).toHaveAttribute(
        "src",
        "https://cdn.gymmaster.local/avatars/user_2.webp",
      )
    })
  })
})
