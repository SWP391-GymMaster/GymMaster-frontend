"use client"

import type { ReactNode } from "react"

import { RoleBadge } from "@/components/data/RoleBadge"
import { LogoutButton } from "@/features/auth/components/LogoutButton"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

export type WorkspaceShellMetric = {
  label: string
  value: string
  tone?: "dark" | "light"
}

type WorkspaceShellProps = {
  role: UserRole
  title: string
  description: string
  metrics?: WorkspaceShellMetric[]
  children?: ReactNode
}

export function WorkspaceShell({
  role,
  title,
  description,
  metrics = [],
  children,
}: WorkspaceShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),linear-gradient(135deg,#f8fafc,#ffffff_48%,#eef2ff)] px-5 py-6 text-zinc-950 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                GymMaster
              </span>
              <RoleBadge role={role} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
                {description}
              </p>
            </div>
          </div>
          <LogoutButton />
        </header>
        {metrics.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-3" aria-label="Workspace metrics">
            {metrics.map((metric) => {
              const isDark = metric.tone === "dark"

              return (
                <div
                  className={cn(
                    "rounded-[1.5rem] p-5 transition-[transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg",
                    isDark
                      ? "border border-zinc-200 bg-zinc-950 text-white shadow-xl"
                      : "border border-white/70 bg-white/80 text-zinc-950 shadow-sm",
                  )}
                  key={`${metric.label}-${metric.value}`}
                >
                  <p
                    className={cn(
                      "text-sm",
                      isDark ? "text-zinc-400" : "text-zinc-500",
                    )}
                  >
                    {metric.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                </div>
              )
            })}
          </section>
        ) : null}
        {children}
      </div>
    </main>
  )
}
