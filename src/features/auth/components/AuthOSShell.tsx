"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Dumbbell,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"

import { cn } from "@/lib/utils"

type AuthOSShellProps = {
  children: ReactNode
  title: string
  eyebrow?: string
  description?: string
  footer?: ReactNode
  className?: string
}

export function AuthOSShell({
  children,
  title,
  eyebrow = "GymMaster OS",
  description,
  footer,
  className,
}: AuthOSShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f9f9ff] px-4 py-8 text-[#191b23]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-[#d8e2ff]/70 blur-3xl" />
        <div className="absolute -bottom-40 -left-28 h-[28rem] w-[28rem] rounded-full bg-[#dee2f4]/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#c2c6d6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      <section
        className={cn(
          "relative z-10 w-full max-w-[480px] rounded-xl border border-[#e1e2ec] bg-white/90 p-6 shadow-[0_16px_60px_rgba(25,27,35,0.08)] backdrop-blur-xl md:p-10",
          className,
        )}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c2c6d6]/60 bg-[#f2f3fd] px-3 py-1.5 text-sm font-semibold text-[#0058be] transition hover:bg-[#d8e2ff] active:scale-[0.98]"
            href="/welcome"
          >
            <Dumbbell aria-hidden="true" className="size-4" />
            {eyebrow}
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-[#191b23] md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-sm text-base leading-7 text-[#424754]">
              {description}
            </p>
          ) : null}
        </div>

        {children}

        {footer ? (
          <div className="mt-6 text-center text-sm text-[#424754]">{footer}</div>
        ) : null}
      </section>
    </main>
  )
}

export function AuthTextLink({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) {
  return (
    <Link
      className="font-semibold text-[#0058be] transition hover:text-[#004395] hover:underline"
      href={href}
    >
      {children}
    </Link>
  )
}

export function AuthStateCard({
  action,
  description,
  title,
  type,
}: {
  action?: ReactNode
  description: string
  title: string
  type: "error" | "loading" | "session"
}) {
  const icon =
    type === "loading" ? (
      <Loader2 aria-hidden="true" className="size-8 animate-spin text-[#0058be]" />
    ) : type === "session" ? (
      <LockKeyhole aria-hidden="true" className="size-8 text-[#424754]" />
    ) : (
      <AlertTriangle aria-hidden="true" className="size-8 text-[#ba1a1a]" />
    )
  const iconClass =
    type === "error" ? "bg-[#ffdad6]" : "bg-[#e6e7f2] ring-4 ring-white"

  return (
    <div className="flex flex-col items-center text-center">
      <div className={cn("mb-6 flex size-16 items-center justify-center rounded-full", iconClass)}>
        {icon}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#191b23]">
        {title}
      </h1>
      <p className="mt-3 max-w-sm text-base leading-7 text-[#424754]">
        {description}
      </p>
      {action ? <div className="mt-8 w-full">{action}</div> : null}
    </div>
  )
}

export function AuthSecurityBadge() {
  return (
    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c2c6d6]/50 bg-[#f2f3fd] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#424754]">
      <ShieldCheck aria-hidden="true" className="size-3.5 text-[#0058be]" />
      Secure role-aware access
    </div>
  )
}

export function BackToLoginLink() {
  return (
    <Link
      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#595e6d] transition hover:text-[#0058be]"
      href="/login"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Back to login
    </Link>
  )
}
