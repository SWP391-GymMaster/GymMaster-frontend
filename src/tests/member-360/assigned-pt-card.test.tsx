import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AssignedPTCard } from "@/features/member-360/components/AssignedPTCard"

describe("AssignedPTCard", () => {
  it("renders PT name and specialty", () => {
    render(
      <AssignedPTCard
        assignedAt="2026-05-28T00:00:00.000Z"
        fullName="Coach Minh"
        specialty="Strength & Conditioning"
      />,
    )

    expect(screen.getByText("Coach Minh")).toBeInTheDocument()
    expect(screen.getByText("Strength & Conditioning")).toBeInTheDocument()
    expect(screen.getByText(/Assigned on 28 May 2026/)).toBeInTheDocument()
  })

  it("renders PT name without specialty", () => {
    render(<AssignedPTCard fullName="Coach Minh" />)

    expect(screen.getByText("Coach Minh")).toBeInTheDocument()
  })

  it("renders empty state when no PT", () => {
    render(<AssignedPTCard />)

    expect(screen.getByText("No PT assigned")).toBeInTheDocument()
  })

  it("renders loading skeleton", () => {
    const { container } = render(
      <AssignedPTCard fullName="Coach Minh" isLoading />,
    )

    expect(screen.queryByText("Coach Minh")).not.toBeInTheDocument()
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0)
  })

  it("renders dumbbell icon when PT assigned", () => {
    const { container } = render(<AssignedPTCard fullName="Coach Minh" />)

    const svgs = container.querySelectorAll("svg")
    expect(svgs.length).toBeGreaterThan(0)
  })

  it("applies custom className", () => {
    const { container } = render(
      <AssignedPTCard className="custom-class" fullName="Coach Minh" />,
    )

    expect((container.firstChild as HTMLElement).className).toContain("custom-class")
  })
})
