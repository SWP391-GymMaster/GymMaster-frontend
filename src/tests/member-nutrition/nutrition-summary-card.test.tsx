import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NutritionSummaryCard } from "@/features/member-nutrition/components/NutritionSummaryCard"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

describe("NutritionSummaryCard", () => {
  it("shows loading state", () => {
    renderWithMemberSession(<NutritionSummaryCard isLoading />)

    expect(screen.getByText("Đang tải tổng kết dinh dưỡng...")).toBeInTheDocument()
  })

  it("shows an error state", () => {
    renderWithMemberSession(<NutritionSummaryCard isError />)

    expect(
      screen.getByText("Không thể tải tổng kết dinh dưỡng."),
    ).toBeInTheDocument()
  })

  it("shows an empty state when summary is missing", () => {
    renderWithMemberSession(<NutritionSummaryCard />)

    expect(screen.getByText("Chưa có tổng kết dinh dưỡng.")).toBeInTheDocument()
  })

  it("renders consumed, target, and remaining calories", () => {
    renderWithMemberSession(
      <NutritionSummaryCard
        summary={{
          memberId: 101,
          date: "2026-06-02",
          consumed: 425,
          target: 2200,
          remaining: 1775,
        }}
      />,
    )

    expect(screen.getAllByText("425 kcal").length).toBeGreaterThan(0)
    expect(screen.getByText("2.200 kcal")).toBeInTheDocument()
    expect(screen.getByText("Còn 1.775 kcal")).toBeInTheDocument()
    expect(screen.getAllByText("Chưa có dữ liệu")).toHaveLength(3)
  })
})
