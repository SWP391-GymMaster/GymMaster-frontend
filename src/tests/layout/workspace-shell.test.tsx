import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AppProviders } from "@/app/providers"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"

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

  it("opens a user menu from the desktop identity trigger", async () => {
    render(
      <AppProviders>
        <WorkspaceShell
          description="Member workspace"
          role="member"
          title="Member Dashboard"
        />
      </AppProviders>,
    )

    const trigger = screen.getByRole("button", { name: /Mở menu người dùng/i })
    fireEvent.pointerDown(trigger, {
      button: 0,
      ctrlKey: false,
      pointerType: "mouse",
    })

    expect(
      await screen.findByRole("menuitem", { name: /hồ sơ của tôi/i }),
    ).toHaveAttribute("href", "/member/profile")
    expect(
      screen.getByRole("menuitem", { name: /Tài khoản của tôi/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: /cấu hình giao diện/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: /cấu hình giao diện/i })).not.toBeInTheDocument()
  })
})
