import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { LoginForm } from "@/features/auth/components/LoginForm"
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
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.queryByText("Admin")).not.toBeInTheDocument()
    expect(screen.queryByText("Staff")).not.toBeInTheDocument()
    expect(screen.queryByText("PT")).not.toBeInTheDocument()
    expect(screen.queryByText("Member")).not.toBeInTheDocument()
  })

  it("redirects by authenticated backend role", async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "staff@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

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
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    expect(
      await screen.findByText("Email or password is incorrect."),
    ).toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })

  it("shows missing role error without role picker fallback", async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "missing-role@gymmaster.local" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    expect(
      await screen.findByText(
        "Your account is missing a valid role. Please contact support.",
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText("Admin")).not.toBeInTheDocument()
    expect(navigation.push).not.toHaveBeenCalled()
  })
})
