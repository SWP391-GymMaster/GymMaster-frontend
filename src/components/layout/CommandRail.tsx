"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  ClipboardList,
  CreditCard,
  Dumbbell,
  FileClock,
  Home,
  Package,
  Salad,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { RoleBadge } from "@/components/data/RoleBadge"
import { LogoutButton } from "@/features/auth/components/LogoutButton"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

type CommandRailItem = {
  href: string
  icon: LucideIcon
  label: string
}

const navByRole: Record<UserRole, CommandRailItem[]> = {
  admin: [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/users", icon: UserCog, label: "Users" },
    { href: "/admin/staff", icon: ShieldCheck, label: "Staff" },
    { href: "/admin/trainers", icon: Dumbbell, label: "PTs" },
    { href: "/admin/members", icon: Users, label: "Members" },
    { href: "/admin/audit-logs", icon: FileClock, label: "Audit Logs" },
  ],
  staff: [
    { href: "/staff/dashboard", icon: Home, label: "Dashboard" },
    { href: "/staff/members", icon: Search, label: "Members" },
    { href: "/staff/sell-package", icon: Package, label: "Sell Package" },
    { href: "/staff/renew-package", icon: ClipboardList, label: "Renew" },
    { href: "/staff/check-in", icon: Activity, label: "Check-in" },
    { href: "/staff/payments", icon: CreditCard, label: "Payments" },
  ],
  pt: [
    { href: "/pt/dashboard", icon: Home, label: "Dashboard" },
    { href: "/pt/members/101", icon: Dumbbell, label: "Member 360" },
  ],
  member: [
    { href: "/member/dashboard", icon: Home, label: "Today" },
    { href: "/member/nutrition/meal-journal", icon: Salad, label: "Meal Journal" },
    { href: "/member/nutrition/summary", icon: Activity, label: "Calories" },
  ],
}

function isActivePath(pathname: string, href: string) {
  if (pathname === href) {
    return true
  }

  return href !== "/" && pathname.startsWith(`${href}/`)
}

type CommandRailProps = {
  role: UserRole
}

export function CommandRail({ role }: CommandRailProps) {
  const pathname = usePathname()
  const navItems = navByRole[role]

  return (
    <aside
      aria-label={`${role} workspace navigation`}
      className="fixed left-0 top-0 z-40 hidden h-dvh w-[280px] flex-col bg-[#2e3038] p-4 text-[#dee2f4] shadow-xl lg:flex"
      data-testid="command-rail"
    >
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#2170e4] text-sm font-black text-white shadow-sm">
          G
        </div>
        <div>
          <p className="text-xl font-black tracking-tight text-[#d8e2ff]">
            GymMaster OS
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#c2c6d8]">
            Elite Performance
          </p>
        </div>
      </div>

      <div className="mb-5 px-2">
        <RoleBadge role={role} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
                active
                  ? "translate-x-1 bg-[#2170e4] text-white shadow-inner"
                  : "text-[#c2c6d8] hover:bg-white/10 hover:text-[#d8e2ff]",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-5 border-t border-white/10 pt-4">
        <LogoutButton />
      </div>
    </aside>
  )
}

export function MobileCommandHeader({ role }: CommandRailProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#c2c6d6]/60 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div>
        <p className="text-lg font-black tracking-tight text-[#0058be]">
          GymMaster OS
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#595e6d]">
          {role} workspace
        </p>
      </div>
      <RoleBadge role={role} />
    </header>
  )
}
