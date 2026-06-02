import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ManualPaymentPanel } from "@/features/staff-front-desk/components/ManualPaymentPanel"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithStaffSession } from "@/tests/staff-front-desk/test-utils"

const pendingMembership = {
  id: 202,
  memberId: 102,
  packageId: 2,
  packageName: "Strength 90",
  status: "pending",
  paymentStatus: "pending",
  startsAt: "2026-06-01",
  endsAt: "2026-08-29",
  price: 2400000,
  currency: "VND",
} as const

afterEach(() => {
  resetAuthSessionForTest()
})

describe("ManualPaymentPanel", () => {
  it("records pending manual payment and reports paid result", async () => {
    const onRecorded = vi.fn()
    renderWithStaffSession(
      <ManualPaymentPanel
        membership={pendingMembership}
        onRecorded={onRecorded}
      />,
    )

    expect(screen.getByText("Cần ghi nhận thanh toán")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("staff-record-payment-button"))

    await waitFor(() => {
      expect(onRecorded).toHaveBeenCalledWith(
        expect.objectContaining({ status: "paid" }),
      )
    })
  })
})
