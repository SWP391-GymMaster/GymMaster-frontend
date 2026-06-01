import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CalorieSummaryWorkspace } from "@/features/member-nutrition/components/CalorieSummaryWorkspace"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

describe("CalorieSummaryWorkspace", () => {
  it("renders daily calorie summary for the current member", async () => {
    renderWithMemberSession(<CalorieSummaryWorkspace />)

    expect(await screen.findByText("Daily calorie summary")).toBeInTheDocument()
    expect(screen.getByText("Consumed")).toBeInTheDocument()
    expect(screen.getByText("Target")).toBeInTheDocument()
    expect(screen.getByText("Remaining")).toBeInTheDocument()
  })
})
