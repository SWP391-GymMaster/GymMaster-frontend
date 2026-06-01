import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { MemberSearchPanel } from "@/features/staff-front-desk/components/MemberSearchPanel"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithStaffSession } from "@/tests/staff-front-desk/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("MemberSearchPanel", () => {
  it("finds a member by phone and shows readable membership status", async () => {
    renderWithStaffSession(<MemberSearchPanel />)

    fireEvent.change(screen.getByTestId("staff-member-search-input"), {
      target: { value: "0900000101" },
    })
    fireEvent.click(screen.getByTestId("staff-member-search-button"))

    expect(await screen.findByText("Nguyen Minh Anh")).toBeInTheDocument()
    expect(screen.getByText("GM-101 · 0900000101 · member@gymmaster.local")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("shows an empty state when no member matches", async () => {
    renderWithStaffSession(<MemberSearchPanel />)

    fireEvent.change(screen.getByTestId("staff-member-search-input"), {
      target: { value: "not-a-member" },
    })
    fireEvent.click(screen.getByTestId("staff-member-search-button"))

    await waitFor(() => {
      expect(screen.getByText(/No member found/i)).toBeInTheDocument()
    })
  })
})
