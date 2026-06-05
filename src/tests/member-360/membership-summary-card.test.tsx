import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MembershipSummaryCard } from "@/features/member-360/components/MembershipSummaryCard"

describe("MembershipSummaryCard", () => {
  it("renders package name and dates", () => {
    render(
      <MembershipSummaryCard
        endDate="2026-09-29T00:00:00.000Z"
        membershipStatus="active"
        packageName="Strength 90"
        startDate="2026-07-01T00:00:00.000Z"
      />,
    )

    expect(screen.getByText("Strength 90")).toBeInTheDocument()
    expect(screen.getByText("Hoạt động")).toBeInTheDocument()
    expect(screen.getByText(/Bắt đầu:/)).toBeInTheDocument()
    expect(screen.getByText(/Kết thúc:/)).toBeInTheDocument()
  })

  it("renders payment status pill", () => {
    render(
      <MembershipSummaryCard
        membershipStatus="active"
        packageName="Premium 30"
        paymentStatus="paid"
      />,
    )

    expect(screen.getByText("Đã thanh toán")).toBeInTheDocument()
  })

  it("renders pending membership and payment status", () => {
    render(
      <MembershipSummaryCard
        membershipStatus="pending_payment"
        packageName="Premium 30"
        paymentStatus="pending"
      />,
    )

    expect(screen.getByText("Đang chờ")).toBeInTheDocument()
    expect(screen.getByText("Chờ thanh toán")).toBeInTheDocument()
  })

  it("renders expired status", () => {
    render(
      <MembershipSummaryCard
        membershipStatus="expired"
        packageName="Old Plan"
        paymentStatus="refunded"
      />,
    )

    expect(screen.getByText("Hết hạn")).toBeInTheDocument()
    expect(screen.getByText("Đã hoàn tiền")).toBeInTheDocument()
  })

  it("renders empty state when no membership", () => {
    render(<MembershipSummaryCard />)

    expect(screen.getByText("Chưa có gói hội viên active")).toBeInTheDocument()
  })

  it("renders loading skeleton", () => {
    const { container } = render(
      <MembershipSummaryCard isLoading packageName="Strength 90" />,
    )

    expect(screen.queryByText("Strength 90")).not.toBeInTheDocument()
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0)
  })

  it("applies custom className", () => {
    const { container } = render(
      <MembershipSummaryCard className="custom-class" packageName="Test" />,
    )

    expect((container.firstChild as HTMLElement).className).toContain("custom-class")
  })
})
