import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
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

async function tickSeconds(seconds: number) {
  for (let index = 0; index < seconds; index += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000)
    })
  }
}

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
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu"), {
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
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu"), {
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
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu"), {
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

  it("chan dang ky khi mat khau nhap lai khong khop", async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText("Họ tên"), {
      target: { value: "Mismatch Member" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "mismatch@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu"), {
      target: { value: "Password456!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /tạo tài khoản hội viên/i }),
    )

    expect(
      await screen.findByText("Mật khẩu nhập lại không khớp."),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("chan dang ky khi so dien thoai sai dinh dang", async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText("Họ tên"), {
      target: { value: "Bad Phone" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bad-phone@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText(/Số điện thoại/), {
      target: { value: "12345" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /tạo tài khoản hội viên/i }),
    )

    expect(
      await screen.findByText(
        "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).",
      ),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("chap nhan so dien thoai dang +84 va co dau cach", async () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText("Họ tên"), {
      target: { value: "Plus84 Member" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "plus84@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText(/Số điện thoại/), {
      target: { value: "+84 912 345 678" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: /tạo tài khoản hội viên/i }),
    )

    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith("/member/dashboard")
    })
  })

  it("creates a forgot password reset request", async () => {
    render(<ForgotPasswordForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@gymmaster.local" },
    })
    fireEvent.click(screen.getByRole("button", { name: /gửi yêu cầu đặt lại/i }))

    // UX moi: gui thanh cong -> dieu huong sang trang dat lai mat khau (kem OTP).
    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith(
        expect.stringContaining("/reset-password?"),
      )
    })
    expect(navigation.push).toHaveBeenCalledWith(
      expect.stringContaining("token=123456"),
    )
  })

  it("khoa nut gui lai ma 60s, het dem nguoc thi gui lai duoc va dem lai tu dau", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })

    try {
      render(<ResetPasswordForm email="member@gymmaster.local" />)

      const resendButton = screen.getByTestId("reset-resend-button")
      expect(resendButton).toBeDisabled()
      expect(resendButton).toHaveTextContent("Gửi lại mã sau 60s")

      // Dem nguoc dung setTimeout day chuyen: moi giay phai re-render xong
      // moi len lich giay tiep theo -> phai tick tung giay mot.
      await tickSeconds(59)
      expect(resendButton).toHaveTextContent("Gửi lại mã sau 1s")
      expect(resendButton).toBeDisabled()

      await tickSeconds(1)
      expect(resendButton).toHaveTextContent("Gửi lại mã")
      expect(resendButton).toBeEnabled()

      // Bam gui lai -> goi API, dien san OTP (mock tra 123456) va dem nguoc chay lai.
      await act(async () => {
        fireEvent.click(resendButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId("reset-token-input")).toHaveValue("123456")
      })
      expect(resendButton).toHaveTextContent("Gửi lại mã sau 60s")
      expect(resendButton).toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })

  it("resets password with a valid OTP", async () => {
    render(<ResetPasswordForm email="member@gymmaster.local" resetToken="123456" />)

    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đặt lại mật khẩu/i }))

    expect(
      await screen.findByText("Đã đặt lại mật khẩu. Bạn có thể đăng nhập ngay."),
    ).toBeInTheDocument()
  })

  it("shows invalid OTP errors", async () => {
    render(<ResetPasswordForm email="member@gymmaster.local" resetToken="000000" />)

    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
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
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
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
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
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
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
      target: { value: "NewPassword123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }))

    expect(
      await screen.findByText("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),
    ).toBeInTheDocument()
  })
})
