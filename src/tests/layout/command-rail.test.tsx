import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CommandRail } from "@/components/layout/CommandRail"

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/users",
  useRouter: () => ({ push: vi.fn() }),
}))

describe("CommandRail", () => {
  it("renders only Admin navigation for Admin role", () => {
    render(<CommandRail role="admin" />)

    expect(screen.getByText("GymMaster OS")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /users/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /audit logs/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /sell package/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /meal journal/i })).not.toBeInTheDocument()
  })

  it("renders Staff navigation without Admin controls", () => {
    render(<CommandRail role="staff" />)

    expect(screen.getByRole("link", { name: /members/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /check-in/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /users/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /audit logs/i })).not.toBeInTheDocument()
  })
})
