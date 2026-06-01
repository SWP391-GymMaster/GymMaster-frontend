import { render, screen } from "@testing-library/react"
import { DollarSign } from "lucide-react"
import { describe, expect, it } from "vitest"

import { DashboardMetricCard } from "@/features/admin-dashboard/components/DashboardMetricCard"

describe("DashboardMetricCard", () => {
  it("renders label and value", () => {
    render(<DashboardMetricCard label="Revenue" value="$12,000" />)

    expect(screen.getByText("Revenue")).toBeInTheDocument()
    expect(screen.getByText("$12,000")).toBeInTheDocument()
  })

  it("renders numeric value", () => {
    render(<DashboardMetricCard label="Active members" value={128} />)

    expect(screen.getByText("Active members")).toBeInTheDocument()
    expect(screen.getByText("128")).toBeInTheDocument()
  })

  it("renders icon when provided", () => {
    const { container } = render(
      <DashboardMetricCard icon={DollarSign} label="Revenue" value="$12,000" />,
    )

    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("renders skeleton when loading", () => {
    const { container } = render(
      <DashboardMetricCard isLoading label="Revenue" value="$12,000" />,
    )

    // Should not show actual value while loading
    expect(screen.queryByText("$12,000")).not.toBeInTheDocument()
    // Should have animated pulse elements
    const pulseElements = container.querySelectorAll(".animate-pulse")
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it("renders skeleton with icon when loading and icon provided", () => {
    const { container } = render(
      <DashboardMetricCard
        icon={DollarSign}
        isLoading
        label="Revenue"
        value="$12,000"
      />,
    )

    const pulseElements = container.querySelectorAll(".animate-pulse")
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it("renders up trend indicator", () => {
    render(
      <DashboardMetricCard
        label="Revenue"
        trend={{ direction: "up", label: "+12% this month" }}
        value="$12,000"
      />,
    )

    expect(screen.getByText("+12% this month")).toBeInTheDocument()
  })

  it("renders down trend indicator", () => {
    render(
      <DashboardMetricCard
        label="Revenue"
        trend={{ direction: "down", label: "-5% this month" }}
        value="$12,000"
      />,
    )

    expect(screen.getByText("-5% this month")).toBeInTheDocument()
  })

  it("renders neutral trend indicator", () => {
    render(
      <DashboardMetricCard
        label="Revenue"
        trend={{ direction: "neutral", label: "Same as last month" }}
        value="$12,000"
      />,
    )

    expect(screen.getByText("Same as last month")).toBeInTheDocument()
  })

  it("does not render trend when not provided", () => {
    render(<DashboardMetricCard label="Revenue" value="$12,000" />)

    expect(screen.queryByText("up")).not.toBeInTheDocument()
    expect(screen.queryByText("down")).not.toBeInTheDocument()
    expect(screen.queryByText("neutral")).not.toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <DashboardMetricCard
        className="custom-class"
        label="Revenue"
        value="$12,000"
      />,
    )

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain("custom-class")
  })
})
