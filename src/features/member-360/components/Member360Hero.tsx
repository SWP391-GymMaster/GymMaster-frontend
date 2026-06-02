"use client"

import { CalendarDays, Camera, Crown, Mail, Phone, User, VenusAndMars, Earth } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { cn } from "@/lib/utils"

type ViewContext = "pt" | "admin" | "staff" | "member"

type Member360HeroProps = {
  fullName: string
  memberCode: string
  email: string
  phone: string
  status: "active" | "pending" | "expired" | "locked"
  viewContext?: ViewContext
  isLoading?: boolean
  className?: string
}

const viewContextLabels: Record<ViewContext, string> = {
  pt: "Hội viên phụ trách",
  admin: "Hồ sơ hội viên",
  staff: "Hồ sơ hội viên",
  member: "Hồ sơ của tôi",
}

function toStatusPillStatus(
  status: Member360HeroProps["status"],
) {
  switch (status) {
    case "active":
      return "active" as const
    case "pending":
      return "pending" as const
    case "expired":
      return "expired" as const
    case "locked":
      return "locked" as const
  }
}

export function Member360Hero({
  fullName,
  memberCode,
  email,
  phone,
  status,
  viewContext = "admin",
  isLoading,
  className,
}: Member360HeroProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-6 shadow-sm",
          className,
        )}
      >
        <div className="flex flex-wrap gap-4">
          <div className="size-24 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-80 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <span className="flex size-28 items-center justify-center rounded-full border border-border bg-primary/10 text-primary shadow-sm">
              <User aria-hidden="true" className="size-11" />
            </span>
            <button
              className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition hover:bg-muted"
              type="button"
            >
              <Camera aria-hidden="true" className="size-4" />
              <span className="sr-only">Cập nhật ảnh đại diện</span>
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {fullName}
              </h2>
              <StatusPill status={toStatusPillStatus(status)} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Mã hội viên</span>
              <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
                {memberCode}
              </span>
              <span>·</span>
              <span>{viewContextLabels[viewContext]}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail aria-hidden="true" className="size-4" />
                {email || "Chưa cập nhật email"}
              </span>
              <span className="flex items-center gap-2">
                <Phone aria-hidden="true" className="size-4" />
                {phone || "Chưa cập nhật SĐT"}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" />
                Tham gia: 01/06/2024
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <HeroAttribute icon={Crown} label="Gói" value="Premium" />
          <HeroAttribute icon={VenusAndMars} label="Giới tính" value="Nam" />
          <HeroAttribute icon={Earth} label="Tuổi" value="29" />
        </div>
      </div>
    </section>
  )
}

function HeroAttribute({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Crown
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}
