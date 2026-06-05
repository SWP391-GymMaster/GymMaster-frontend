import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { NotificationsDrawer } from "@/components/feedback/NotificationsDrawer"
import { AppProviders } from "@/app/providers"
import { resetAuthSessionForTest, useAuthSessionStore } from "@/features/auth/session/auth-session"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

function setSessionForTest(role: "admin" | "staff" | "pt" | "member") {
  useAuthSessionStore.getState().setSession({
    accessToken: `access-${role}`,
    refreshToken: `refresh-${role}`,
    expiresAt: "2026-06-02T12:00:00.000Z",
    role,
    user: {
      userId: 1,
      email: `${role}@gymmaster.local`,
      fullName: `Gym ${role.toUpperCase()}`,
      role,
      status: "active",
    },
  })
}

function renderWithRole(role: "admin" | "staff" | "pt" | "member", onClose: () => void) {
  resetAuthSessionForTest()
  setSessionForTest(role)
  return render(
    <AppProviders>
      <NotificationsDrawer open={true} onClose={onClose} />
    </AppProviders>
  )
}

afterEach(() => {
  resetAuthSessionForTest()
  vi.clearAllMocks()
})

describe("NotificationsDrawer role-based flow", () => {
  it("renders staff notifications for staff role", async () => {
    const onClose = vi.fn()
    renderWithRole("staff", onClose)

    // Should load the staff check-in notification
    expect(await screen.findByText("Hội viên Check-in thành công")).toBeInTheDocument()
    expect(screen.getByText(/Lâm Minh Anh vừa check-in tại quầy chính/i)).toBeInTheDocument()
    expect(screen.queryByText("Cảnh báo bảo mật")).not.toBeInTheDocument()
  })

  it("renders admin notifications for admin role", async () => {
    const onClose = vi.fn()
    renderWithRole("admin", onClose)

    // Should load the admin security alert notification
    expect(await screen.findByText("Cảnh báo bảo mật")).toBeInTheDocument()
    expect(screen.getByText(/Phát hiện đăng nhập bất thường/i)).toBeInTheDocument()
    expect(screen.queryByText("Lâm Minh Anh vừa check-in tại quầy chính")).not.toBeInTheDocument()
  })

  it("filters notifications by read status", async () => {
    const onClose = vi.fn()
    renderWithRole("member", onClose)

    // Member has "Giáo án tập luyện mới" (unread) and "Nhận ghi chú từ HLV" (read)
    expect(await screen.findByText("Giáo án tập luyện mới")).toBeInTheDocument()
    expect(screen.getByText("Nhận ghi chú từ HLV")).toBeInTheDocument()

    // Click on "Chưa đọc" filter tab
    const unreadTab = screen.getByRole("button", { name: /Chưa đọc/i })
    fireEvent.click(unreadTab)

    // Should hide the read notification "Nhận ghi chú từ HLV"
    await waitFor(() => {
      expect(screen.queryByText("Nhận ghi chú từ HLV")).not.toBeInTheDocument()
      expect(screen.getByText("Giáo án tập luyện mới")).toBeInTheDocument()
    })
  })

  it("marks notification as read on click", async () => {
    const onClose = vi.fn()
    renderWithRole("pt", onClose)

    // PT has "Nhận hội viên mới" (unread)
    const notifTitle = await screen.findByText("Nhận hội viên mới")
    const parentItem = notifTitle.closest("div[class*='cursor-pointer']")!
    
    // It should have unread dot initially
    expect(parentItem.querySelector(".bg-primary")).toBeInTheDocument()

    // Click the notification
    fireEvent.click(parentItem)

    // Dot should disappear after query refetch/invalidation
    await waitFor(() => {
      expect(parentItem.querySelector(".bg-primary")).not.toBeInTheDocument()
    })
  })

  it("marks all notifications as read", async () => {
    const onClose = vi.fn()
    renderWithRole("staff", onClose)

    expect(await screen.findByText("Hội viên Check-in thành công")).toBeInTheDocument()

    // Click "Đọc tất cả" button
    const markAllBtn = screen.getByRole("button", { name: /Đọc tất cả/i })
    fireEvent.click(markAllBtn)

    // The unread badges and "Đọc tất cả" button should be hidden after marking all as read
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Đọc tất cả/i })).not.toBeInTheDocument()
    })
  })

  it("deletes a notification", async () => {
    const onClose = vi.fn()
    renderWithRole("admin", onClose)

    await screen.findByText("Cảnh báo bảo mật")

    // Find delete button inside notification row
    const deleteBtn = screen.getAllByTitle("Xóa thông báo")[0]
    fireEvent.click(deleteBtn)

    // Notification should disappear from the DOM
    await waitFor(() => {
      expect(screen.queryByText("Cảnh báo bảo mật")).not.toBeInTheDocument()
    })
  })
})
