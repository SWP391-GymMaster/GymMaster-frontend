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
  ChevronLeft,
  ChevronRight,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

import { RoleBadge } from "@/components/data/RoleBadge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import { gymMasterAssets } from "@/lib/gymmaster-assets";
import { useSidebarStore } from "@/stores/sidebar-store";

type CommandRailItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type SidebarGroup = {
  title: string;
  items: CommandRailItem[];
};

const navGroupsByRole: Record<UserRole, SidebarGroup[]> = {
  admin: [
    {
      title: "Vận hành chính",
      items: [
        { href: "/admin/dashboard", icon: Home, label: "Tổng quan" },
        { href: "/admin/members", icon: Users, label: "Hội viên" },
        { href: "/admin/trainers", icon: Dumbbell, label: "PTs" },
        { href: "/admin/staff", icon: ShieldCheck, label: "Lễ tân" },
        { href: "/admin/assignments", icon: Handshake, label: "Phân công PT" },
      ],
    },
    {
      title: "Cấu hình & Quản trị",
      items: [
        { href: "/admin/packages", icon: Package, label: "Gói tập" },
        { href: "/admin/memberships", icon: ClipboardList, label: "Hợp đồng" },
        { href: "/admin/payments", icon: CreditCard, label: "Hóa đơn" },
        { href: "/admin/users", icon: UserCog, label: "Tài khoản" },
        { href: "/admin/audit-logs", icon: FileClock, label: "Nhật ký" },
      ],
    },
  ],
  staff: [
    {
      title: "Vận hành quầy",
      items: [
        { href: "/staff/dashboard", icon: Home, label: "Quầy lễ tân" },
        { href: "/staff/check-in", icon: Activity, label: "Check-in" },
        { href: "/staff/payments", icon: CreditCard, label: "Thanh toán" },
      ],
    },
    {
      title: "Nghiệp vụ hội viên",
      items: [
        { href: "/staff/members", icon: Search, label: "Tìm hội viên" },
        { href: "/staff/sell-package", icon: Package, label: "Bán gói" },
        { href: "/staff/renew-package", icon: ClipboardList, label: "Gia hạn" },
      ],
    },
  ],
  pt: [
    {
      title: "Làm việc",
      items: [
        { href: "/pt/dashboard", icon: Home, label: "Coach hub" },
        { href: "/pt/members/101", icon: Dumbbell, label: "Hội viên 360" },
      ],
    },
    {
      title: "Giáo án & Ghi chú",
      items: [
        {
          href: "/pt/members/101/workout",
          icon: ClipboardList,
          label: "Giáo án",
        },
        { href: "/pt/members/101/notes", icon: FileClock, label: "Ghi chú" },
      ],
    },
  ],
  member: [
    {
      title: "Hôm nay",
      items: [
        { href: "/member/dashboard", icon: Home, label: "Hôm nay" },
        { href: "/member/workout", icon: Dumbbell, label: "Giáo án" },
        { href: "/member/notes", icon: FileClock, label: "Ghi chú" },
      ],
    },
    {
      title: "Dinh dưỡng & Gói tập",
      items: [
        {
          href: "/member/nutrition/summary",
          icon: UtensilsCrossed,
          label: "Calo",
        },
        {
          href: "/member/nutrition/meal-journal",
          icon: Salad,
          label: "Nhật ký ăn",
        },
        {
          href: "/member/membership",
          icon: CreditCard,
          label: "Gói tập & Hóa đơn",
        },
        { href: "/member/progress", icon: Activity, label: "Tiến độ" },
      ],
    },
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
  const { isCollapsed, toggleSidebar, setSettingsOpen } = useSidebarStore();
  const navGroups = navGroupsByRole[role] || [];

  return (
    <motion.aside
      aria-label={`Điều hướng ${roleWorkspaceLabels[role]}`}
      className="fixed left-0 top-0 z-40 hidden h-dvh flex-col bg-sidebar p-4 text-sidebar-foreground shadow-xl lg:flex overflow-x-hidden"
      data-testid="command-rail"
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-2 pb-6 shrink-0 border-b border-white/5",
          isCollapsed ? "justify-center" : "",
        )}
      >
        <span
          aria-hidden="true"
          className="size-12 rounded-xl bg-contain bg-center bg-no-repeat shadow-md ring-1 ring-white/10 shrink-0"
          style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
        />
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-lg font-black tracking-tight text-sidebar-foreground">
              GymMaster OS
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/60">
              Vận hành phòng gym
            </p>
          </motion.div>
        )}
        {/* Support accessibility audits or queries searching for GymMaster OS in text */}
        {isCollapsed && <span className="sr-only">GymMaster OS</span>}
      </div>

      {/* Role Badge Section */}
      {!isCollapsed && (
        <motion.div
          className="my-4 px-2 shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <RoleBadge role={role} />
        </motion.div>
      )}

      {/* Navigation Groups */}
      <nav
        className={cn(
          "flex-1 flex flex-col gap-5 overflow-y-auto overflow-x-hidden pr-1 py-4 w-full",
          isCollapsed ? "items-center px-0" : "",
        )}
      >
        {navGroups.map((group, idx) => (
          <div key={idx} className="w-full flex flex-col gap-1 shrink-0">
            {/* Group Title */}
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-1">
                {group.title}
              </p>
            )}
            {/* Group Items */}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <div key={item.href} className="relative group w-full">
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] relative",
                        isCollapsed
                          ? "justify-center size-10 mx-auto"
                          : "gap-3 px-3 w-full",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-inner"
                          : "text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground",
                      )}
                      href={item.href}
                    >
                      <Icon aria-hidden="true" className="size-4 shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>

                    {/* Premium CSS Absolute Tooltip on Collapse */}
                    {isCollapsed && (
                      <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 pointer-events-none rounded-md bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap shadow-xl ring-1 ring-white/10 z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer controls */}
      <div className="mt-auto shrink-0 flex flex-col gap-2.5 border-t border-white/5 pt-4">
        {/* Settings button */}
        <button
          onClick={() => setSettingsOpen(true)}
          type="button"
          className={cn(
            "flex h-10 items-center rounded-lg text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground transition-all duration-200 active:scale-[0.98] w-full relative group",
            isCollapsed ? "justify-center size-10 mx-auto px-0" : "gap-3 px-3",
          )}
          title={isCollapsed ? "Cấu hình giao diện" : undefined}
        >
          <Settings className="size-4 shrink-0" />
          {!isCollapsed && <span>Cấu hình</span>}
          {isCollapsed && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 pointer-events-none rounded-md bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap shadow-xl ring-1 ring-white/10 z-50">
              Cấu hình giao diện
            </div>
          )}
        </button>

        <LogoutButton isCollapsed={isCollapsed} />

        {/* Sidebar Collapse Toggle Trigger */}
        <button
          onClick={toggleSidebar}
          type="button"
          className="flex h-10 w-full items-center justify-center rounded-lg text-sidebar-foreground/50 hover:bg-white/5 hover:text-sidebar-foreground transition active:scale-95"
          title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <ChevronLeft className="size-4" />
              <span>Thu gọn</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
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
