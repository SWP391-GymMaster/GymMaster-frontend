import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TrainerNoteForm } from "@/features/pt-training/components/TrainerNoteForm"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithPtSession } from "@/tests/pt-training/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("TrainerNoteForm", () => {
  it("requires note content before submit", async () => {
    renderWithPtSession(<TrainerNoteForm onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByTestId("trainer-note-submit-button"))

    expect(await screen.findByText("Vui lòng nhập ghi chú luyện tập.")).toBeInTheDocument()
  })

  it("submits normalized trainer note draft", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithPtSession(<TrainerNoteForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Ghi chú huấn luyện"), {
      target: { value: "  Keep shoulder warm-up before pressing.  " },
    })
    fireEvent.click(screen.getByTestId("trainer-note-submit-button"))

    expect(await screen.findByText("Đã lưu ghi chú PT")).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith({
      content: "Keep shoulder warm-up before pressing.",
    })
  })
})
