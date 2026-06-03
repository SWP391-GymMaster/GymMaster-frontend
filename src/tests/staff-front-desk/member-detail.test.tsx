import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { StaffMemberDetailHero } from "@/features/staff-front-desk/components/StaffMemberDetailHero"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithStaffSession } from "@/tests/staff-front-desk/test-utils"

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "101" }),
}))

afterEach(() => {
  resetAuthSessionForTest()
})

describe("StaffMemberDetailHero", () => {
  it("shows member identity, package, payment, and recent check-in context", async () => {
    renderWithStaffSession(<StaffMemberDetailHero />)

    expect(await screen.findByText("Nguyen Minh Anh")).toBeInTheDocument()
    expect(screen.getByText(/GM-101/)).toBeInTheDocument()
    expect(screen.getByText("0900000101")).toBeInTheDocument()
    expect(screen.getByText("member@gymmaster.local")).toBeInTheDocument()
    expect(screen.getAllByText("Premium 30").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Đã thanh toán").length).toBeGreaterThan(0)
    expect(screen.getByText("Check-in hội viên")).toBeInTheDocument()
  })
})
