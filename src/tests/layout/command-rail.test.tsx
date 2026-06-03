import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CommandRail } from "@/components/layout/CommandRail"

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/users",
  useRouter: () => ({ push: vi.fn() }),
}))

describe("CommandRail", () => {
  it("renders only Admin navigation for Admin role", () => {
    render(<CommandRail role="admin" />)

    const rail = screen.getByTestId("command-rail")
    expect(within(rail).getByText("GymMaster OS")).toBeInTheDocument()
    expect(within(rail).getByRole("link", { name: /tài khoản/i })).toBeInTheDocument()
    expect(within(rail).getByRole("link", { name: /nhật ký/i })).toBeInTheDocument()
    expect(within(rail).queryByRole("link", { name: /bán gói/i })).not.toBeInTheDocument()
    expect(within(rail).queryByRole("link", { name: /nhật ký ăn/i })).not.toBeInTheDocument()
  })

  it("renders Staff navigation without Admin controls", () => {
    render(<CommandRail role="staff" />)

    const rail = screen.getByTestId("command-rail")
    expect(within(rail).getByRole("link", { name: /tìm hội viên/i })).toBeInTheDocument()
    expect(within(rail).getByRole("link", { name: /check-in/i })).toBeInTheDocument()
    expect(within(rail).queryByRole("link", { name: /tài khoản/i })).not.toBeInTheDocument()
    expect(within(rail).queryByRole("link", { name: /nhật ký/i })).not.toBeInTheDocument()
  })
})
