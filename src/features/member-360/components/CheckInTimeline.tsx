"use client"

import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckInEntry = {
  id: number
  checkInAt: string
}

type CheckInTimelineProps = {
  entries?: CheckInEntry[]
  isLoading?: boolean
  className?: string
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
          "rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm",
          className,
        )}
      >
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-2 shrink-0 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-4 flex-1 animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const hasEntries = entries && entries.length > 0

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-medium text-zinc-500">Recent check-ins</p>

      <div className="mt-4 space-y-3">
        {hasEntries ? (
          entries.slice(-5).reverse().map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-3">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  i === 0 ? "bg-emerald-500" : "bg-zinc-300",
                )}
              />
              <span className="text-sm text-zinc-700">
                {formatDateTime(entry.checkInAt)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Clock aria-hidden="true" className="size-4" />
            No check-ins recorded
          </div>
        )}
      </div>
    </div>
  )
}
