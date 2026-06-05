"use client"

import Link from "next/link"
import { LogIn, ShieldAlert } from "lucide-react"
import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { PermissionDenied } from "@/components/feedback/PermissionDenied"
import { getDashboardRoute } from "@/lib/auth/roles"
import type { UserRole } from "@/types/auth"
import {
  isAuthSessionExpired,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"

/**
 * Neutral skeleton shown for exactly ONE render cycle while the client
 * mounts and Zustand rehydrates the session from localStorage.
 * Matches the general workspace bento grid shape so there is no jarring
 * "auth error" visual between navigation and content paint.
 */
function GuardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="grid gap-5 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[140px] rounded-[1.5rem] bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-[340px] rounded-[1.5rem] bg-muted" />
        <div className="h-[340px] rounded-[1.5rem] bg-muted" />
      </div>
    </div>
  )
}

type PermissionGuardProps = {
  allowedRoles: UserRole[]
  children: ReactNode
}

type GuardStatus = "idle" | "refreshing" | "expired"

function SessionExpiredState() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-xl border border-border bg-card p-8 shadow-[0_16px_60px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldAlert aria-hidden="true" className="size-8 text-primary" />
        </div>
        <div className="mb-3 inline-flex rounded-full border border-border bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
          Hết phiên đăng nhập
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Phiên đăng nhập đã hết hạn.
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Vui lòng đăng nhập lại để tiếp tục workspace GymMaster.
        </p>
      </div>
      <Link
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
        href="/login"
      >
        <LogIn aria-hidden="true" className="size-4" />
        Đăng nhập lại
      </Link>
    </section>
  )
}

export function PermissionGuard({
  allowedRoles,
  children,
}: PermissionGuardProps) {
  const [mounted, setMounted] = useState(false)
  const [guardStatus, setGuardStatus] = useState<GuardStatus>("idle")
  const refreshAttemptedTokenRef = useRef<string | null>(null)
  const session = useAuthSessionStore((state) => state.session)
  const ensureFreshSession = useAuthSessionStore(
    (state) => state.ensureFreshSession,
  )
  const hasExpiredSession = Boolean(session && isAuthSessionExpired(session))

  useLayoutEffect(() => {
    // Standard client-mount detection idiom — must run synchronously to
    // prevent a layout flash from showing the skeleton on re-renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (
      !mounted ||
      !session?.refreshToken ||
      !hasExpiredSession ||
      guardStatus === "expired" ||
      refreshAttemptedTokenRef.current === session.refreshToken
    ) {
      return
    }

    refreshAttemptedTokenRef.current = session.refreshToken

    queueMicrotask(() => {
      setGuardStatus("refreshing")
    })

    ensureFreshSession()
      .then(() => {
        refreshAttemptedTokenRef.current = null
        setGuardStatus("idle")
      })
      .catch(() => {
        setGuardStatus("expired")
      })
  }, [ensureFreshSession, guardStatus, hasExpiredSession, mounted, session])

  // ── Phase 1: Not yet mounted ─────────────────────────────────────
  // Show a neutral skeleton for one render cycle while React commits
  // the DOM and Zustand rehydrates the session from localStorage.
  // Never show an auth error during this transient phase.
  if (!mounted) {
    return <GuardSkeleton />
  }

  if (guardStatus === "expired") {
    return <SessionExpiredState />
  }

  if (guardStatus === "refreshing" || hasExpiredSession) {
    return <GuardSkeleton />
  }

  // ── Phase 2: Mounted, no session ─────────────────────────────────
  // Zustand has hydrated — no valid session in localStorage.
  if (!session) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="rounded-xl border border-border bg-card p-8 shadow-[0_16px_60px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldAlert aria-hidden="true" className="size-8 text-primary" />
          </div>
          <div className="mb-3 inline-flex rounded-full border border-border bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
            Cần đăng nhập
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Vui lòng đăng nhập để tiếp tục.
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Workspace GymMaster chỉ mở sau khi xác thực tài khoản.
          </p>
        </div>
        <Link
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
          href="/login"
        >
          <LogIn aria-hidden="true" className="size-4" />
          Đến trang đăng nhập
        </Link>
      </section>
    )
  }

  // ── Phase 3: Mounted, session exists, wrong role ──────────────────
  if (!allowedRoles.includes(session.role)) {
    return <PermissionDenied dashboardPath={getDashboardRoute(session.role)} />
  }

  // ── Phase 4: All checks pass — render the protected content ───────
  return children
}
