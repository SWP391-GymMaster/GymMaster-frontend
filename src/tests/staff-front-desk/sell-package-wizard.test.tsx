import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { SellPackageWizard } from "@/features/staff-front-desk/components/SellPackageWizard"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithStaffSession } from "@/tests/staff-front-desk/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("SellPackageWizard", () => {
  it("starts without a visible demo member lookup", () => {
    renderWithStaffSession(<SellPackageWizard />)

    expect(screen.getByTestId("staff-sell-member-search")).toHaveValue("")
    expect(screen.queryByText("Nguyen Minh Anh")).not.toBeInTheDocument()
  })

  it("does not show the submit button on initial step", () => {
    renderWithStaffSession(<SellPackageWizard />)

    expect(screen.queryByTestId("staff-sell-submit-button")).not.toBeInTheDocument()
  })

  it("creates a pending package sale and records manual payment", async () => {
    renderWithStaffSession(<SellPackageWizard />)

    fireEvent.change(screen.getByTestId("staff-sell-member-search"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }))
    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    fireEvent.click(await screen.findByText("Strength 90"))
    fireEvent.click(screen.getByTestId("staff-sell-submit-button"))

    expect(await screen.findByText(/Đã tạo bán gói Strength 90/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Gói hội viên đang chờ/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Đang chờ").length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("staff-record-payment-button"))

    expect(
      await screen.findByText("Đã ghi nhận thanh toán. Gói hội viên đang hoạt động."),
    ).toBeInTheDocument()
    expect(screen.getByText("Đã thanh toán")).toBeInTheDocument()
  })
})
