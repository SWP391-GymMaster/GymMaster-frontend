"use client"

import { CalendarDays, Dumbbell, MessageSquare, Phone, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
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
          "rounded-2xl border border-border bg-card p-5 shadow-sm",
          className,
        )}
      >
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-4 flex items-center gap-3">
          <div className="size-14 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!fullName) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border bg-muted/40 p-5",
          className,
        )}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Dumbbell aria-hidden="true" className="size-4" />
          Chưa phân công PT
        </div>
      </div>
    )
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-semibold text-foreground">PT phụ trách</p>

      <div className="mt-4 flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Dumbbell aria-hidden="true" className="size-7" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-foreground">{fullName}</p>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              Đang phụ trách
            </span>
          </div>
          {specialty ? (
            <p className="mt-1 text-sm text-muted-foreground">{specialty}</p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            Chuyên môn: Tăng cơ, Giảm mỡ, HIIT
          </p>
        </div>
      </div>

      {assignedAt ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Phân công ngày {formatDate(assignedAt)}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-4 gap-2">
        <Button className="rounded-xl" size="sm" type="button" variant="outline">
          <MessageSquare aria-hidden="true" className="size-4" />
        </Button>
        <Button className="rounded-xl" size="sm" type="button" variant="outline">
          <CalendarDays aria-hidden="true" className="size-4" />
        </Button>
        <Button className="rounded-xl" size="sm" type="button" variant="outline">
          <Phone aria-hidden="true" className="size-4" />
        </Button>
        <Button className="rounded-xl" size="sm" type="button" variant="outline">
          <UserRound aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  )
}
