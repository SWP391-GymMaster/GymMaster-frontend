"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePtActiveMemberStore, type ActiveMemberContext } from "@/stores/usePtActiveMemberStore";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Dumbbell,
  FileClock,
  Handshake,
  Home,
  MoreHorizontal,
  Package,
  Salad,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

import { RoleBadge } from "@/components/data/RoleBadge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { gymMasterAssets } from "@/lib/gymmaster-assets";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSideBarStore";
import type { UserRole } from "@/types/auth";

type CommandRailItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  originalHref?: string;
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
        { href: "/pt/members", icon: Users, label: "Hội viên" },
        { href: "/pt/members/:id", icon: Dumbbell, label: "Hội viên 360" },
      ],
    },
    {
      title: "Giáo án & Ghi chú",
      items: [
        {
          href: "/pt/members/:id/workout",
          icon: ClipboardList,
          label: "Giáo án",
        },
        { href: "/pt/members/:id/notes", icon: FileClock, label: "Ghi chú" },
        { href: "/pt/members/:id/progress", icon: Activity, label: "Tiến độ" },
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

const mobilePrimaryHrefsByRole: Record<UserRole, string[]> = {
  admin: [
    "/admin/dashboard",
    "/admin/members",
    "/admin/assignments",
    "/admin/audit-logs",
  ],
  staff: [
    "/staff/dashboard",
    "/staff/members",
    "/staff/sell-package",
    "/staff/check-in",
  ],
  pt: [
    "/pt/dashboard",
    "/pt/members",
    "/pt/members/:id",
    "/pt/members/:id/workout",
  ],
  member: [
    "/member/dashboard",
    "/member/workout",
    "/member/nutrition/meal-journal",
    "/member/nutrition/summary",
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

function flattenNavGroups(groups: SidebarGroup[]) {
  return groups.flatMap((group) => group.items);
}

function getMobileNavItems(role: UserRole, activeMember: ActiveMemberContext) {
  const rawGroups = navGroupsByRole[role] || [];
  const groups = (role === "pt") 
    ? rawGroups.map((group) => {
        return {
          ...group,
          items: group.items.map((item) => {
            if (item.href.includes("/:id")) {
              return {
                ...item,
                originalHref: item.href,
                href: activeMember ? item.href.replace("/:id", `/${activeMember.id}`) : "#",
                disabled: !activeMember,
              };
            }
            return item;
          }),
        };
      })
    : rawGroups;

  const allItems = flattenNavGroups(groups);
  const priorityHrefs = mobilePrimaryHrefsByRole[role].map((href) => {
    if (role === "pt" && activeMember) {
      return href.replace("/:id", `/${activeMember.id}`);
    }
    if (role === "pt" && !activeMember) {
      if (href.includes("/:id")) {
        return "#";
      }
    }
    return href;
  });

  const primaryItems = mobilePrimaryHrefsByRole[role]
    .map((rawHref) => {
      return allItems.find((item) => (item.originalHref || item.href) === rawHref);
    })
    .filter((item): item is CommandRailItem => Boolean(item));

  const moreItems = allItems.filter(
    (item) => !mobilePrimaryHrefsByRole[role].includes(item.originalHref || item.href),
  );

  return {
    primaryItems,
    moreItems,
  };
}

type CommandRailProps = {
  role: UserRole;
};

export function CommandRail({ role }: CommandRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar, setSettingsOpen } = useSidebarStore();
  const { activeMember, clearActiveMember } = usePtActiveMemberStore();

  const urlMemberId = useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/^\/pt\/members\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  const handleClearContext = () => {
    clearActiveMember();
    toast.info("Đã đóng ngữ cảnh học viên");
    if (pathname.startsWith("/pt/members/")) {
      const segments = pathname.split("/");
      const idSegment = segments[3];
      if (idSegment && /^\d+$/.test(idSegment)) {
        router.push("/pt/members");
      }
    }
  };

  const navGroups = useMemo(() => {
    const rawGroups = navGroupsByRole[role] || [];
    if (role !== "pt") return rawGroups;

    const memberId = activeMember?.id || urlMemberId;

    return rawGroups.map((group) => {
      return {
        ...group,
        items: group.items.map((item) => {
          if (item.href.includes("/:id")) {
            return {
              ...item,
              href: memberId ? item.href.replace("/:id", `/${memberId}`) : "#",
              disabled: !memberId,
            };
          }
          return item;
        }),
      };
    });
  }, [role, activeMember, urlMemberId]);

  return (
    <>
      <motion.aside
        aria-label={`Điều hướng ${roleWorkspaceLabels[role]}`}
        className="fixed left-0 top-0 z-40 hidden h-dvh flex-col overflow-x-hidden bg-sidebar p-4 text-sidebar-foreground shadow-xl lg:flex"
        data-testid="command-rail"
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-3 border-b border-white/5 px-2 pb-6",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <span
            aria-hidden="true"
            className="size-12 shrink-0 rounded-xl bg-contain bg-center bg-no-repeat shadow-md ring-1 ring-white/10"
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
            className="my-4 shrink-0 px-2"
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
            "flex w-full flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden py-4 pr-1",
            isCollapsed ? "items-center px-0" : "",
          )}
        >
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex w-full shrink-0 flex-col gap-1">
              {/* PT Active Member Context Card */}
              {role === "pt" && group.title === "Giáo án & Ghi chú" && !isCollapsed && (
                <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary/80">
                        Học viên đang chọn
                      </p>
                      {activeMember ? (
                        <p className="mt-1 truncate text-xs font-semibold text-white">
                          🟢 {activeMember.fullName}
                        </p>
                      ) : (
                        <p className="mt-1 truncate text-xs font-medium text-sidebar-foreground/45 italic">
                          ⚠️ Chưa chọn học viên
                        </p>
                      )}
                    </div>
                    {activeMember && (
                      <button
                        onClick={handleClearContext}
                        type="button"
                        className="rounded-md p-1 hover:bg-white/10 text-sidebar-foreground/50 hover:text-white transition"
                        title="Xóa ngữ cảnh"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Group Title */}
              {!isCollapsed && (
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40">
                  {group.title}
                </p>
              )}
              {/* Group Items */}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="group relative w-full">
                      {item.disabled ? (
                        <button
                          onClick={() => toast.warning("Vui lòng chọn học viên từ danh sách để tiếp tục.")}
                          type="button"
                          className={cn(
                            "relative flex min-h-10 w-full items-center rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] text-sidebar-foreground/35 cursor-not-allowed",
                            isCollapsed
                              ? "mx-auto size-10 justify-center"
                              : "gap-3 px-3",
                          )}
                        >
                          <Icon aria-hidden="true" className="size-4 shrink-0" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </button>
                      ) : (
                        <Link
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex min-h-10 items-center rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                            isCollapsed
                              ? "mx-auto size-10 justify-center"
                              : "w-full gap-3 px-3",
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-inner"
                              : "text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground",
                          )}
                          href={item.href}
                        >
                          <Icon aria-hidden="true" className="size-4 shrink-0" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      )}

                      {/* Premium CSS Absolute Tooltip on Collapse */}
                      {isCollapsed && (
                        <div className="pointer-events-none absolute left-14 top-1/2 z-50 ml-2 -translate-x-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
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
        <div className="mt-auto flex shrink-0 flex-col gap-2.5 border-t border-white/5 pt-4">
          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            type="button"
            className={cn(
              "group relative flex h-10 w-full items-center rounded-lg text-sidebar-foreground/75 transition-all duration-200 hover:bg-white/10 hover:text-sidebar-foreground active:scale-[0.98]",
              isCollapsed
                ? "mx-auto size-10 justify-center px-0"
                : "gap-3 px-3",
            )}
            title={isCollapsed ? "Cấu hình giao diện" : undefined}
          >
            <Settings className="size-4 shrink-0" />
            {!isCollapsed && <span>Cấu hình</span>}
            {isCollapsed && (
              <div className="pointer-events-none absolute left-14 top-1/2 z-50 ml-2 -translate-x-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                Cấu hình giao diện
              </div>
            )}
          </button>

          <LogoutButton isCollapsed={isCollapsed} />

          {/* Sidebar Collapse Toggle Trigger */}
          <button
            onClick={toggleSidebar}
            type="button"
            className="flex h-10 w-full items-center justify-center rounded-lg text-sidebar-foreground/50 transition hover:bg-white/5 hover:text-sidebar-foreground active:scale-95"
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

      <MobileCommandNav role={role} />
    </>
  );
}

export function MobileCommandHeader({ role }: CommandRailProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-zinc-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="size-10 shrink-0 rounded-xl bg-contain bg-center bg-no-repeat shadow-sm ring-1 ring-zinc-950/10"
          style={{ backgroundImage: `url(${gymMasterAssets.brand.mark})` }}
        />
        <div className="min-w-0">
          <p className="truncate text-base font-black tracking-tight text-primary">
            GymMaster OS
          </p>
          <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600">
            {roleWorkspaceLabels[role]}
          </p>
        </div>
      </div>
      <RoleBadge role={role} />
    </header>
  );
}

function MobileCommandNav({ role }: CommandRailProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { setSettingsOpen } = useSidebarStore();
  const { activeMember } = usePtActiveMemberStore();

  const urlMemberId = useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/^\/pt\/members\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  const effectiveMember = useMemo(() => {
    if (activeMember) return activeMember;
    if (urlMemberId) {
      return { id: urlMemberId, memberCode: "", fullName: "" };
    }
    return null;
  }, [activeMember, urlMemberId]);

  const { primaryItems, moreItems } = useMemo(
    () => getMobileNavItems(role, effectiveMember),
    [role, effectiveMember],
  );

  return (
    <>
      <nav
        aria-label={`Điều hướng nhanh ${roleWorkspaceLabels[role]}`}
        className="fixed inset-x-0 bottom-0 z-40 transform-gpu will-change-transform border-t border-zinc-200/80 bg-white/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.10)] backdrop-blur-2xl lg:hidden"
        data-testid="mobile-command-nav"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {primaryItems.map((item) => (
            <MobileNavItem
              active={isActivePath(pathname, item.href)}
              item={item}
              key={item.label}
              onClick={() => setMoreOpen(false)}
            />
          ))}

          <button
            aria-expanded={moreOpen}
            aria-label="Mở thêm điều hướng"
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold transition active:scale-[0.96]",
              moreOpen
                ? "bg-primary/10 text-primary"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
            )}
            onClick={() => setMoreOpen((open) => !open)}
            type="button"
          >
            <MoreHorizontal aria-hidden="true" className="size-5" />
            <span>Thêm</span>
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Đóng menu điều hướng"
            className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[2px]"
            onClick={() => setMoreOpen(false)}
            type="button"
          />

          <motion.div
            aria-label="Điều hướng mở rộng"
            className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[2rem] border border-zinc-200 bg-white pb-[calc(env(safe-area-inset-bottom)+6rem)] shadow-2xl"
            data-testid="mobile-command-more-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-zinc-200" />

            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {roleWorkspaceLabels[role]}
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950">
                  Điều hướng mở rộng
                </h2>
              </div>
              <button
                aria-label="Đóng menu"
                className="flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 active:scale-95"
                onClick={() => setMoreOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div className="max-h-[62dvh] overflow-y-auto px-5 py-4">
              <div className="grid gap-3">
                {moreItems.map((item) => (
                  <MobileMoreItem
                    active={isActivePath(pathname, item.href)}
                    item={item}
                    key={item.label}
                    onClick={() => setMoreOpen(false)}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 space-y-1">
                <button
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-zinc-800 transition hover:bg-white active:scale-[0.98]"
                  onClick={() => {
                    setSettingsOpen(true);
                    setMoreOpen(false);
                  }}
                  type="button"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                    <Settings aria-hidden="true" className="size-4" />
                  </span>
                  Cấu hình giao diện
                </button>
                <LogoutButton variant="menuItem" />
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
}

function MobileNavItem({
  active,
  item,
  onClick,
}: {
  active: boolean;
  item: CommandRailItem & { disabled?: boolean };
  onClick: () => void;
}) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <button
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold text-zinc-300 cursor-not-allowed"
        onClick={() => {
          toast.warning("Vui lòng chọn học viên từ danh sách để tiếp tục.");
          onClick();
        }}
        type="button"
      >
        <Icon aria-hidden="true" className="size-5" />
        <span className="max-w-full truncate text-zinc-400">{item.label}</span>
      </button>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold transition active:scale-[0.96]",
        active
          ? "bg-primary/10 text-primary"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
      )}
      href={item.href}
      onClick={onClick}
    >
      <Icon aria-hidden="true" className="size-5" />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}

function MobileMoreItem({
  active,
  item,
  onClick,
}: {
  active: boolean;
  item: CommandRailItem & { disabled?: boolean };
  onClick: () => void;
}) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <button
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-zinc-100 bg-white text-zinc-300 cursor-not-allowed px-3 text-sm font-semibold"
        onClick={() => {
          toast.warning("Vui lòng chọn học viên từ danh sách để tiếp tục.");
          onClick();
        }}
        type="button"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-300">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-zinc-400">{item.label}</span>
        <ChevronRight aria-hidden="true" className="size-4 text-zinc-200" />
      </button>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-2xl border px-3 text-sm font-semibold transition active:scale-[0.98]",
        active
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-zinc-200 bg-white text-zinc-800 hover:border-primary/30 hover:bg-primary/5",
      )}
      href={item.href}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <ChevronRight aria-hidden="true" className="size-4 text-zinc-400" />
    </Link>
  );
}
