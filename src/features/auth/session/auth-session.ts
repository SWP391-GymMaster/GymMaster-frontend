"use client"

import { create } from "zustand"

import {
  login as loginRequest,
  loginWithGoogle as googleLoginRequest,
  logout as logoutRequest,
  refreshSession,
  registerMember,
} from "@/features/auth/api/auth.api"
import { ApiClientError } from "@/lib/api/http-client"
import { getDashboardRoute, isUserRole } from "@/lib/auth/roles"
import type {
  AuthSession,
  GoogleLoginRequest,
  LoginRequest,
  LoginSuccess,
  RegisterRequest,
} from "@/types/auth"

const storageKey = "gymmaster.auth.session"

type AuthSessionState = {
  session: AuthSession | null
  ensureFreshSession: () => Promise<AuthSession | null>
  login: (request: LoginRequest) => Promise<string>
  loginWithGoogle: (request: GoogleLoginRequest) => Promise<string>
  signup: (request: RegisterRequest) => Promise<string>
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
      message: "Thiếu vai trò sau khi xác thực.",
    })
  }

  if (!isUserRole(role) || !isUserRole(data.user.role)) {
    throw new ApiClientError({
      code: "UNKNOWN_ROLE",
      message: "Vai trò sau khi xác thực không hợp lệ.",
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

export function isAuthSessionExpired(session: AuthSession | null): boolean {
  if (!session) {
    return true
  }

  if (!session.expiresAt) {
    return true
  }

  return Date.parse(session.expiresAt) <= Date.now()
}

export const useAuthSessionStore = create<AuthSessionState>((set, get) => ({
  session: readStoredSession(),
  setSession: (session) => {
    persistSession(session)
    set({ session })
  },
  ensureFreshSession: async () => {
    const session = get().session

    if (!session) {
      return null
    }

    if (!isAuthSessionExpired(session)) {
      return session
    }

    try {
      const data = await refreshSession(session.refreshToken)
      const refreshedSession = createSessionFromLogin(data)

      persistSession(refreshedSession)
      set({ session: refreshedSession })

      return refreshedSession
    } catch (error) {
      persistSession(null)
      set({ session: null })
      throw error
    }
  },
  login: async (request) => {
    const data = await loginRequest(request)
    const session = createSessionFromLogin(data)
    persistSession(session)
    set({ session })
    return getDashboardRoute(session.role)
  },
  loginWithGoogle: async (request) => {
    const data = await googleLoginRequest(request)
    const session = createSessionFromLogin(data)
    persistSession(session)
    set({ session })
    return getDashboardRoute(session.role)
  },
  signup: async (request) => {
    const data = await registerMember(request)
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
