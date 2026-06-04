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
import { gymMasterAssets } from "@/lib/gymmaster-assets"

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
    <main
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground"
      style={{
        backgroundImage: `linear-gradient(115deg, color-mix(in oklch, var(--background) 94%, transparent), color-mix(in oklch, var(--background) 75%, transparent) 55%, color-mix(in oklch, var(--background) 35%, transparent)), url(${gymMasterAssets.operationsCover})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <section
        className={cn(
          "relative z-10 w-full max-w-[480px] rounded-[2rem] border border-border bg-card/75 p-6 shadow-2xl backdrop-blur-xl md:p-10 text-foreground",
          className,
        )}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10 active:scale-[0.98]"
            href="/welcome"
          >
            <Dumbbell aria-hidden="true" className="size-4" />
            {eyebrow}
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {children}

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </section>
    </main>
  );
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
      className="font-semibold text-primary transition hover:text-primary hover:underline"
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
      <Loader2 aria-hidden="true" className="size-8 animate-spin text-primary" />
    ) : type === "session" ? (
      <LockKeyhole aria-hidden="true" className="size-8 text-muted-foreground" />
    ) : (
      <AlertTriangle aria-hidden="true" className="size-8 text-[var(--status-failed-text)]" />
    )
  const iconClass =
    type === "error"
      ? "bg-[var(--status-failed-bg)] border border-[var(--status-failed-border)]"
      : "bg-muted border border-border"

  return (
    <div className="flex flex-col items-center text-center">
      <div className={cn("mb-6 flex size-16 items-center justify-center rounded-2xl", iconClass)}>
        {icon}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-8 w-full">{action}</div> : null}
    </div>
  )
}

export function AuthSecurityBadge() {
  return (
    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      <ShieldCheck aria-hidden="true" className="size-3.5 text-primary" />
      Truy cập an toàn theo vai trò
    </div>
  )
}

export function BackToLoginLink() {
  return (
    <Link
      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
      href="/login"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Quay lại đăng nhập
    </Link>
  )
}
