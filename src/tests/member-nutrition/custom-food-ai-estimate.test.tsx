import { fireEvent, screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CreateCustomFoodDialog } from "@/features/member-nutrition/components/FoodSearchPanel"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { server } from "@/mocks/server"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("CreateCustomFoodDialog AI estimate", () => {
  it("fills a reviewable per-100g draft and only saves after submit", async () => {
    const onCreated = vi.fn()
    renderWithMemberSession(
      <CreateCustomFoodDialog initialName="Gà ta" onCreated={onCreated} />,
    )

    fireEvent.click(screen.getByTestId("member-custom-food-trigger"))
    fireEvent.click(screen.getByTestId("member-custom-food-ai-estimate"))

    expect(
      await screen.findByText(/AI đã điền dinh dưỡng ước tính cho 100g/i),
    ).toBeInTheDocument()
    expect(screen.getByTestId("member-custom-food-unit")).toHaveValue("100g")
    expect(screen.getByTestId("member-custom-food-calories")).toHaveValue(165)
    expect(screen.getByTestId("member-custom-food-protein")).toHaveValue(31)
    expect(screen.getByTestId("member-custom-food-carbs")).toHaveValue(0)
    expect(screen.getByTestId("member-custom-food-fat")).toHaveValue(3.6)
    expect(onCreated).not.toHaveBeenCalled()

    fireEvent.change(screen.getByTestId("member-custom-food-calories"), {
      target: { value: "170" },
    })
    fireEvent.click(screen.getByTestId("member-custom-food-submit"))

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Gà ta",
          unit: "100g",
          caloriesPerUnit: 170,
        }),
      )
    })
  })

  it("keeps manual fields available when AI estimation fails", async () => {
    server.use(
      http.post("/api/v1/foods/estimate-nutrition", () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: { code: "RECOGNITION_UNAVAILABLE", message: "Gemini unavailable" },
            meta: null,
          },
          { status: 502 },
        ),
      ),
    )
    renderWithMemberSession(
      <CreateCustomFoodDialog initialName="Gà ta" onCreated={vi.fn()} />,
    )

    fireEvent.click(screen.getByTestId("member-custom-food-trigger"))
    fireEvent.click(screen.getByTestId("member-custom-food-ai-estimate"))

    expect(
      await screen.findByText(/Không thể ước tính bằng AI/i),
    ).toBeInTheDocument()
    expect(screen.getByTestId("member-custom-food-name")).toHaveValue("Gà ta")
    expect(screen.getByTestId("member-custom-food-calories")).toBeEnabled()
  })
})
