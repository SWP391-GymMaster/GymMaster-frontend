"use client"

import { Dumbbell } from "lucide-react"

import { cn } from "@/lib/utils"

type AssignedPTCardProps = {
  fullName?: string
  specialty?: string
  assignedAt?: string
  isLoading?: boolean
  className?: string
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function AssignedPTCard({
  fullName,
  specialty,
  assignedAt,
  isLoading,
  className,
}: AssignedPTCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm",
          className,
        )}
      >
        <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 flex items-center gap-3">
          <div className="size-11 animate-pulse rounded-full bg-zinc-200" />
          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
        <div className="mt-3 h-3 w-36 animate-pulse rounded bg-zinc-200" />
      </div>
    )
  }

  if (!fullName) {
    return (
      <div
        className={cn(
          "rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-5",
          className,
        )}
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Dumbbell aria-hidden="true" className="size-4" />
          Chưa phân công PT
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-medium text-zinc-500">PT phụ trách</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Dumbbell aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-base font-semibold text-zinc-950">{fullName}</p>
          {specialty ? (
            <p className="text-sm text-zinc-500">{specialty}</p>
          ) : null}
        </div>
      </div>

      {assignedAt ? (
        <p className="mt-3 text-xs text-zinc-400">
          Phân công ngày {formatDate(assignedAt)}
        </p>
      ) : null}
    </div>
  )
}
