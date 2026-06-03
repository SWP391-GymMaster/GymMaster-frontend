"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  CreditCard,
  Dumbbell,
  FileClock,
  Handshake,
  Home,
  Package,
  Salad,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { RoleBadge } from "@/components/data/RoleBadge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import { gymMasterAssets } from "@/lib/gymmaster-assets";

type CommandRailItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const navByRole: Record<UserRole, CommandRailItem[]> = {
  admin: [
    { href: "/admin/dashboard", icon: Home, label: "Tổng quan" },
    { href: "/admin/users", icon: UserCog, label: "Tài khoản" },
    { href: "/admin/staff", icon: ShieldCheck, label: "Lễ tân" },
    { href: "/admin/trainers", icon: Dumbbell, label: "PTs" },
    { href: "/admin/members", icon: Users, label: "Hội viên" },
    { href: "/admin/assignments", icon: Handshake, label: "Phân công PT" },
    { href: "/admin/audit-logs", icon: FileClock, label: "Nhật ký" },
  ],
  staff: [
    { href: "/staff/dashboard", icon: Home, label: "Quầy lễ tân" },
    { href: "/staff/members", icon: Search, label: "Tìm hội viên" },
    { href: "/staff/sell-package", icon: Package, label: "Bán gói" },
    { href: "/staff/renew-package", icon: ClipboardList, label: "Gia hạn" },
    { href: "/staff/check-in", icon: Activity, label: "Check-in" },
    { href: "/staff/payments", icon: CreditCard, label: "Thanh toán" },
  ],
  pt: [
    { href: "/pt/dashboard", icon: Home, label: "Coach hub" },
    { href: "/pt/members/101", icon: Dumbbell, label: "Hội viên 360" },
    { href: "/pt/members/101/workout", icon: ClipboardList, label: "Giáo án" },
    { href: "/pt/members/101/notes", icon: FileClock, label: "Ghi chú" },
  ],
  member: [
    { href: "/member/dashboard", icon: Home, label: "Hôm nay" },
    { href: "/member/workout", icon: Dumbbell, label: "Giáo án" },
    { href: "/member/notes", icon: FileClock, label: "Ghi chú" },
    {
      href: "/member/nutrition/meal-journal",
      icon: Salad,
      label: "Nhật ký ăn",
    },
    { href: "/member/nutrition/summary", icon: Activity, label: "Calo" },
  ],
};

const roleWorkspaceLabels: Record<UserRole, string> = {
  admin: "Không gian quản trị",
  staff: "Không gian lễ tân",
  pt: "Không gian PT",
  member: "Không gian hội viên",
};

function isActivePath(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  return href !== "/" && pathname.startsWith(`${href}/`);
}

type CommandRailProps = {
  role: UserRole;
};

export function CommandRail({ role }: CommandRailProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];

  return (
    <aside
      aria-label={`Điều hướng ${roleWorkspaceLabels[role]}`}
      className="fixed left-0 top-0 z-40 hidden h-dvh w-[280px] flex-col bg-sidebar p-4 text-sidebar-foreground shadow-xl lg:flex"
      data-testid="command-rail"
    >
      <div className="flex items-center gap-3 px-2 pb-8">
        {/* <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground shadow-sm"> */}
        <span
          aria-hidden="true"
          className="size-14 rounded-[1.25rem] bg-contain bg-center bg-no-repeat shadow-xl shadow-background/40 ring-1 ring-white/10"
          style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
        />
        {/* </div> */}
        <div>
          <p className="text-xl font-black tracking-tight text-sidebar-foreground">
            GymMaster OS
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/70">
            Vận hành phòng gym
          </p>
        </div>
      </div>

      <div className="mb-5 px-2">
        <RoleBadge role={role} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
                active
                  ? "translate-x-1 bg-sidebar-primary text-sidebar-primary-foreground shadow-inner"
                  : "text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-white/10 pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}

export function MobileCommandHeader({ role }: CommandRailProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div>
        <p className="text-lg font-black tracking-tight text-primary">
          GymMaster OS
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600">
          {roleWorkspaceLabels[role]}
        </p>
      </div>
      <RoleBadge role={role} />
    </header>
  );
}
