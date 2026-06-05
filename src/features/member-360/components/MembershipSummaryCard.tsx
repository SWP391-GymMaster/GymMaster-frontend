"use client"

import { CalendarDays } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { cn } from "@/lib/utils"

type MembershipSummaryCardProps = {
  packageName?: string
  startDate?: string
  endDate?: string
  paymentStatus?: "paid" | "pending" | "refunded"
  membershipStatus?: "active" | "pending_payment" | "expired" | "cancelled"
  isLoading?: boolean
  className?: string
}

function toStatusPillStatus(
  status: MembershipSummaryCardProps["membershipStatus"],
) {
  return status ?? "unknown"
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

export function MembershipSummaryCard({
  packageName,
  startDate,
  endDate,
  paymentStatus,
  membershipStatus,
  isLoading,
  className,
}: MembershipSummaryCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm",
          className,
        )}
      >
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
        <div className="mt-3 space-y-2">
          <div className="h-5 w-36 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>
    )
  }

  if (!packageName) {
    return (
      <div
        className={cn(
          "rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-5",
          className,
        )}
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <CalendarDays aria-hidden="true" className="size-4" />
          Chưa có gói hội viên active
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
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500">Gói hội viên</p>
        {membershipStatus ? (
          <StatusPill status={toStatusPillStatus(membershipStatus)} />
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xl font-semibold tracking-tight text-zinc-950">
            {packageName}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="text-zinc-600">
            Bắt đầu: {formatDate(startDate)}
          </span>
          <span className="text-zinc-600">Kết thúc: {formatDate(endDate)}</span>
        </div>

        {paymentStatus ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
              Thanh toán
            </span>
            <StatusPill status={paymentStatus} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
