import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { PtDashboardContent } from "@/features/pt-dashboard/components/PtDashboardContent"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"

// Mock next/navigation for Link
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/pt/dashboard",
}))

// Mock the query hook
import { usePtAssignedMembers } from "@/features/pt-dashboard/api/pt-dashboard.queries"
vi.mock("@/features/pt-dashboard/api/pt-dashboard.queries")

afterEach(() => {
  resetAuthSessionForTest()
})

describe("PtDashboardContent", () => {
  it("renders loading state", () => {
    vi.mocked(usePtAssignedMembers).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as never)

    const { container } = render(<PtDashboardContent />)
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0)
  })

  it("renders error state with retry", () => {
    vi.mocked(usePtAssignedMembers).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
      refetch: vi.fn(),
    } as never)

    render(<PtDashboardContent />)
    expect(screen.getByText("Failed to load")).toBeInTheDocument()
    expect(screen.getByText("Thử lại")).toBeInTheDocument()
  })

  it("renders empty state when no assigned members", () => {
    vi.mocked(usePtAssignedMembers).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never)

    render(<PtDashboardContent />)
    expect(
      screen.getByText("Chưa có hội viên được phân công"),
    ).toBeInTheDocument()
  })

  it("renders member list with stats", () => {
    vi.mocked(usePtAssignedMembers).mockReturnValue({
      data: [
        { id: 101, memberCode: "GM-101", fullName: "Nguyen Van A", email: "a@test.com", phone: "0901", status: "active" },
        { id: 102, memberCode: "GM-102", fullName: "Tran Van B", email: "b@test.com", phone: "0902", status: "pending" },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never)

    render(<PtDashboardContent />)

    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument()
    expect(screen.getByText("Tran Van B")).toBeInTheDocument()
  })
})
