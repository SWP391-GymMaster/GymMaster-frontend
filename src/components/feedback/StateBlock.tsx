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
  loading: "border-zinc-200 bg-zinc-50 text-zinc-700",
  empty: "border-dashed border-zinc-300 bg-zinc-50 text-zinc-700",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-emerald-200 bg-emerald-50 text-emerald-900",
}

const iconClasses: Record<StateBlockTone, string> = {
  loading: "bg-zinc-200 text-zinc-600",
  empty: "bg-white text-zinc-500",
  error: "bg-red-100 text-red-700",
  info: "bg-emerald-100 text-emerald-700",
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
        "rounded-[1.25rem] border p-4",
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
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="mt-1 text-sm opacity-85">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
