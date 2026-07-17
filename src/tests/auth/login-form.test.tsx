import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { LoginForm } from "@/features/auth/components/LoginForm"
import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton"
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

describe("LoginForm", () => {
  it("renders email/password login without role picker", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument()
    expect(screen.queryByText("Quản trị")).not.toBeInTheDocument()
    expect(screen.queryByText("Lễ tân")).not.toBeInTheDocument()
    expect(screen.queryByText("PT")).not.toBeInTheDocument()
    expect(screen.queryByText("Hội viên")).not.toBeInTheDocument()
    expect(
      document.querySelector('script[src="https://accounts.google.com/gsi/client"]'),
    ).not.toBeInTheDocument()
  })

  it("redirects by authenticated backend role", async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "staff@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }))

    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith("/staff/dashboard")
    })

    expect(useAuthSessionStore.getState().session?.role).toBe("staff")
  })

  it("shows a safe error for invalid credentials", async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "unknown@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "wrong" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }))

    expect(
      await screen.findByText("Email hoặc mật khẩu không đúng."),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("shows locked account and rate-limit backend errors", async () => {
    const { rerender } = render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "locked@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }))

    expect(
      await screen.findByText(
        "Tài khoản này đã bị khóa. Vui lòng liên hệ nhân viên phòng gym.",
      ),
    ).toBeInTheDocument()

    rerender(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "too-many@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }))

    expect(
      await screen.findByText(
        "Bạn thử quá nhiều lần. Vui lòng chờ trước khi thử lại.",
      ),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("shows missing role error without role picker fallback", async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "missing-role@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }))

    expect(
      await screen.findByText(
        "Tài khoản chưa có vai trò hợp lệ. Vui lòng liên hệ hỗ trợ.",
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText("Quản trị")).not.toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("signs in with Google through backend role redirect in mock mode", async () => {
    render(<LoginForm />)

    fireEvent.click(screen.getByTestId("google-login-button"))

    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith("/member/dashboard")
    })

    expect(useAuthSessionStore.getState().session?.role).toBe("member")
    expect(screen.queryByText("Quản trị")).not.toBeInTheDocument()
  })

  it("surfaces Google config and token backend errors", async () => {
    const onError = vi.fn()
    const { rerender } = render(
      <GoogleLoginButton idToken="google-not-configured" onError={onError} />,
    )

    fireEvent.click(screen.getByTestId("google-login-button"))

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "Đăng nhập Google chưa được cấu hình cho môi trường này.",
      )
    })

    rerender(
      <GoogleLoginButton idToken="invalid-google-token" onError={onError} />,
    )
    fireEvent.click(screen.getByTestId("google-login-button"))

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.",
      )
    })
    expect(navigation.push).not.toHaveBeenCalled()
  })
})
