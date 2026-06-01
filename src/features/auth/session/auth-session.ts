"use client"

import { create } from "zustand"

import { login as loginRequest, logout as logoutRequest } from "@/features/auth/api/auth.api"
import { ApiClientError } from "@/lib/api/http-client"
import { getDashboardRoute, isUserRole } from "@/lib/auth/roles"
import type { AuthSession, LoginRequest, LoginSuccess } from "@/types/auth"

const storageKey = "gymmaster.auth.session"

type AuthSessionState = {
  session: AuthSession | null
  login: (request: LoginRequest) => Promise<string>
  logout: () => Promise<void>
  setSession: (session: AuthSession | null) => void
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage
}

function readStoredSession(): AuthSession | null {
  const storage = getBrowserStorage()

  if (!storage) {
    return null
  }

  const raw = storage.getItem(storageKey)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    storage.removeItem(storageKey)
    return null
  }
}

function persistSession(session: AuthSession | null) {
  const storage = getBrowserStorage()

  if (!storage) {
    return
  }

  if (!session) {
    storage.removeItem(storageKey)
    return
  }

  storage.setItem(storageKey, JSON.stringify(session))
}

export function createSessionFromLogin(data: LoginSuccess): AuthSession {
  const role = data.role ?? data.user.role

  if (!role) {
    throw new ApiClientError({
      code: "MISSING_ROLE",
      message: "Missing authenticated role.",
    })
  }

  if (!isUserRole(role) || !isUserRole(data.user.role)) {
    throw new ApiClientError({
      code: "UNKNOWN_ROLE",
      message: "Unknown authenticated role.",
    })
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    user: {
      ...data.user,
      role,
    },
    role,
  }
}

export const useAuthSessionStore = create<AuthSessionState>((set, get) => ({
  session: readStoredSession(),
  setSession: (session) => {
    persistSession(session)
    set({ session })
  },
  login: async (request) => {
    const data = await loginRequest(request)
    const session = createSessionFromLogin(data)
    persistSession(session)
    set({ session })
    return getDashboardRoute(session.role)
  },
  logout: async () => {
    const token = get().session?.accessToken

    if (token) {
      try {
        await logoutRequest(token)
      } catch {
        // Logout must clear local state even when the network call fails.
      }
    }

    persistSession(null)
    set({ session: null })
  },
}))

export function resetAuthSessionForTest() {
  persistSession(null)
  useAuthSessionStore.setState({ session: null })
}
