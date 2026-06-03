import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CalorieSummaryWorkspace } from "@/features/member-nutrition/components/CalorieSummaryWorkspace"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

describe("CalorieSummaryWorkspace", () => {
  it("renders daily calorie summary for the current member", async () => {
    renderWithMemberSession(<CalorieSummaryWorkspace />)

    expect(await screen.findByText("Dinh dưỡng hôm nay")).toBeInTheDocument()
    expect(screen.getAllByText("Đã ăn").length).toBeGreaterThan(0)
    expect(screen.getByText("Mục tiêu")).toBeInTheDocument()
    expect(screen.getByText("Còn lại")).toBeInTheDocument()
  })
})
