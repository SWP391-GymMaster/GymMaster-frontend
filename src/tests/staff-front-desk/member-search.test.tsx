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

    await waitFor(() => {
      expect(screen.getAllByText("Nguyen Minh Anh").length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText("member@gymmaster.local").length).toBeGreaterThan(0)
    expect(screen.getAllByText("0900000101").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Hoạt động").length).toBeGreaterThan(0)
  })

  it("shows an empty state when no member matches", async () => {
    renderWithStaffSession(<MemberSearchPanel />)

    fireEvent.change(screen.getByTestId("staff-member-search-input"), {
      target: { value: "not-a-member" },
    })
    fireEvent.click(screen.getByTestId("staff-member-search-button"))

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy hội viên.")).toBeInTheDocument()
    })
  })
})
