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

    fireEvent.change(screen.getByLabelText("Họ tên"), {
      target: { value: "New Member" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new-member@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /tạo tài khoản hội viên/i }),
    )

    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith("/member/dashboard")
    })
    expect(useAuthSessionStore.getState().session?.role).toBe("member")
    expect(screen.queryByText("Quản trị")).not.toBeInTheDocument()
    expect(screen.queryByText("Lễ tân")).not.toBeInTheDocument()
  })

  it("shows duplicate email error on signup", async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText("Họ tên"), {
      target: { value: "Existing Member" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /tạo tài khoản hội viên/i }),
    )

    expect(
      await screen.findByText("Email này đã được đăng ký."),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("shows duplicate phone error on signup", async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText("Họ tên"), {
      target: { value: "Existing Phone" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new-phone@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText(/Số điện thoại/), {
      target: { value: "0900000000" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /tạo tài khoản hội viên/i }),
    )

    expect(
      await screen.findByText("Số điện thoại này đã được đăng ký."),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("creates a forgot password reset request", async () => {
    render(<ForgotPasswordForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: /gửi yêu cầu đặt lại/i }))

    expect(
      await screen.findByText(
        "Nếu email tồn tại, yêu cầu đặt lại mật khẩu đã được tạo.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/mock-reset-token/)).toBeInTheDocument()
  })

  it("resets password with a valid reset token", async () => {
    render(<ResetPasswordForm resetToken="mock-reset-token" />)

    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đặt lại mật khẩu/i }))

    expect(
      await screen.findByText("Đã đặt lại mật khẩu. Bạn có thể đăng nhập ngay."),
    ).toBeInTheDocument()
  })

  it("shows invalid reset token errors", async () => {
    render(<ResetPasswordForm resetToken="expired-reset-token" />)

    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đặt lại mật khẩu/i }))

    expect(
      await screen.findByText(
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
      ),
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

    fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), {
      target: { value: "wrong" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }))

    expect(
      await screen.findByText("Mật khẩu hiện tại không đúng."),
    ).toBeInTheDocument()
  })

  it("changes password with a valid authenticated session", async () => {
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

    fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), {
      target: { value: "Password123!" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }))

    expect(await screen.findByText("Đã đổi mật khẩu.")).toBeInTheDocument()
  })

  it("requires an active session before changing password", async () => {
    render(<ChangePasswordForm />)

    fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), {
      target: { value: "Password123!" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }))

    expect(
      await screen.findByText("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),
    ).toBeInTheDocument()
  })
})
