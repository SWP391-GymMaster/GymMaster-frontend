"use client"

import { Mail, Phone, User } from "lucide-react"

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
  pt: "Assigned member",
  admin: "Member detail",
  staff: "Member detail",
  member: "My profile",
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
          "rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-700" />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex size-14 animate-pulse items-center justify-center rounded-full bg-zinc-700" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-zinc-700" />
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-700" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-emerald-300">
          {viewContextLabels[viewContext]}
        </span>
        <StatusPill status={toStatusPillStatus(status)} />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <User aria-hidden="true" className="size-6" />
        </span>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {fullName}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">{memberCode}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-2 text-zinc-300">
          <Mail aria-hidden="true" className="size-4" />
          {email}
        </span>
        <span className="flex items-center gap-2 text-zinc-300">
          <Phone aria-hidden="true" className="size-4" />
          {phone}
        </span>
      </div>
    </div>
  )
}
