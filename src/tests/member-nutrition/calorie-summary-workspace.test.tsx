import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CalorieSummaryWorkspace } from "@/features/member-nutrition/components/CalorieSummaryWorkspace"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

describe("CalorieSummaryWorkspace", () => {
  it("renders daily calorie summary for the current member", async () => {
    renderWithMemberSession(<CalorieSummaryWorkspace />)

    expect(await screen.findByText("Tổng kết calo ngày")).toBeInTheDocument()
    expect(screen.getByText("Đã ăn")).toBeInTheDocument()
    expect(screen.getByText("Mục tiêu")).toBeInTheDocument()
    expect(screen.getByText("Còn lại")).toBeInTheDocument()
  })
})
