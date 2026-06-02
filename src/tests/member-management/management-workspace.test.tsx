import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AppProviders } from "@/app/providers"
import { ManagementWorkspace } from "@/features/member-management/components/ManagementWorkspace"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

function renderWithRole(role: "admin" | "staff") {
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
        mode="members"
      />
    </AppProviders>,
  )
}

describe("ManagementWorkspace", () => {
  it("renders member management records from backend contract", async () => {
    renderWithRole("staff")

    expect(await screen.findByText("Nguyen Minh Anh")).toBeInTheDocument()
    expect(screen.getByText("GM-101")).toBeInTheDocument()
    expect(screen.getByTestId("staff-member-search-input")).toBeInTheDocument()
  })

  it("creates a member profile for staff workflows", async () => {
    renderWithRole("staff")

    fireEvent.change(screen.getByTestId("member-create-name"), {
      target: { value: "Deadline Member" },
    })
    fireEvent.change(screen.getByTestId("member-create-email"), {
      target: { value: "deadline-member@gymmaster.local" },
    })
    fireEvent.change(screen.getByTestId("member-create-phone"), {
      target: { value: "0900000888" },
    })
    fireEvent.click(screen.getByTestId("member-create-submit"))

    expect(await screen.findByText("Deadline Member")).toBeInTheDocument()
  })

  it("lets admin soft-delete a member from the list", async () => {
    renderWithRole("admin")

    expect(await screen.findByText("Tran Bao Long")).toBeInTheDocument()
    const deleteButtons = await screen.findAllByRole("button", { name: /delete/i })
    fireEvent.click(deleteButtons[1])

    await waitFor(() => {
      expect(screen.queryByText("Tran Bao Long")).not.toBeInTheDocument()
    })
  })
})
