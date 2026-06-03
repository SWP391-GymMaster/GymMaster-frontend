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
  up: "text-primary bg-primary/10",
  down: "text-red-700 bg-red-500/10",
  neutral: "text-muted-foreground bg-muted",
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
          "rounded-[1.5rem] border border-border bg-card p-5 shadow-sm",
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-28 animate-pulse rounded-lg bg-muted" />
          </div>
          {Icon ? (
            <div className="flex size-11 shrink-0 animate-pulse items-center justify-center rounded-full bg-muted" />
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
        "rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              iconColorStyles[iconColor ?? "primary"].bg,
              iconColorStyles[iconColor ?? "primary"].text,
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
        ) : null}
      </div>
      {trend ? (
        <div className="mt-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
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
