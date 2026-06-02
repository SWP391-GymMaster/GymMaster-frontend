import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MealLogList } from "@/features/member-nutrition/components/MealLogList"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

describe("MealLogList", () => {
  it("shows empty state", () => {
    renderWithMemberSession(<MealLogList logs={[]} />)

    expect(screen.getByText("Hôm nay chưa có bữa ăn.")).toBeInTheDocument()
  })

  it("renders meal entries", () => {
    renderWithMemberSession(
      <MealLogList
        logs={[
          {
            id: 1,
            memberId: 101,
            logDate: "2026-06-02",
            mealType: "lunch",
            items: [
              {
                foodItemId: 901,
                foodName: "Chicken breast",
                quantity: 1.5,
                unit: "100g",
                calories: 247.5,
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText("Bữa trưa")).toBeInTheDocument()
    expect(screen.getByText(/Chicken breast/)).toBeInTheDocument()
    expect(screen.getByText("248 kcal")).toBeInTheDocument()
  })
})
