import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type TrendDirection = "up" | "down" | "neutral"

type DashboardMetricCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  iconColor?: "primary" | "warning" | "danger" | "success"
  trend?: {
    direction: TrendDirection
    label: string
  }
  isLoading?: boolean
  className?: string
}

const trendStyles: Record<TrendDirection, string> = {
  up: "text-primary bg-primary/10 ring-primary/15",
  down: "text-red-700 bg-red-500/10 ring-red-500/15",
  neutral: "text-muted-foreground bg-muted ring-border",
}

const iconColorStyles: Record<
  "primary" | "warning" | "danger" | "success",
  { bg: string; text: string }
> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-500" },
  danger: { bg: "bg-red-500/10", text: "text-red-500" },
  success: { bg: "bg-green-500/10", text: "text-green-500" },
}

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  isLoading,
  className,
}: DashboardMetricCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex min-h-[136px] flex-col justify-between rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-soft)]",
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-28 animate-pulse rounded-xl bg-muted" />
          </div>
          {Icon ? (
            <div className="flex size-11 shrink-0 animate-pulse items-center justify-center rounded-2xl bg-muted" />
          ) : null}
        </div>
        {trend ? (
          <div className="mt-4 h-5 w-24 animate-pulse rounded-full bg-muted" />
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-[136px] flex-col justify-between rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-soft)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-panel)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl",
              iconColorStyles[iconColor ?? "primary"].bg,
              iconColorStyles[iconColor ?? "primary"].text,
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
        ) : null}
      </div>
      {trend ? (
        <div className="mt-5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
              trendStyles[trend.direction],
            )}
          >
            {trend.label}
          </span>
        </div>
      ) : null}
    </div>
  )
}
