import { fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ProgressLogForm } from "@/features/member-progress-tracking/components/ProgressLogForm"
import { resetAuthSessionForTest } from "@/features/auth/session/auth-session"
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils"

afterEach(() => {
  resetAuthSessionForTest()
})

describe("ProgressLogForm", () => {
  it("enforces validation rules for weight", async () => {
    renderWithMemberSession(<ProgressLogForm memberId={101} />)

    // Open Dialog
    fireEvent.click(screen.getByTestId("member-progress-trigger"))

    // Set invalid weight (negative or string gets validated by zod)
    fireEvent.change(screen.getByTestId("progress-form-weight"), {
      target: { value: "-5" },
    })

    // Click Save
    fireEvent.click(screen.getByTestId("progress-form-submit"))

    // Error should be displayed
    expect(await screen.findByText("Cân nặng phải lớn hơn 0.")).toBeInTheDocument()
  })

  it("requires measured date", async () => {
    renderWithMemberSession(<ProgressLogForm memberId={101} />)

    // Open Dialog
    fireEvent.click(screen.getByTestId("member-progress-trigger"))

    // Clear Date
    fireEvent.change(screen.getByTestId("progress-form-date"), {
      target: { value: "" },
    })

    // Click Save
    fireEvent.click(screen.getByTestId("progress-form-submit"))

    // Error should be displayed
    expect(await screen.findByText("Vui lòng chọn ngày ghi nhận.")).toBeInTheDocument()
  })

  it("submits successfully with valid data", async () => {
    const handleSuccess = vi.fn()
    renderWithMemberSession(<ProgressLogForm memberId={101} onSuccess={handleSuccess} />)

    // Open Dialog
    fireEvent.click(screen.getByTestId("member-progress-trigger"))

    // Fill valid weight
    fireEvent.change(screen.getByTestId("progress-form-weight"), {
      target: { value: "70.5" },
    })
    
    // Fill valid body fat
    fireEvent.change(screen.getByTestId("progress-form-fat"), {
      target: { value: "15.4" },
    })

    // Click Save
    fireEvent.click(screen.getByTestId("progress-form-submit"))

    // Verify dialog closes and onSuccess is triggered
    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled()
    })
    expect(screen.queryByText("Ghi nhận chỉ số cơ thể")).not.toBeInTheDocument()
  })
})
