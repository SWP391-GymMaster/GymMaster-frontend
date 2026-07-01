import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { RenewPackageWizard } from "@/features/staff-front-desk/components/RenewPackageWizard"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithStaffSession } from "@/tests/staff-front-desk/test-utils"
import { vnTodayIso } from "@/lib/date/vn-time"

// Goi mock cua hoi vien da het han (endDate qua khu co dinh) -> gia han noi tiep tu HOM NAY.
// Tinh dong theo gio VN de test khong phu thuoc ngay chay (tranh "bom hen gio" theo ngay).
function renewalWindow(durationDays: number) {
  const start = vnTodayIso()
  const end = new Date(`${start}T00:00:00Z`)
  end.setUTCDate(end.getUTCDate() + durationDays)
  return `${start} đến ${end.toISOString().slice(0, 10)}`
}

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

  it("previews renewal period and renews instantly", async () => {
    renderWithStaffSession(<RenewPackageWizard />)

    fireEvent.change(screen.getByTestId("staff-renew-member-search"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }))
    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    expect(await screen.findAllByText(/Premium 30 · hết hạn/i)).not.toHaveLength(0)

    fireEvent.click(await screen.findByText("Strength 90"))
    expect(screen.getByTestId("staff-renew-summary")).toHaveTextContent(
      renewalWindow(90),
    )

    fireEvent.click(screen.getByTestId("staff-renew-submit-button"))

    expect(
      await screen.findByText(/Đã gia hạn Strength 90/i),
    ).toBeInTheDocument()
    expect(screen.getAllByText("Đã gia hạn").length).toBeGreaterThan(0)
    expect(
      screen.queryByTestId("staff-record-payment-button"),
    ).not.toBeInTheDocument()
  })
})
