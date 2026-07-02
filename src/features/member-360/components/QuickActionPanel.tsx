"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ClipboardList,
  CreditCard,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  UserRound,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type QuickAction = {
  href: string
  label: string
  icon: LucideIcon
  description?: string
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
    <section className={cn("gm-panel p-5", className)}>
      <p className="text-sm font-semibold text-foreground">Thao tác nhanh</p>

      <div className="mt-4 grid gap-2">
        {actions.length > 0 ? (
          actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                className="gm-interactive-card group flex items-center gap-3 p-3 text-sm font-medium text-foreground active:scale-[0.98]"
                href={action.href}
                key={`${action.href}-${action.label}`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{action.label}</span>
                  {action.description ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  ) : null}
                </span>
                <span className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">
                  ›
                </span>
              </Link>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có thao tác khả dụng
          </p>
        )}
      </div>
    </section>
  )
}

export function getPtActions(memberId: number): QuickAction[] {
  return [
    {
      href: `/pt/members/${memberId}/notes`,
      label: "Ghi chú PT",
      description: "Cập nhật buổi tập",
      icon: FileText,
    },
    {
      href: `/pt/members/${memberId}/workout`,
      label: "Thiết kế giáo án",
      description: "Bài tập và set/reps",
      icon: ClipboardList,
    },
    {
      href: `/pt/members/${memberId}/progress`,
      label: "Xem tiến độ",
      description: "Cân nặng và body fat",
      icon: TrendingUp,
    },
  ]
}

export function getAdminActions(memberId: number): QuickAction[] {
  return [
    {
      href: "/admin/assignments",
      label: "Phân công PT",
      description: "Gán huấn luyện viên",
      icon: UserPlus,
    },
    {
      href: "/admin/members",
      label: "Quản lý hội viên",
      description: "Danh sách và hồ sơ",
      icon: FileText,
    },
    {
      href: `/staff/renew-package?memberId=${memberId}`,
      label: "Gia hạn gói",
      description: "Chuyển sang workflow gói",
      icon: CreditCard,
    },
  ]
}

export function getStaffActions(
  memberId?: number,
  memberCode?: string,
): QuickAction[] {
  const query = memberId
    ? `?memberId=${memberId}${memberCode ? `&query=${encodeURIComponent(memberCode)}` : ""}`
    : ""

  return [
    {
      href: "/staff/check-in",
      label: "Check-in",
      description: "Xác nhận vào phòng",
      icon: ShieldCheck,
    },
    {
      href: `/staff/sell-package${query}`,
      label: "Bán gói tập",
      description: "Tạo membership mới",
      icon: CreditCard,
    },
    {
      href: `/staff/renew-package${query}`,
      label: "Gia hạn gói",
      description: "Nối tiếp gói hiện tại",
      icon: ClipboardList,
    },
  ]
}

export function getMemberActions(): QuickAction[] {
  return [
    {
      href: "/member/membership",
      label: "Gói tập của tôi",
      description: "Hạn gói và gia hạn",
      icon: CreditCard,
    },
    {
      href: "/member/progress",
      label: "Tiến độ",
      description: "Cập nhật chỉ số",
      icon: TrendingUp,
    },
    {
      href: "/member/workout",
      label: "Giáo án",
      description: "Bài tập được giao",
      icon: ClipboardList,
    },
    {
      href: "/member/notes",
      label: "Ghi chú PT",
      description: "Nhận xét từ huấn luyện viên",
      icon: UserRound,
    },
  ]
}
