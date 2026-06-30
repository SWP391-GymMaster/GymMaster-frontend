import type { LucideIcon } from "lucide-react"
import { AlertCircle, Loader2, SearchX } from "lucide-react"

import { cn } from "@/lib/utils"

type StateBlockTone = "loading" | "empty" | "error" | "info"

type StateBlockProps = {
  title: string
  description?: string
  tone?: StateBlockTone
  icon?: LucideIcon
  className?: string
}

const toneClasses: Record<StateBlockTone, string> = {
  loading: "border-border/80 bg-[var(--surface-panel-muted)] text-foreground",
  empty: "border-dashed border-border/90 bg-[var(--surface-panel-muted)] text-foreground",
  error: "border-red-300/70 bg-red-50/80 text-red-900",
  info: "border-[color:var(--status-active-border)] bg-[var(--status-active-bg)] text-[var(--status-active-text)]",
}

const iconClasses: Record<StateBlockTone, string> = {
  loading: "bg-card text-muted-foreground ring-1 ring-border/80",
  empty: "bg-card text-muted-foreground ring-1 ring-border/80",
  error: "bg-red-100 text-red-700",
  info: "bg-[var(--status-active-border)] text-[var(--status-active-text)]",
}

const defaultIcons: Record<StateBlockTone, LucideIcon> = {
  loading: Loader2,
  empty: SearchX,
  error: AlertCircle,
  info: AlertCircle,
}

export function StateBlock({
  title,
  description,
  tone = "info",
  icon,
  className,
}: StateBlockProps) {
  const Icon = icon ?? defaultIcons[tone]

  return (
    <div
      className={cn(
        "rounded-[1.25rem] border p-4 shadow-[var(--shadow-soft)]",
        toneClasses[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
            iconClasses[tone],
          )}
        >
          <Icon
            aria-hidden="true"
            className={cn("size-4", tone === "loading" ? "animate-spin" : "")}
          />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="mt-1 max-w-prose text-sm leading-6 opacity-80">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
