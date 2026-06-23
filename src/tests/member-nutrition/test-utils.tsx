import { render } from "@testing-library/react"
import type { ReactElement } from "react"

import { AppProviders } from "@/app/providers"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

export function setMemberSessionForTest() {
  useAuthSessionStore.getState().setSession({
    accessToken: "access-member",
    refreshToken: "refresh-member",
    expiresAt: "2026-06-02T12:00:00.000Z",
    role: "member",
    user: {
      userId: 4,
      email: "member@gymmaster.local",
      fullName: "Gym Member",
      role: "member",
      status: "active",
      memberProfileId: 101,
    },
  })
}

export function renderWithMemberSession(element: ReactElement) {
  resetAuthSessionForTest()
  setMemberSessionForTest()

  return render(<AppProviders>{element}</AppProviders>)
}
