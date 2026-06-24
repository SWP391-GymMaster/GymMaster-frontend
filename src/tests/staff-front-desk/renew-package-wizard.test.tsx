import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { RenewPackageWizard } from "@/features/staff-front-desk/components/RenewPackageWizard"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithStaffSession } from "@/tests/staff-front-desk/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("RenewPackageWizard", () => {
  it("starts without a visible demo member lookup", () => {
    renderWithStaffSession(<RenewPackageWizard />)

    expect(screen.getByTestId("staff-renew-member-search")).toHaveValue("")
    expect(screen.queryByText("Nguyen Minh Anh")).not.toBeInTheDocument()
  })

  it("shows a form validation message when renewal details are incomplete", async () => {
    renderWithStaffSession(<RenewPackageWizard />)

    fireEvent.click(screen.getByTestId("staff-renew-submit-button"))

    expect(await screen.findByText("Chọn hội viên.")).toBeInTheDocument()
  })

  it("previews renewal period and renews atomically (active + paid in one step)", async () => {
    renderWithStaffSession(<RenewPackageWizard />)

    fireEvent.change(screen.getByTestId("staff-renew-member-search"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }))
    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    expect(await screen.findAllByText(/Premium 30 · hết hạn/i)).not.toHaveLength(0)

    fireEvent.click(await screen.findByText("Strength 90"))
    expect(screen.getByTestId("staff-renew-summary")).toHaveTextContent(
      "2026-07-01 đến 2026-09-29",
    )

    fireEvent.click(screen.getByTestId("staff-renew-submit-button"))

    // Backend gia han la atomic -> hien hoan tat (paid) ngay, khong co buoc ghi nhan rieng.
    expect(await screen.findByText(/Đã gia hạn Strength 90/i)).toBeInTheDocument()
    expect(screen.getAllByText("Đã thanh toán").length).toBeGreaterThan(0)
    expect(
      screen.queryByTestId("staff-record-payment-button"),
    ).not.toBeInTheDocument()
  })
})
