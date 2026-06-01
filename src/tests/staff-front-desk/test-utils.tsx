import { render } from "@testing-library/react"
import type { ReactElement } from "react"

import { AppProviders } from "@/app/providers"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

export function setStaffSessionForTest() {
  useAuthSessionStore.getState().setSession({
    accessToken: "access-staff",
    refreshToken: "refresh-staff",
    expiresAt: "2026-06-01T12:00:00.000Z",
    role: "staff",
    user: {
      userId: 2,
      email: "staff@gymmaster.local",
      fullName: "Front Desk Staff",
      role: "staff",
      status: "active",
    },
  })
}

export function renderWithStaffSession(element: ReactElement) {
  resetAuthSessionForTest()
  setStaffSessionForTest()

  return render(<AppProviders>{element}</AppProviders>)
}
