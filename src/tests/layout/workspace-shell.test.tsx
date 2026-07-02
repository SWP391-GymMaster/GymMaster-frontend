import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { useSidebarStore } from "@/stores/useSideBarStore"
import type { UserRole } from "@/types/auth"

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => "/staff/dashboard",
  useRouter: () => navigation,
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
  beforeEach(() => {
    navigation.push.mockClear()
    useSidebarStore.setState({ isSettingsOpen: false })
  })

  it("does not render placeholder metrics when metrics are omitted", () => {
    render(
      <WorkspaceShell
        description="A protected workspace"
        role="staff"
        title="Staff Dashboard"
      >
        <p>Workspace content</p>
      </WorkspaceShell>,
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
      <WorkspaceShell
        description="A protected workspace"
        metrics={[
          { label: "Today operations", value: "Front desk ready", tone: "dark" },
          { label: "Access", value: "Staff only" },
        ]}
        role="staff"
        title="Staff Dashboard"
      />,
    )

    expect(screen.getByLabelText("Workspace metrics")).toBeInTheDocument()
    expect(screen.getByText("Today operations")).toBeInTheDocument()
    expect(screen.getByText("Front desk ready")).toBeInTheDocument()
    expect(screen.getByText("Access")).toBeInTheDocument()
    expect(screen.getByText("Staff only")).toBeInTheDocument()
    expect(screen.queryByText("Skeleton only")).not.toBeInTheDocument()
  })

  it("shows profile menu item only for member role", async () => {
    const memberView = render(
      <WorkspaceShell
        description="Member workspace"
        role="member"
        title="Member Dashboard"
      />,
    )

    fireEvent.pointerDown(screen.getByLabelText("Mở menu tài khoản"))

    expect(await screen.findByText("Hồ sơ của tôi")).toBeInTheDocument()
    expect(screen.getByText("Cấu hình giao diện")).toBeInTheDocument()
    memberView.unmount()

    render(
      <WorkspaceShell
        description="Staff workspace"
        role="staff"
        title="Staff Dashboard"
      />,
    )

    fireEvent.pointerDown(screen.getByLabelText("Mở menu tài khoản"))

    expect(await screen.findByText("Cấu hình giao diện")).toBeInTheDocument()
    expect(screen.queryByText("Hồ sơ của tôi")).not.toBeInTheDocument()
  })

  it("opens settings dialog from the user menu for every role", async () => {
    const roles: UserRole[] = ["admin", "staff", "pt", "member"]

    for (const role of roles) {
      const view = render(
        <WorkspaceShell
          description={`${role} workspace`}
          role={role}
          title={`${role} Dashboard`}
        />,
      )

      fireEvent.pointerDown(screen.getByLabelText("Mở menu tài khoản"))
      fireEvent.click(await screen.findByText("Cấu hình giao diện"))

      expect(await screen.findByText("Chế độ màn hình")).toBeInTheDocument()

      view.unmount()
      useSidebarStore.setState({ isSettingsOpen: false })
    }
  })
})
