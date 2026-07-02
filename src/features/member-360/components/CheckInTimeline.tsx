"use client"

import { CheckCircle2, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatVnDate, formatVnTime } from "@/lib/date/vn-time"

type CheckInEntry = {
  id: number
  checkInAt: string
}

type CheckInTimelineProps = {
  entries?: CheckInEntry[]
  isLoading?: boolean
  className?: string
}

function formatTime(dateStr: string) {
  return formatVnTime(dateStr, { hour: "2-digit", minute: "2-digit" })
}

function formatDate(dateStr: string) {
  return formatVnDate(dateStr, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function CheckInTimeline({
  entries,
  isLoading,
  className,
}: CheckInTimelineProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "gm-panel p-5",
          className,
        )}
      >
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  const hasEntries = entries && entries.length > 0

  return (
    <section
      className={cn(
        "gm-panel p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Check-in gần đây</p>
      </div>

      <div className="mt-5">
        {hasEntries ? (
          <div className="relative space-y-5 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-border">
            {entries.slice(-5).reverse().map((entry, i) => (
              <div key={entry.id} className="relative flex gap-4">
                <span
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card",
                    i === 0
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-primary/30 text-primary",
                  )}
                >
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                </span>
                <div className="gm-panel-muted flex-1 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {formatTime(entry.checkInAt)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        Check-in thành công
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.checkInAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <Clock aria-hidden="true" className="size-4" />
            Chưa có lượt check-in
          </div>
        )}
      </div>
    </section>
  )
}
