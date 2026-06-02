import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AdminPtAssignmentWorkspace } from "@/features/pt-assignment/components/AdminPtAssignmentWorkspace"
import { renderWithAdminSession } from "@/tests/admin-dashboard/test-utils"

describe("AdminPtAssignmentWorkspace", () => {
  it("starts with disabled confirm until member and trainer are selected", async () => {
    renderWithAdminSession(<AdminPtAssignmentWorkspace />)

    expect(await screen.findByText("Unassigned Members")).toBeInTheDocument()
    expect(screen.getByText("Available Trainers")).toBeInTheDocument()
    expect(screen.getByTestId("assignment-confirm-button")).toBeDisabled()
  })

  it("assigns an unassigned member to a trainer and shows audit evidence", async () => {
    renderWithAdminSession(<AdminPtAssignmentWorkspace />)

    fireEvent.click(await screen.findByText("Tran Bao Long"))
    fireEvent.click(await screen.findByText("Jessica Vance"))
    fireEvent.click(screen.getByTestId("assignment-confirm-button"))

    expect(await screen.findByTestId("assignment-success")).toHaveTextContent(
      "PT assigned",
    )
    expect(screen.getByTestId("assignment-success")).toHaveTextContent(
      /Audit Log #\d+ · ASSIGN_PT/,
    )
  })

  it("reassigns an actively assigned member and ends the previous assignment", async () => {
    renderWithAdminSession(<AdminPtAssignmentWorkspace />)

    fireEvent.click(await screen.findByText("Nguyen Minh Anh"))
    fireEvent.click(await screen.findByText("Marcus Cole"))
    expect(screen.getByText(/Replaces Coach PT/)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId("assignment-confirm-button"))

    await waitFor(() => {
      expect(screen.getByTestId("assignment-success")).toHaveTextContent(
        "PT reassigned",
      )
    })
    expect(screen.getByTestId("assignment-success")).toHaveTextContent(
      /Previous assignment #\d+ ended/,
    )
  })
})
