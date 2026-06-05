import { fireEvent, screen, waitFor } from "@testing-library/react"
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
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))

    expect(
      await screen.findByText("Nhập mã hội viên, điện thoại, email hoặc tên."),
    ).toBeInTheDocument()
  })

  it("confirms check-in for an active member", async () => {
    renderWithStaffSession(<CheckInTerminal />)

    fireEvent.change(screen.getByTestId("staff-checkin-search"), {
      target: { value: "GM-101" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))
    await waitFor(() => {
      const card = screen.getAllByText("Nguyen Minh Anh").find((el) => el.closest("button"))
      if (!card) throw new Error("Card not found")
      fireEvent.click(card)
    })
    fireEvent.click(screen.getByTestId("staff-checkin-confirm"))

    expect(await screen.findByText("Đã xác nhận check-in.")).toBeInTheDocument()
    expect(screen.getByText("Đã check-in")).toBeInTheDocument()
  })

  it("denies check-in when membership is inactive", async () => {
    renderWithStaffSession(<CheckInTerminal />)

    fireEvent.change(screen.getByTestId("staff-checkin-search"), {
      target: { value: "GM-103" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))
    await waitFor(() => {
      const card = screen.getAllByText("Le Hoang My").find((el) => el.closest("button"))
      if (!card) throw new Error("Card not found")
      fireEvent.click(card)
    })
    fireEvent.click(screen.getByTestId("staff-checkin-confirm"))

    expect(await screen.findByText(/Từ chối check-in/i)).toBeInTheDocument()
  })

  it("displays quick actions for renew and payment when check-in is blocked/denied", async () => {
    renderWithStaffSession(<CheckInTerminal />)

    fireEvent.change(screen.getByTestId("staff-checkin-search"), {
      target: { value: "GM-103" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))
    await waitFor(() => {
      const card = screen.getAllByText("Le Hoang My").find((el) => el.closest("button"))
      if (!card) throw new Error("Card not found")
      fireEvent.click(card)
    })

    // Check before confirm - BlockedHint with quick actions should be visible
    expect(screen.getByText("Gia hạn gói tập")).toBeInTheDocument()
    expect(screen.getByText("Thanh toán ngay")).toBeInTheDocument()

    // Confirm check-in to get check-in denied result
    fireEvent.click(screen.getByTestId("staff-checkin-confirm"))

    // Result panel should show denied result, and quick actions should still be there
    expect(await screen.findByText(/Từ chối check-in/i)).toBeInTheDocument()
    expect(screen.getAllByText("Gia hạn gói tập")[0]).toBeInTheDocument()
    expect(screen.getAllByText("Thanh toán ngay")[0]).toBeInTheDocument()
  })
})
