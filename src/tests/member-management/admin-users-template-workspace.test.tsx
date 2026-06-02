import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AdminUsersTemplateWorkspace } from "@/features/member-management/components/AdminUsersTemplateWorkspace2"
import { renderWithAdminSession } from "@/tests/admin-dashboard/test-utils"

describe("AdminUsersTemplateWorkspace", () => {
  it("creates, edits, locks, resets password, and deletes a user", async () => {
    renderWithAdminSession(<AdminUsersTemplateWorkspace />)

    expect(await screen.findByText("Directory")).toBeInTheDocument()
    expect(screen.getByText("Role Editor")).toBeInTheDocument()

    fireEvent.change(screen.getByTestId("user-create-name"), {
      target: { value: "Template Fidelity Staff" },
    })
    fireEvent.change(screen.getByTestId("user-create-email"), {
      target: { value: "template-fidelity-staff@gymmaster.local" },
    })
    fireEvent.change(screen.getByTestId("user-create-phone"), {
      target: { value: "0900000555" },
    })
    fireEvent.click(screen.getByTestId("user-create-submit"))

    fireEvent.click(await screen.findByText("Template Fidelity Staff"))

    fireEvent.change(screen.getByTestId("user-edit-name"), {
      target: { value: "Template Fidelity Lead" },
    })
    fireEvent.click(screen.getByTestId("user-edit-submit"))

    expect(await screen.findByText("User profile updated")).toBeInTheDocument()
    expect(
      (await screen.findAllByText("Template Fidelity Lead")).length,
    ).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("user-toggle-lock-button"))
    expect(await screen.findByText("User locked")).toBeInTheDocument()
    expect((await screen.findAllByText("Locked")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("user-reset-password-button"))
    expect(await screen.findByText("Temporary password generated")).toBeInTheDocument()
    expect(await screen.findByText(/Temporary password:/)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId("user-delete-button"))
    expect(await screen.findByText("User deactivated")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryAllByText("Template Fidelity Lead")).toHaveLength(0)
    })
  })
})
