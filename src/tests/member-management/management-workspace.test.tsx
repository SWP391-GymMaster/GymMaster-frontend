import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AppProviders } from "@/app/providers"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

function renderWithRole(
  role: "admin" | "staff",
  mode: "members" | "staff" | "trainers" = "members",
) {
  resetAuthSessionForTest()
  useAuthSessionStore.getState().setSession({
    accessToken: `access-${role}`,
    refreshToken: `refresh-${role}`,
    expiresAt: "2026-12-31T23:59:59.000Z",
    role,
    user: {
      email: `${role}@gymmaster.local`,
      fullName: role === "admin" ? "Admin User" : "Front Desk Staff",
      role,
      status: "active",
      userId: role === "admin" ? 1 : 2,
    },
  })

  return render(
    <AppProviders>
      <ManagementWorkspace
        canDeleteMembers={role === "admin"}
        detailBasePath={`/${role}/members`}
        mode={mode}
      />
    </AppProviders>,
  )
}

describe("ManagementWorkspace", () => {
  it("renders member management records from backend contract", async () => {
    renderWithRole("staff")

    expect((await screen.findAllByText("Nguyen Minh Anh")).length).toBeGreaterThan(0)
    expect(screen.getAllByText("GM-101").length).toBeGreaterThan(0)
    expect(screen.getByTestId("management-search-input")).toBeInTheDocument()
  })

  it("lets admin soft-delete a member from the list", async () => {
    renderWithRole("admin")

    expect(await screen.findByText("Tran Bao Long")).toBeInTheDocument()
    const deleteButtons = await screen.findAllByRole("button", { name: /xóa/i })
    fireEvent.click(deleteButtons[1])

    await waitFor(() => {
      expect(screen.queryByText("Tran Bao Long")).not.toBeInTheDocument()
    })
  })

  it("renders the staff template with access control and create feedback", async () => {
    renderWithRole("admin", "staff")

    expect(await screen.findByText("Quản lý nhân sự")).toBeInTheDocument()
    expect(screen.getByText("Đội ngũ Lễ tân")).toBeInTheDocument()
    expect((await screen.findAllByText("Front Desk Staff")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Thêm nhân sự" }))
    fireEvent.change(screen.getByTestId("user-create-name"), {
      target: { value: "Template Staff Component" },
    })
    fireEvent.change(screen.getByTestId("user-create-email"), {
      target: { value: "template-staff-component@gymmaster.local" },
    })
    fireEvent.change(screen.getByTestId("user-create-phone"), {
      target: { value: "0900000991" },
    })
    fireEvent.click(screen.getByTestId("user-create-submit"))

    expect(await screen.findByText("Template Staff Component")).toBeInTheDocument()
    expect(await screen.findByText(/Mật khẩu tạm thời:/)).toBeInTheDocument()
  })

  it("renders the trainer roster template and creates a PT profile", async () => {
    renderWithRole("admin", "trainers")

    expect(await screen.findByText("Quản lý huấn luyện viên")).toBeInTheDocument()
    expect(screen.getByText("Danh sách PT")).toBeInTheDocument()
    expect((await screen.findAllByText("Coach PT")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Thêm PT" }))
    fireEvent.change(screen.getByTestId("trainer-create-name"), {
      target: { value: "Template Trainer Component" },
    })
    fireEvent.change(screen.getByTestId("trainer-create-specialty"), {
      target: { value: "Corrective Strength" },
    })
    fireEvent.click(screen.getByTestId("trainer-create-submit"))

    expect(await screen.findByText("Template Trainer Component")).toBeInTheDocument()
  })
})
