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

  it("shows a form validation message when sale details are incomplete", async () => {
    renderWithStaffSession(<SellPackageWizard />)

    fireEvent.click(screen.getByTestId("staff-sell-submit-button"))

    expect(await screen.findByText("Select a member.")).toBeInTheDocument()
  })

  it("creates a pending package sale and records manual payment", async () => {
    renderWithStaffSession(<SellPackageWizard />)

    fireEvent.change(screen.getByTestId("staff-sell-member-search"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Find" }))
    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    fireEvent.click(await screen.findByText("Strength 90"))
    fireEvent.click(screen.getByTestId("staff-sell-submit-button"))

    expect(await screen.findByText(/Sale created for Strength 90/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Membership is pending/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("staff-record-payment-button"))

    expect(
      await screen.findByText("Manual payment recorded. Membership is active."),
    ).toBeInTheDocument()
    expect(screen.getByText("Paid")).toBeInTheDocument()
  })
})
