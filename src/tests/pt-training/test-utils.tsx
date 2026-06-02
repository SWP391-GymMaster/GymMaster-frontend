import { render } from "@testing-library/react"
import type { ReactElement } from "react"

import { AppProviders } from "@/app/providers"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

export function setPtSessionForTest() {
  useAuthSessionStore.getState().setSession({
    accessToken: "access-pt",
    refreshToken: "refresh-pt",
    expiresAt: "2026-06-02T12:00:00.000Z",
    role: "pt",
    user: {
      userId: 3,
      email: "pt@gymmaster.local",
      fullName: "Coach PT",
      role: "pt",
      status: "active",
    },
  })
}

export function renderWithPtSession(element: ReactElement) {
  resetAuthSessionForTest()
  setPtSessionForTest()

  return render(<AppProviders>{element}</AppProviders>)
}
