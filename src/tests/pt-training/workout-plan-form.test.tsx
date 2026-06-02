import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { WorkoutPlanForm } from "@/features/pt-training/components/WorkoutPlanForm"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithPtSession } from "@/tests/pt-training/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("WorkoutPlanForm", () => {
  it("requires title and exercise name before submit", async () => {
    renderWithPtSession(<WorkoutPlanForm onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByTestId("workout-plan-submit-button"))

    expect(await screen.findByText("Vui lòng nhập tên giáo án.")).toBeInTheDocument()
    expect(await screen.findByText("Vui lòng nhập tên bài tập.")).toBeInTheDocument()
  })

  it("submits normalized workout plan draft", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithPtSession(<WorkoutPlanForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Tên giáo án"), {
      target: { value: "Strength Block" },
    })
    fireEvent.change(screen.getByLabelText("Tên bài tập"), {
      target: { value: "Deadlift" },
    })
    fireEvent.change(screen.getByLabelText("Số hiệp"), {
      target: { value: "5" },
    })
    fireEvent.change(screen.getByLabelText("Reps"), {
      target: { value: "5" },
    })
    fireEvent.change(screen.getByLabelText("Ghi chú bài tập"), {
      target: { value: "Stop one rep before form breaks." },
    })
    fireEvent.click(screen.getByTestId("workout-plan-submit-button"))

    expect(await screen.findByText("Đã lưu giáo án")).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Strength Block",
      exercises: [
        {
          name: "Deadlift",
          sets: 5,
          reps: "5",
          note: "Stop one rep before form breaks.",
          orderIndex: 0,
        },
      ],
    })
  })
})
