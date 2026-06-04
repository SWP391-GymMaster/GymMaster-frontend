import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithAdminSession } from "@/tests/admin-dashboard/test-utils"

// Mock next/navigation for LogoutButton useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/admin/dashboard",
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => {
  resetAuthSessionForTest()
})

describe("AdminPageFrame", () => {
  it("renders the admin workspace shell with title and description", async () => {
    renderWithAdminSession(
      <AdminPageFrame description="Admin test" title="Admin Dashboard">
        <p>Admin content</p>
      </AdminPageFrame>,
    )

    expect(await screen.findByText("Admin Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Admin test")).toBeInTheDocument()
    expect(screen.getByText("Admin content")).toBeInTheDocument()
  })

  it("renders the RoleBadge with admin role", async () => {
    renderWithAdminSession(
      <AdminPageFrame description="Test" title="Test">
        <p>Content</p>
      </AdminPageFrame>,
    )

    expect((await screen.findAllByText("Quản trị viên")).length).toBeGreaterThan(0)
  })

  it("renders without children", async () => {
    renderWithAdminSession(<AdminPageFrame description="No children" title="Solo" />)

    expect(await screen.findByText("Solo")).toBeInTheDocument()
    expect(screen.getByText("No children")).toBeInTheDocument()
  })
})
