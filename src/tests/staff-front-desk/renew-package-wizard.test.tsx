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

    expect(await screen.findByText("Select a member.")).toBeInTheDocument()
  })

  it("previews renewal period, creates pending renewal, and records payment", async () => {
    renderWithStaffSession(<RenewPackageWizard />)

    fireEvent.change(screen.getByTestId("staff-renew-member-search"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Find" }))
    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    expect(await screen.findAllByText(/Premium 30 · ends/i)).not.toHaveLength(0)

    fireEvent.click(await screen.findByText("Strength 90"))
    expect(screen.getByTestId("staff-renew-summary")).toHaveTextContent(
      "2026-07-01 to 2026-09-29",
    )

    fireEvent.click(screen.getByTestId("staff-renew-submit-button"))

    expect(await screen.findByText(/Renewal created for Strength 90/i)).toBeInTheDocument()
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("staff-record-payment-button"))

    expect(
      await screen.findByText("Manual payment recorded. Membership is active."),
    ).toBeInTheDocument()
    expect(screen.getAllByText("Paid").length).toBeGreaterThan(0)
  })
})
