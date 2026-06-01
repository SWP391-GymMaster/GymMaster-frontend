import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NutritionSummaryCard } from "@/features/member-nutrition/components/NutritionSummaryCard"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

describe("NutritionSummaryCard", () => {
  it("shows loading state", () => {
    renderWithMemberSession(<NutritionSummaryCard isLoading />)

    expect(screen.getByText("Loading nutrition summary...")).toBeInTheDocument()
  })

  it("shows an error state", () => {
    renderWithMemberSession(<NutritionSummaryCard isError />)

    expect(
      screen.getByText("Nutrition summary could not be loaded."),
    ).toBeInTheDocument()
  })

  it("shows an empty state when summary is missing", () => {
    renderWithMemberSession(<NutritionSummaryCard />)

    expect(screen.getByText("No nutrition summary yet.")).toBeInTheDocument()
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
    expect(screen.getByText("2,200 kcal")).toBeInTheDocument()
    expect(screen.getByText("1,775 kcal remaining")).toBeInTheDocument()
    expect(screen.getAllByText("Not available")).toHaveLength(3)
  })
})
