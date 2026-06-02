"use client"

import type { ReactNode } from "react"

import { CommandRail, MobileCommandHeader } from "@/components/layout/CommandRail"
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
    <main className="min-h-screen bg-[#f9f9ff] text-[#191b23]">
      <CommandRail role={role} />
      <MobileCommandHeader role={role} />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.14),transparent_32%),linear-gradient(135deg,#f9f9ff,#ffffff_48%,#ecedf7)] px-4 py-5 md:px-8 lg:ml-[280px] lg:px-10 lg:py-8">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
          <header className="rounded-xl border border-[#e1e2ec] bg-white/85 p-5 shadow-[0_16px_60px_rgba(25,27,35,0.08)] backdrop-blur">
            <div className="space-y-2">
              <div className="inline-flex rounded-full border border-[#c2c6d6]/60 bg-[#f2f3fd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#0058be]">
                {role} workspace
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-[#424754]">
                  {description}
                </p>
              </div>
            </div>
          </header>
          {metrics.length > 0 ? (
            <section className="grid gap-4 md:grid-cols-3" aria-label="Workspace metrics">
              {metrics.map((metric) => {
                const isDark = metric.tone === "dark"

                return (
                  <div
                    className={cn(
                      "rounded-xl p-5 transition-[transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg",
                      isDark
                        ? "border border-white/10 bg-[#191b23] text-white shadow-xl"
                        : "border border-[#e1e2ec] bg-white/85 text-[#191b23] shadow-sm",
                    )}
                    key={`${metric.label}-${metric.value}`}
                  >
                    <p
                      className={cn(
                        "text-sm",
                        isDark ? "text-[#c2c6d8]" : "text-[#424754]",
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
      </div>
    </main>
  )
}
