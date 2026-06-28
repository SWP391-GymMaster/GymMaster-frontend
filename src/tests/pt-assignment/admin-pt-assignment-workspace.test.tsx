import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AdminPtAssignmentWorkspace } from "@/features/pt-assignment/components/AdminPtAssignmentWorkspace"
import { renderWithAdminSession } from "@/tests/admin-dashboard/test-utils"

describe("AdminPtAssignmentWorkspace", () => {
  it("starts with disabled confirm until member and trainer are selected", async () => {
    renderWithAdminSession(<AdminPtAssignmentWorkspace />)

    fireEvent.click(await screen.findByText("Bắt đầu phân công PT"))

    expect(await screen.findByText("Hội viên cần phân công")).toBeInTheDocument()
    expect(screen.getAllByText("PT khả dụng").length).toBeGreaterThan(0)
    expect(screen.getByTestId("assignment-confirm-button")).toBeDisabled()
  })

  it("assigns an unassigned member to a trainer and shows audit evidence", async () => {
    renderWithAdminSession(<AdminPtAssignmentWorkspace />)

    fireEvent.click(await screen.findByText("Bắt đầu phân công PT"))

    fireEvent.click(await screen.findByText("Tran Bao Long"))
    fireEvent.click(await screen.findByText("Jessica Vance"))
    fireEvent.click(screen.getByTestId("assignment-confirm-button"))

    expect(await screen.findByTestId("assignment-success")).toHaveTextContent(
      "Đã phân công PT",
    )
    expect(screen.getByTestId("assignment-success")).toHaveTextContent(
      /Audit Log #\d+ · ASSIGN_PT/,
    )
  })

  it("blocks duplicate active assignment with final 422 rule", async () => {
    renderWithAdminSession(<AdminPtAssignmentWorkspace />)

    fireEvent.click(await screen.findByText("Bắt đầu phân công PT"))

    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    fireEvent.click(await screen.findByText("Marcus Cole"))
    expect(
      screen.getByText(/kết thúc phân công hiện tại trước khi gán PT mới/),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId("assignment-confirm-button"))

    await waitFor(() => {
      expect(screen.getByTestId("assignment-error")).toHaveTextContent(
        "Hội viên này đang có PT active",
      )
    })
    expect(screen.queryByTestId("assignment-success")).not.toBeInTheDocument()
  })
})
