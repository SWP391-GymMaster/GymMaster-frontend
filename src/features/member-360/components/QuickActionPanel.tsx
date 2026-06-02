"use client"

import Link from "next/link"
import {
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  ShieldCheck,
  UserPlus,
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
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-semibold text-foreground">Thao tác nhanh</p>

      <div className="mt-4 grid gap-2">
        {actions.length > 0 ? (
          actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
                href={action.href}
                key={action.href}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate">{action.label}</span>
                <span className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">
                  ›
                </span>
              </Link>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có thao tác khả dụng</p>
        )}

        <Link
          className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
          href="#"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0 flex-1 truncate">Gửi thông báo</span>
          <span className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">
            ›
          </span>
        </Link>
      </div>
    </section>
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
    {
      href: `/staff/renew-package`,
      label: "Gia hạn gói",
      icon: CreditCard,
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
