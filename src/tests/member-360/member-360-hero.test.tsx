import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Member360Hero } from "@/features/member-360/components/Member360Hero"

describe("Member360Hero", () => {
  const defaultProps = {
    fullName: "Nguyen Van A",
    memberCode: "GM-101",
    email: "a.nguyen@gymmaster.local",
    phone: "0901234567",
    status: "active" as const,
  }

  it("renders member identity info", () => {
    render(<Member360Hero {...defaultProps} />)

    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument()
    expect(screen.getByText("GM-101")).toBeInTheDocument()
    expect(screen.getByText("a.nguyen@gymmaster.local")).toBeInTheDocument()
    expect(screen.getByText("0901234567")).toBeInTheDocument()
  })

  it("renders status pill with active", () => {
    render(<Member360Hero {...defaultProps} status="active" />)

    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("renders status pill with expired", () => {
    render(<Member360Hero {...defaultProps} status="expired" />)

    expect(screen.getByText("Expired")).toBeInTheDocument()
  })

  it("renders status pill with pending", () => {
    render(<Member360Hero {...defaultProps} status="pending" />)

    expect(screen.getByText("Pending")).toBeInTheDocument()
  })

  it("renders PT view context label", () => {
    render(<Member360Hero {...defaultProps} viewContext="pt" />)

    expect(screen.getByText("Assigned member")).toBeInTheDocument()
  })

  it("renders admin view context label", () => {
    render(<Member360Hero {...defaultProps} viewContext="admin" />)

    expect(screen.getByText("Member detail")).toBeInTheDocument()
  })

  it("renders member self view context label", () => {
    render(<Member360Hero {...defaultProps} viewContext="member" />)

    expect(screen.getByText("My profile")).toBeInTheDocument()
  })

  it("renders user icon", () => {
    const { container } = render(<Member360Hero {...defaultProps} />)

    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("renders loading skeleton", () => {
    const { container } = render(
      <Member360Hero {...defaultProps} isLoading />,
    )

    expect(screen.queryByText("Nguyen Van A")).not.toBeInTheDocument()
    const pulseElements = container.querySelectorAll(".animate-pulse")
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it("applies custom className", () => {
    const { container } = render(
      <Member360Hero {...defaultProps} className="custom-class" />,
    )

    const el = container.firstChild as HTMLElement
    expect(el.className).toContain("custom-class")
  })
})
