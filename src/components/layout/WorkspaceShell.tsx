"use client"

import type { ReactNode } from "react"
import { Bell, Command, Search } from "lucide-react"

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
  const roleBadges: Record<UserRole, string> = {
    admin: "ADMIN",
    staff: "STAFF",
    pt: "PT",
    member: "MEMBER",
  }

  const userLabels: Record<UserRole, string> = {
    admin: "Admin User",
    staff: "Staff User",
    pt: "PT User",
    member: "Member User",
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <CommandRail role={role} />
      <MobileCommandHeader role={role} />

      <div className="min-h-screen bg-[linear-gradient(135deg,hsl(var(--muted)/0.55),hsl(var(--background))_42%,hsl(var(--muted)/0.35))] lg:ml-[280px]">
        <header className="sticky top-0 z-20 hidden min-h-[72px] items-center justify-between gap-6 border-b border-border/70 bg-background/85 px-8 backdrop-blur-xl lg:flex">
          <div className="relative w-full max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="h-11 w-full rounded-lg border border-border bg-muted/40 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
              placeholder="Tìm hội viên, hóa đơn..."
              type="search"
            />
          </div>

          <div className="flex items-center gap-5">
            <button
              className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
              type="button"
            >
              <Bell aria-hidden="true" className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
              <span className="sr-only">Thông báo</span>
            </button>

            <button
              className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
              type="button"
            >
              <Command aria-hidden="true" className="size-5" />
              <span className="sr-only">Command menu</span>
            </button>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{userLabels[role]}</p>
                <span className="mt-1 inline-flex rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {roleBadges[role]}
                </span>
              </div>
              <div className="size-10 rounded-full border-2 border-primary bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.45),hsl(var(--foreground)))] shadow-sm" />
            </div>
          </div>
        </header>

        <div className="px-4 py-5 md:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
            <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
                  {description}
                </p>
              </div>
            </section>

            {metrics.length > 0 ? (
              <section
                aria-label="Workspace metrics"
                className="grid gap-4 md:grid-cols-3"
              >
                {metrics.map((metric) => {
                  const isDark = metric.tone === "dark"

                  return (
                    <div
                      className={cn(
                        "rounded-2xl p-5 transition-[transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg",
                        isDark
                          ? "border border-white/10 bg-foreground text-background shadow-xl"
                          : "border border-border bg-card text-card-foreground shadow-sm",
                      )}
                      key={`${metric.label}-${metric.value}`}
                    >
                      <p
                        className={cn(
                          "text-sm",
                          isDark ? "text-background/70" : "text-muted-foreground",
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
      </div>
    </main>
  )
}
