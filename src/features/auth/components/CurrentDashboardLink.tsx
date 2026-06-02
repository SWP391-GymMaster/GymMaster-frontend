"use client"

import Link from "next/link"

import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { getDashboardRoute } from "@/lib/auth/roles"

export function CurrentDashboardLink() {
  const session = useAuthSessionStore((state) => state.session)

  if (!session) {
    return null
  }

  return (
    <Link
      className="font-semibold text-primary transition hover:text-primary hover:underline"
      href={getDashboardRoute(session.role)}
    >
      Về trang chính
    </Link>
  )
}
