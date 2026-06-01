"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"

import { PermissionDenied } from "@/components/feedback/PermissionDenied"
import { getDashboardRoute } from "@/lib/auth/roles"
import type { UserRole } from "@/types/auth"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

type PermissionGuardProps = {
  allowedRoles: UserRole[]
  children: ReactNode
}

export function PermissionGuard({
  allowedRoles,
  children,
}: PermissionGuardProps) {
  const [mounted, setMounted] = useState(false)
  const session = useAuthSessionStore((state) => state.session)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  if (!mounted || !session) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-700">
          Sign in required
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Please sign in to continue.
          </h1>
          <p className="text-base leading-7 text-zinc-600">
            GymMaster workspaces are available after authentication.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.97]"
          href="/login"
        >
          Go to login
        </Link>
      </section>
    )
  }

  if (!allowedRoles.includes(session.role)) {
    return <PermissionDenied dashboardPath={getDashboardRoute(session.role)} />
  }

  return children
}
