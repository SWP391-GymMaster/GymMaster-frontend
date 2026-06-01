import { render } from "@testing-library/react"
import type { ReactElement } from "react"

import { AppProviders } from "@/app/providers"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

export function setAdminSessionForTest() {
  useAuthSessionStore.getState().setSession({
    accessToken: "access-admin",
    refreshToken: "refresh-admin",
    expiresAt: "2026-12-31T23:59:59.000Z",
    role: "admin",
    user: {
      userId: 1,
      email: "admin@gymmaster.local",
      fullName: "Admin User",
      role: "admin",
      status: "active",
    },
  })
}

export function renderWithAdminSession(element: ReactElement) {
  resetAuthSessionForTest()
  setAdminSessionForTest()

  return render(<AppProviders>{element}</AppProviders>)
}
