import { act, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider"
import { MemberSelfProfilePage } from "@/features/member-360/components/MemberSelfProfilePage"
import { PWA_INSTALL_DISMISSAL_KEY } from "@/lib/pwa/constants"

vi.mock("@/features/auth/components/PermissionGuard", () => ({
  PermissionGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/layout/WorkspaceShell", () => ({
  WorkspaceShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/features/auth/session/auth-session", () => ({
  useAuthSessionStore: (
    selector: (state: { session: { user: { memberProfileId: number } } }) => unknown,
  ) => selector({ session: { user: { memberProfileId: 101 } } }),
}))

vi.mock("@/features/member-360/api/member-360.queries", () => ({
  useMember360Data: () => ({
    data: undefined,
    error: null,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("@/features/member-360/components/MemberSocialProfile", () => ({
  MemberSocialProfile: () => <div>Member profile content</div>,
}))

describe("MemberSelfProfilePage PWA integration", () => {
  beforeEach(() => {
    window.localStorage.removeItem(PWA_INSTALL_DISMISSAL_KEY)
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })
  })

  it("surfaces the shared install action on an eligible member profile", async () => {
    render(
      <PwaInstallProvider>
        <MemberSelfProfilePage />
      </PwaInstallProvider>,
    )

    act(() => {
      window.dispatchEvent(new Event("beforeinstallprompt", { cancelable: true }))
    })

    expect(await screen.findByText("Cài ứng dụng để mở nhanh hơn")).toBeInTheDocument()
    expect(screen.getByText("Member profile content")).toBeInTheDocument()
  })
})
