import { screen } from "@testing-library/react"
import { http } from "msw"
import { describe, expect, it } from "vitest"

import { CalorieSummaryWorkspace } from "@/features/member-nutrition/components/CalorieSummaryWorkspace"
import { server } from "@/mocks/server"
import { ok } from "@/mocks/utils/api-response"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

type MockTarget = {
  dailyCalories: unknown
  proteinG: unknown
  carbG: unknown
  fatG: unknown
}

function mockSummary(data: Record<string, unknown>) {
  server.use(
    http.get("/api/v1/members/:id/calorie-summary", ({ request }) => {
      const date = new URL(request.url).searchParams.get("date") ?? "2026-06-02"

      return ok({
        date,
        ...data,
      })
    }),
    http.get("/api/v1/meal-logs", () => ok([])),
    http.get("/api/v1/members/:id/calorie-target", () => {
      if (data.target == null) {
        return ok<MockTarget | null>(null)
      }
      return ok<MockTarget | null>({
        dailyCalories: data.target,
        proteinG: data.targetProteinG,
        carbG: data.targetCarbG,
        fatG: data.targetFatG,
      })
    }),
  )
}

describe("CalorieSummaryWorkspace", () => {
  it("shows a configure CTA without fake target numbers when target is missing", async () => {
    mockSummary({
      consumed: 345,
      target: null,
      remaining: null,
      consumedProteinG: 32,
      consumedCarbG: 41,
      consumedFatG: 12,
      targetProteinG: null,
      targetCarbG: null,
      targetFatG: null,
      remainingProteinG: null,
      remainingCarbG: null,
      remainingFatG: null,
    })

    renderWithMemberSession(<CalorieSummaryWorkspace />)

    expect(
      await screen.findByText("Bạn chưa đặt mục tiêu dinh dưỡng"),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole("button", { name: "Cấu hình mục tiêu" }).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByText("2.200 kcal")).not.toBeInTheDocument()
    expect(screen.getByText("345 kcal")).toBeInTheDocument()
  })

  it("renders real consumed macros, target macros, and remaining values from BE", async () => {
    mockSummary({
      consumed: 345,
      target: 1800,
      remaining: 1455,
      consumedProteinG: 32,
      consumedCarbG: 41,
      consumedFatG: 12,
      targetProteinG: 120,
      targetCarbG: 210,
      targetFatG: 55,
      remainingProteinG: 88,
      remainingCarbG: 169,
      remainingFatG: 43,
    })

    renderWithMemberSession(<CalorieSummaryWorkspace />)

    expect(await screen.findByText("Dinh dưỡng hôm nay")).toBeInTheDocument()
    expect(screen.getByText("345 kcal")).toBeInTheDocument()
    expect(screen.getByText("1.800 kcal")).toBeInTheDocument()
    expect(screen.getByText("1455")).toBeInTheDocument()
    expect(screen.getByText("32g / 120g")).toBeInTheDocument()
    expect(screen.getByText("41g / 210g")).toBeInTheDocument()
    expect(screen.getByText("12g / 55g")).toBeInTheDocument()
  })
})
