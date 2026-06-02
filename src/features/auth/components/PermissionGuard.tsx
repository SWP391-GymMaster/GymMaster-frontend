"use client"

import Link from "next/link"
import { LogIn, ShieldAlert } from "lucide-react"
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
      <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="rounded-xl border border-[#e1e2ec] bg-white/90 p-8 shadow-[0_16px_60px_rgba(25,27,35,0.08)]">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#e6e7f2]">
            <ShieldAlert aria-hidden="true" className="size-8 text-[#0058be]" />
          </div>
          <div className="mb-3 inline-flex rounded-full border border-[#c2c6d6]/60 bg-[#f2f3fd] px-3 py-1 text-sm font-semibold text-[#595e6d]">
            Sign in required
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#191b23]">
            Please sign in to continue.
          </h1>
          <p className="mt-3 text-base leading-7 text-[#424754]">
            GymMaster workspaces are available after authentication.
          </p>
        </div>
        <Link
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0058be] px-5 text-sm font-semibold text-white transition hover:bg-[#2170e4] active:scale-[0.98]"
          href="/login"
        >
          <LogIn aria-hidden="true" className="size-4" />
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
