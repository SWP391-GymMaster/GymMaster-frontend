import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { CheckInTerminal } from "@/features/staff-front-desk/components/CheckInTerminal"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithStaffSession } from "@/tests/staff-front-desk/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("CheckInTerminal", () => {
  it("starts without a visible demo check-in lookup", () => {
    renderWithStaffSession(<CheckInTerminal />)

    expect(screen.getByTestId("staff-checkin-search")).toHaveValue("")
    expect(screen.queryByText("Nguyen Minh Anh")).not.toBeInTheDocument()
  })

  it("shows a lookup validation message for short searches", async () => {
    renderWithStaffSession(<CheckInTerminal />)

    fireEvent.change(screen.getByTestId("staff-checkin-search"), {
      target: { value: "G" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }))

    expect(
      await screen.findByText("Nhập mã hội viên, điện thoại, email hoặc tên."),
    ).toBeInTheDocument()
  })

  it("confirms check-in for an active member", async () => {
    renderWithStaffSession(<CheckInTerminal />)

    fireEvent.change(screen.getByTestId("staff-checkin-search"), {
      target: { value: "GM-101" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }))
    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    fireEvent.click(screen.getByTestId("staff-checkin-confirm"))

    expect(await screen.findByText("Đã xác nhận check-in.")).toBeInTheDocument()
    expect(screen.getByText("Đã check-in")).toBeInTheDocument()
  })

  it("denies check-in when membership is inactive", async () => {
    renderWithStaffSession(<CheckInTerminal />)

    fireEvent.change(screen.getByTestId("staff-checkin-search"), {
      target: { value: "GM-103" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }))
    fireEvent.click(await screen.findByText("Le Hoang My"))
    fireEvent.click(screen.getByTestId("staff-checkin-confirm"))

    expect(await screen.findByText(/Từ chối check-in/i)).toBeInTheDocument()
  })
})
