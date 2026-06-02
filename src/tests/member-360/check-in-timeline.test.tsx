import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CheckInTimeline } from "@/features/member-360/components/CheckInTimeline"

describe("CheckInTimeline", () => {
  it("renders check-in entries", () => {
    render(
      <CheckInTimeline
        entries={[
          { id: 1, checkInAt: "2026-06-01T09:30:00.000Z" },
          { id: 2, checkInAt: "2026-05-31T08:15:00.000Z" },
        ]}
      />,
    )

    expect(screen.getByText("Check-in gần đây")).toBeInTheDocument()
  })

  it("renders empty state", () => {
    render(<CheckInTimeline entries={[]} />)

    expect(screen.getByText("Chưa có lượt check-in")).toBeInTheDocument()
  })

  it("renders loading skeleton", () => {
    const { container } = render(
      <CheckInTimeline
        entries={[{ id: 1, checkInAt: "2026-06-01T09:30:00.000Z" }]}
        isLoading
      />,
    )

    expect(screen.queryByText("Check-in gần đây")).not.toBeInTheDocument()
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0)
  })

  it("renders without entries prop (undefined)", () => {
    render(<CheckInTimeline />)

    expect(screen.getByText("Chưa có lượt check-in")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <CheckInTimeline className="custom-class" entries={[]} />,
    )

    expect((container.firstChild as HTMLElement).className).toContain("custom-class")
  })
})
