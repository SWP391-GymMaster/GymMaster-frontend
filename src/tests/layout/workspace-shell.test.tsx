import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AppProviders } from "@/app/providers"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import type { UserRole } from "@/types/auth"

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

function renderShell(role: UserRole) {
  render(
    <AppProviders>
      <WorkspaceShell
        description={`${role} workspace`}
        role={role}
        title={`${role} Dashboard`}
      />
    </AppProviders>,
  )
}

function openUserMenu() {
  const trigger = screen.getByRole("button", { name: /Mở menu người dùng/i })
  fireEvent.pointerDown(trigger, {
    button: 0,
    ctrlKey: false,
    pointerType: "mouse",
  })
}

describe("WorkspaceShell", () => {
  it("does not render placeholder metrics when metrics are omitted", () => {
    render(
      <AppProviders>
        <WorkspaceShell
          description="A protected workspace"
          role="staff"
          title="Staff Dashboard"
        >
          <p>Workspace content</p>
        </WorkspaceShell>
      </AppProviders>,
    )

    expect(screen.getByText("Staff Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Workspace content")).toBeInTheDocument()
    expect(screen.getByTestId("command-rail")).toBeInTheDocument()
    expect(screen.queryByText("Protected shell ready")).not.toBeInTheDocument()
    expect(screen.queryByText("Backend role")).not.toBeInTheDocument()
    expect(screen.queryByText("Skeleton only")).not.toBeInTheDocument()
  })

  it("renders route-aware metrics when provided", () => {
    render(
      <AppProviders>
        <WorkspaceShell
          description="A protected workspace"
          metrics={[
            { label: "Today operations", value: "Front desk ready", tone: "dark" },
            { label: "Access", value: "Staff only" },
          ]}
          role="staff"
          title="Staff Dashboard"
        />
      </AppProviders>,
    )

    expect(screen.getByLabelText("Workspace metrics")).toBeInTheDocument()
    expect(screen.getByText("Today operations")).toBeInTheDocument()
    expect(screen.getByText("Front desk ready")).toBeInTheDocument()
    expect(screen.getByText("Access")).toBeInTheDocument()
    expect(screen.getByText("Staff only")).toBeInTheDocument()
    expect(screen.queryByText("Skeleton only")).not.toBeInTheDocument()
  })

  it.each(["admin", "staff", "pt"] as const)(
    "shows the account identity item for %s",
    async (role) => {
      renderShell(role)

      openUserMenu()

      expect(
        await screen.findByRole("menuitem", { name: /Tài khoản của tôi/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("menuitem", { name: /Hồ sơ của tôi/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole("menuitem", { name: /Cấu hình giao diện/i }),
      ).toBeInTheDocument()
    },
  )

  it("shows the profile identity item for members only", async () => {
    renderShell("member")

    openUserMenu()

    expect(
      await screen.findByRole("menuitem", { name: /Hồ sơ của tôi/i }),
    ).toHaveAttribute("href", "/member/profile")
    expect(
      screen.queryByRole("menuitem", { name: /Tài khoản của tôi/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: /Cấu hình giao diện/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("dialog", { name: /Cấu hình giao diện/i }),
    ).not.toBeInTheDocument()
  })
})
