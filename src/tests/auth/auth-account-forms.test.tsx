import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm"
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm"
import { SignupForm } from "@/features/auth/components/SignupForm"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}))

afterEach(() => {
  navigation.push.mockClear()
  resetAuthSessionForTest()
})

describe("auth account forms", () => {
  it("creates a member account without role selection", async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "New Member" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new-member@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /create member account/i }),
    )

    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith("/member/dashboard")
    })
    expect(useAuthSessionStore.getState().session?.role).toBe("member")
    expect(screen.queryByText("Admin")).not.toBeInTheDocument()
    expect(screen.queryByText("Staff")).not.toBeInTheDocument()
  })

  it("shows duplicate email error on signup", async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Existing Member" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /create member account/i }),
    )

    expect(
      await screen.findByText("This email is already registered."),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("creates a forgot password reset request", async () => {
    render(<ForgotPasswordForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: /send reset request/i }))

    expect(
      await screen.findByText(
        "If the email exists, a reset request has been created.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/mock-reset-token/)).toBeInTheDocument()
  })

  it("resets password with a valid reset token", async () => {
    render(<ResetPasswordForm resetToken="mock-reset-token" />)

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }))

    expect(
      await screen.findByText("Password reset successfully. You can sign in now."),
    ).toBeInTheDocument()
  })

  it("shows invalid current password when changing password", async () => {
    useAuthSessionStore.getState().setSession({
      accessToken: "access-member",
      refreshToken: "refresh-member",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      role: "member",
      user: {
        email: "member@gymmaster.local",
        fullName: "Gym Member",
        role: "member",
        status: "active",
        userId: 4,
      },
    })

    render(<ChangePasswordForm />)

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "wrong" },
    })
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /change password/i }))

    expect(
      await screen.findByText("Current password is incorrect."),
    ).toBeInTheDocument()
  })
})
