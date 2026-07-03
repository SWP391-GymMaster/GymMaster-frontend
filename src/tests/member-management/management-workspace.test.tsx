import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AppProviders } from "@/app/providers"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"

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

afterEach(() => {
  vi.restoreAllMocks()
})

describe("ManagementWorkspace", () => {
  it("renders member management records from backend contract", async () => {
    renderWithRole("staff")

    expect((await screen.findAllByText("Nguyen Minh Anh")).length).toBeGreaterThan(0)
    expect(screen.getAllByText("GM-101").length).toBeGreaterThan(0)
    expect(screen.getByTestId("management-search-input")).toBeInTheDocument()
  })

  it("shows member avatar and personal profile fields in the member door", async () => {
    renderWithRole("staff")

    expect((await screen.findAllByText("Nguyen Minh Anh")).length).toBeGreaterThan(0)
    expect(screen.getByTestId("member-profile-avatar")).toHaveStyle({
      backgroundImage: "url(https://cdn.gymmaster.local/avatars/member_101.webp)",
    })
    expect(screen.getByText("12 Nguyen Trai, Quan 1")).toBeInTheDocument()
    expect(screen.getByText("Me - 0909009000")).toBeInTheDocument()
    expect(screen.getAllByText("20/03/1998").length).toBeGreaterThan(0)
  })

  it("lets admin soft-delete a member from the list", async () => {
    renderWithRole("admin")

    expect(await screen.findByText("Tran Bao Long")).toBeInTheDocument()
    const deleteButtons = await screen.findAllByTestId("member-delete-button")
    fireEvent.click(deleteButtons[1])

    await waitFor(() => {
      expect(screen.queryByText("Tran Bao Long")).not.toBeInTheDocument()
    })
  })

  it("renders the staff template with access control and create feedback", async () => {
    renderWithRole("admin", "staff")

    expect((await screen.findAllByText("Front Desk Staff")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("user-create-open"))
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
    expect(await screen.findByText(/Mat khau tam thoi:|Máº­t kháº©u táº¡m thá»i:/)).toBeInTheDocument()
  })

  it("lets admin edit, lock, reset, and delete staff from the staff door", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
    renderWithRole("admin", "staff")

    expect((await screen.findAllByText("Front Desk Staff")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Sua" }))
    fireEvent.change(screen.getByLabelText("Dia chi"), {
      target: { value: "99 Pasteur, Quan 1" },
    })
    fireEvent.change(screen.getByLabelText("Lien he khan cap"), {
      target: { value: "Ba - 0905555666" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Luu" }))

    expect(await screen.findByText("99 Pasteur, Quan 1")).toBeInTheDocument()
    expect(screen.getByText("Ba - 0905555666")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Khoa" }))
    expect(await screen.findByRole("button", { name: "Mo khoa" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Dat lai mat khau" }))
    expect(await screen.findByText(/Mat khau tam thoi:/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Xoa" }))
    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.queryAllByText("Front Desk Staff")).toHaveLength(0)
    })
  })

  it("renders the trainer roster template and creates a PT profile", async () => {
    renderWithRole("admin", "trainers")

    expect((await screen.findAllByText("Coach PT")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Them PT" }))
    fireEvent.change(screen.getByTestId("trainer-create-name"), {
      target: { value: "Template Trainer Component" },
    })
    fireEvent.change(screen.getByTestId("trainer-create-email"), {
      target: { value: "template-trainer-component@gymmaster.local" },
    })
    fireEvent.change(screen.getByTestId("trainer-create-specialty"), {
      target: { value: "Corrective Strength" },
    })
    fireEvent.click(screen.getByTestId("trainer-create-submit"))

    expect(await screen.findByText("Da tao tai khoan PT")).toBeInTheDocument()
    expect(await screen.findByText(/Mat khau tam thoi:/)).toBeInTheDocument()
  })

  it("lets admin edit trainer profile, reset password, and lock the trainer account", async () => {
    renderWithRole("admin", "trainers")

    expect((await screen.findAllByText("Coach PT")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId("trainer-edit-open"))
    fireEvent.change(screen.getByTestId("trainer-edit-specialty"), {
      target: { value: "Power Mobility" },
    })
    fireEvent.click(screen.getByTestId("trainer-edit-submit"))

    expect((await screen.findAllByText("Power Mobility")).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Dat lai mat khau" }))
    expect(await screen.findByText(/Mat khau tam thoi:/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Khoa" }))
    expect(await screen.findByRole("button", { name: "Mo khoa" })).toBeInTheDocument()
  })
})
