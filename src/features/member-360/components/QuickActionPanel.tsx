"use client"

import Link from "next/link"
import {
  ClipboardList,
  FileText,
  UserPlus,
  ShieldCheck,
  CreditCard,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type QuickAction = {
  href: string
  label: string
  icon: LucideIcon
}

type QuickActionPanelProps = {
  actions: QuickAction[]
  className?: string
}

export function QuickActionPanel({
  actions,
  className,
}: QuickActionPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-medium text-zinc-500">Thao tác nhanh</p>

      <div className="mt-4 grid gap-2">
        {actions.length > 0 ? (
          actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                className="flex items-center gap-3 rounded-[1.25rem] border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-900 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.97]"
                href={action.href}
                key={action.href}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                {action.label}
              </Link>
            )
          })
        ) : (
          <p className="text-sm text-zinc-500">Chưa có thao tác khả dụng</p>
        )}
      </div>
    </div>
  )
}

// Action presets by role
export function getPtActions(memberId: number): QuickAction[] {
  return [
    {
      href: `/pt/members/${memberId}/notes`,
      label: "Thêm ghi chú PT",
      icon: FileText,
    },
    {
      href: `/pt/members/${memberId}/workout`,
      label: "Tạo giáo án",
      icon: ClipboardList,
    },
  ]
}

export function getAdminActions(memberId: number): QuickAction[] {
  // memberId used in template literal below
  return [
    {
      href: "/admin/assignments",
      label: "Phân công PT",
      icon: UserPlus,
    },
    {
      href: `/admin/members/${memberId}`,
      label: "Quản lý hội viên",
      icon: FileText,
    },
  ]
}

export function getStaffActions(): QuickAction[] {
  return [
    {
      href: `/staff/check-in`,
      label: "Check-in",
      icon: ShieldCheck,
    },
    {
      href: `/staff/sell-package`,
      label: "Bán gói tập",
      icon: CreditCard,
    },
    {
      href: `/staff/renew-package`,
      label: "Gia hạn gói",
      icon: ClipboardList,
    },
  ]
}
