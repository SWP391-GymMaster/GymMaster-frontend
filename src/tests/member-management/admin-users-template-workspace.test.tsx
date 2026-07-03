import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AdminUsersTemplateWorkspace } from "@/features/member-management/components/AdminUsersTemplateWorkspace"
import { mapMemberManagementError } from "@/features/member-management/utils/member-management-errors"
import { ApiClientError } from "@/lib/api/http-client"
import { renderWithAdminSession } from "@/tests/admin-dashboard/test-utils"

describe("AdminUsersTemplateWorkspace", () => {
  it("creates, edits, locks, resets password, and deletes a user", async () => {
    renderWithAdminSession(<AdminUsersTemplateWorkspace />)

    await waitFor(() => {
      expect(screen.getAllByText("GymMaster Admin").length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getByTestId("user-create-open"))
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

    expect(await screen.findByText("Da cap nhat thong tin nguoi dung")).toBeInTheDocument()
    expect((await screen.findAllByText("Template Fidelity Lead")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("user-toggle-lock-button"))
    expect(await screen.findByText(/Da khoa tai khoan|ÄÃ£ khÃ³a tÃ i khoáº£n/)).toBeInTheDocument()

    const securityTab = screen.getByRole("tab", { name: /B|b/ })
    fireEvent.pointerDown(securityTab)
    fireEvent.mouseDown(securityTab)
    fireEvent.click(securityTab)
    fireEvent.click(await screen.findByTestId("user-reset-password-button"))
    expect(await screen.findByText(/Mat khau tam thoi:|Máº­t kháº©u táº¡m thá»i:/)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId("user-delete-button"))
    expect(await screen.findByText(/vo hieu hoa|vÃ´ hiá»‡u hÃ³a/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryAllByText("Template Fidelity Lead")).toHaveLength(0)
    })
  })

  it("limits create-user role choices to staff and admin", async () => {
    renderWithAdminSession(<AdminUsersTemplateWorkspace />)

    fireEvent.click(screen.getByTestId("user-create-open"))

    const select = screen.getByTestId("user-create-role") as HTMLSelectElement
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      "staff",
      "admin",
    ])
    expect(screen.getByText(/Man nay chi tao tai khoan van hanh/)).toBeInTheDocument()
  })

  it("keeps account roles immutable in every edit form", async () => {
    renderWithAdminSession(<AdminUsersTemplateWorkspace />)

    expect((await screen.findAllByText("GymMaster Admin")).length).toBeGreaterThan(0)
    expect(screen.queryByTestId("user-edit-role")).not.toBeInTheDocument()
    expect(screen.getByText(/Vai tro duoc gan khi tao tai khoan/)).toBeInTheDocument()

    fireEvent.click(await screen.findByText("Gym Member"))

    expect(screen.queryByTestId("user-edit-role")).not.toBeInTheDocument()
    expect(screen.getByText(/Vai tro duoc gan khi tao tai khoan/)).toBeInTheDocument()
    expect(screen.getByText(/Ho so ca nhan cua Hoi vien/)).toBeInTheDocument()
  })

  it("maps blocked role transition errors to the immutable-role guard message", () => {
    const result = mapMemberManagementError(
      new ApiClientError(
        {
          code: "ROLE_TRANSITION_NOT_ALLOWED",
          message: "Cannot transition role",
        },
        422,
      ),
    )

    expect(result.message).toMatch(/Vai tro duoc gan khi tao tai khoan/)
  })
})
