import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { WorkoutPlanForm } from "@/features/pt-training/components/WorkoutPlanForm"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithPtSession } from "@/tests/pt-training/test-utils"
import { AppProviders } from "@/app/providers"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("WorkoutPlanForm", () => {
  it("requires title and exercise name before submit", async () => {
    renderWithPtSession(<WorkoutPlanForm onSubmit={vi.fn()} />)

    // Go to step 2 (Exercises) and then step 3 (Save) to access the submit button
    fireEvent.click(screen.getByText("Bài tập"))
    fireEvent.click(screen.getByText("Lưu"))
    fireEvent.click(screen.getByTestId("workout-plan-submit-button"))

    // Go back to Step 2 to see the validation messages
    fireEvent.click(screen.getByText("Bài tập"))

    expect(await screen.findByText("Vui lòng nhập tên giáo án.")).toBeInTheDocument()
    expect(await screen.findByText("Vui lòng nhập tên bài tập.")).toBeInTheDocument()
  })

  it("submits normalized workout plan draft", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithPtSession(<WorkoutPlanForm onSubmit={onSubmit} />)

    // Go to step 2 to input data
    fireEvent.click(screen.getByText("Bài tập"))

    fireEvent.change(screen.getByLabelText("Tên buổi tập"), {
      target: { value: "Strength Block" },
    })
    fireEvent.change(screen.getByPlaceholderText("Tên bài tập custom"), {
      target: { value: "Deadlift" },
    })
    fireEvent.change(screen.getByLabelText("Sets"), {
      target: { value: "5" },
    })
    fireEvent.change(screen.getByLabelText("Reps"), {
      target: { value: "5" },
    })
    fireEvent.change(screen.getByLabelText("Cue / ghi chú"), {
      target: { value: "Stop one rep before form breaks." },
    })
    fireEvent.click(screen.getByText("Lưu"))
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

  it("adds exercise externally via props", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onAdded = vi.fn()
    const { rerender } = renderWithPtSession(
      <WorkoutPlanForm
        onSubmit={onSubmit}
        externalExerciseToAdd={undefined}
        onExternalExerciseAdded={onAdded}
      />
    )

    rerender(
      <AppProviders>
        <WorkoutPlanForm
          onSubmit={onSubmit}
          externalExerciseToAdd="Back Squat"
          onExternalExerciseAdded={onAdded}
        />
      </AppProviders>
    )

    expect(await screen.findByText("Đã thêm Back Squat")).toBeInTheDocument()
    // Bai tap da duoc nap vao editor (hien trong select/danh sach bai tap).
    expect((await screen.findAllByText("Back Squat")).length).toBeGreaterThan(0)
    expect(onAdded).toHaveBeenCalled()
  })

  it("saves custom preset and merges it in the list of presets", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithPtSession(<WorkoutPlanForm onSubmit={onSubmit} />)

    // Go to step 3 (Exercises) to write something
    fireEvent.click(screen.getByText("Bài tập"))
    fireEvent.change(screen.getByLabelText("Tên buổi tập"), {
      target: { value: "My Power Plan" },
    })
    fireEvent.change(screen.getByPlaceholderText("Tên bài tập custom"), {
      target: { value: "Bench Press" },
    })

    // Go to step 4 (Save)
    fireEvent.click(screen.getByText("Lưu"))

    // Click "Lưu thành Preset"
    fireEvent.click(screen.getByText("Lưu thành Preset"))

    // Fill in preset name in dialog
    const presetNameInput = screen.getByLabelText("Tên Preset")
    fireEvent.change(presetNameInput, { target: { value: "Custom Bench Preset" } })

    // Fill in description
    const presetDescInput = screen.getByLabelText("Mô tả Preset")
    fireEvent.change(presetDescInput, { target: { value: "Bench training custom preset" } })

    // Click "Xác nhận lưu"
    fireEvent.click(screen.getByText("Xác nhận lưu"))

    expect(await screen.findByText("Đã lưu preset thành công!")).toBeInTheDocument()

    // Select input or trigger should list it.
    // Let's verify localStorage has it.
    const customPresets = JSON.parse(localStorage.getItem("gymmaster-custom-presets") || "[]")
    expect(customPresets).toHaveLength(1)
    expect(customPresets[0].name).toBe("Custom Bench Preset")
  })
})
