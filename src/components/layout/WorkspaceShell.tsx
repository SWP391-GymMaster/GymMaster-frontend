"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Command,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sun,
  Moon,
  UserCog,
  UserRound,
} from "lucide-react";

import {
  CommandRail,
  MobileCommandHeader,
} from "@/components/layout/CommandRail";
import { UserAvatar } from "@/components/data/UserAvatar";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import { useSidebarStore } from "@/stores/useSideBarStore";
import { SpotlightSearch } from "@/features/billing/components/SpotlightSearch";
import { SettingsDialog } from "@/features/billing/components/SettingsDialog";
import { RouteProgressBar } from "@/components/feedback/RouteProgressBar";
import { PageAnimateWrapper } from "@/components/layout/PageAnimateWrapper";
import { RestTimerOverlay } from "@/components/premium/RestTimerOverlay";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ShortcutsHelpOverlay } from "@/components/premium/ShortcutsHelpOverlay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthSessionStore } from "@/features/auth/session/auth-session";

export type WorkspaceShellMetric = {
  label: string;
  value: string;
  tone?: "dark" | "light";
};

type WorkspaceShellProps = {
  role: UserRole;
  title: string;
  description: string;
  metrics?: WorkspaceShellMetric[];
  children?: ReactNode;
};

export function WorkspaceShell({
  role,
  title,
  description,
  metrics = [],
  children,
}: WorkspaceShellProps) {
  const { isCollapsed, theme, setTheme, colorPreset, isSettingsOpen, setSettingsOpen } =
    useSidebarStore();
  const router = useRouter();
  const currentUser = useAuthSessionStore((state) => state.session?.user ?? null);
  const logout = useAuthSessionStore((state) => state.logout);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutPending, setIsLogoutPending] = useState(false);

  // Invoke keyboard shortcuts
  useKeyboardShortcuts();

  const handleToggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === "light" ? "dark" : "light";

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        setTheme(nextTheme);
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: theme === "light" ? clipPath : clipPath.reverse(),
          },
          {
            duration: 400,
            easing: "ease-in-out",
            pseudoElement:
              theme === "light"
                ? "::view-transition-new(root)"
                : "::view-transition-old(root)",
          }
        );
      });
    } else {
      setTheme(nextTheme);
    }
  };

  // Initialize and apply theme & presets from local store to prevent hydration lag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.classList.remove("theme-lime", "theme-steel", "theme-orange");
    root.classList.add(`theme-${colorPreset}`);
  }, [theme, colorPreset]);

  // Hook global search shortcutCmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const roleBadges: Record<UserRole, string> = {
    admin: "ADMIN",
    staff: "STAFF",
    pt: "PT",
    member: "MEMBER",
  };

  const userLabels: Record<UserRole, string> = {
    admin: "Quản trị viên",
    staff: "Nhân viên lễ tân",
    pt: "Huấn luyện viên",
    member: "Hội viên GymMaster",
  };

  const dashboardHrefs: Record<UserRole, string> = {
    admin: "/admin/dashboard",
    staff: "/staff/dashboard",
    pt: "/pt/dashboard",
    member: "/member/dashboard",
  };

  const profileHrefs: Record<UserRole, string> = {
    admin: "/admin/profile",
    staff: "/staff/profile",
    pt: "/pt/profile",
    member: "/member/profile/edit",
  };

  async function handleLogout() {
    setIsLogoutPending(true);
    await logout();
    router.push("/login");
    setIsLogoutPending(false);
  }

  return (
    <main className="min-h-screen bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] text-foreground selection:bg-primary/20 selection:text-foreground transition-colors duration-200 lg:pb-0">
      {/* Route Progress indicator */}
      <RouteProgressBar />

      {/* Sidebars */}
      <div className="print:hidden">
        <CommandRail role={role} />
        <MobileCommandHeader role={role} />
      </div>

      {/* Main content shell layout wrapper */}
      <div
        className={cn(
          "min-h-screen pt-16 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] [background:var(--workspace-canvas)] lg:pt-0",
          isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]",
          "print:ml-0 print:bg-none"
        )}
      >
        <header className="sticky top-0 z-20 hidden min-h-[76px] items-center justify-between gap-6 border-b border-border/70 bg-[color-mix(in_oklch,var(--surface-panel)_82%,transparent)] px-8 shadow-[0_1px_0_color-mix(in_oklch,var(--foreground)_6%,transparent)] backdrop-blur-2xl lg:flex print:hidden">
          {/* Spotlight Search Trigger */}
          <div
            className="relative w-full max-w-[28rem] cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              readOnly
              className="h-11 w-full cursor-pointer rounded-2xl border border-border/80 bg-[var(--surface-input)] pl-11 pr-4 text-sm font-medium text-foreground outline-none shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_4%,transparent)] transition placeholder:text-muted-foreground focus:border-primary/45 focus:bg-card focus:ring-4 focus:ring-primary/10"
              placeholder="Tìm hội viên, hóa đơn... (Cmd+K)"
              type="search"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Switcher circular view transition toggle */}
            <button
              onClick={handleToggleTheme}
              className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-[0.96]"
              type="button"
              title="Chuyển đổi giao diện"
            >
              {theme === "light" ? (
                <Moon aria-hidden="true" className="size-5" />
              ) : (
                <Sun aria-hidden="true" className="size-5" />
              )}
              <span className="sr-only">Chuyển theme</span>
            </button>

            {/* Spotlight shortcut button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-[0.96]"
              type="button"
            >
              <Command aria-hidden="true" className="size-5" />
              <span className="sr-only">Command menu</span>
            </button>

            <div className="mx-1 h-10 w-px bg-border/80" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Mở menu người dùng"
                  className="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-muted/70 active:scale-[0.98]"
                  data-testid="workspace-user-menu-trigger"
                  type="button"
                >
                  <div className="text-right">
                    <p className="max-w-44 truncate text-sm font-semibold text-foreground">
                      {currentUser?.fullName ?? userLabels[role]}
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-[0_8px_20px_color-mix(in_oklch,var(--primary)_28%,transparent)]">
                      {roleBadges[role]}
                    </span>
                  </div>
                  <UserAvatar
                    avatarUrl={currentUser?.avatarUrl}
                    data-testid="workspace-user-avatar"
                    name={currentUser?.fullName ?? userLabels[role]}
                  />
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 rounded-[1.5rem] border border-border/80 bg-popover/95 p-2 shadow-[var(--shadow-panel)] backdrop-blur-xl"
                sideOffset={10}
              >
                <DropdownMenuLabel className="px-3 py-3">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {currentUser?.fullName ?? userLabels[role]}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {currentUser?.email ?? roleBadges[role]}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link data-testid="my-account-link" href={profileHrefs[role]}>
                    <UserCog aria-hidden="true" className="size-4" />
                    <span>Tài khoản của tôi</span>
                  </Link>
                </DropdownMenuItem>
                {role === "member" ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/member/profile">
                      <UserRound aria-hidden="true" className="size-4" />
                      <span>Hồ sơ của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={dashboardHrefs[role]}>
                    <LayoutDashboard aria-hidden="true" className="size-4" />
                    <span>Bảng điều khiển</span>
                  </Link>
                </DropdownMenuItem>
                {role === "member" ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/member/membership">
                      <CreditCard aria-hidden="true" className="size-4" />
                      <span>Gói tập của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/change-password">
                    <KeyRound aria-hidden="true" className="size-4" />
                    <span>Đổi mật khẩu</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setSettingsOpen(true)}
                >
                  <Settings aria-hidden="true" className="size-4" />
                  <span>Cấu hình giao diện</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={isLogoutPending}
                  onSelect={() => {
                    void handleLogout();
                  }}
                  variant="destructive"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  <span>{isLogoutPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content body with entry animation mount wrapper */}
        <div className="px-4 py-5 md:px-8 lg:px-10 lg:py-9">
          <PageAnimateWrapper>
            <div className="mx-auto flex w-full max-w-[1420px] flex-col gap-7">
              <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </section>

              {metrics.length > 0 ? (
                <section
                  aria-label="Workspace metrics"
                  className="grid gap-4 md:grid-cols-3 xl:gap-5"
                >
                  {metrics.map((metric) => {
                    const isDark = metric.tone === "dark";

                    return (
                      <div
                        className={cn(
                          "min-h-[128px] rounded-[1.5rem] p-5 transition-[transform,box-shadow,border-color] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5",
                          isDark
                            ? "border border-white/10 bg-[var(--surface-panel-strong)] text-background shadow-[var(--shadow-panel)]"
                            : "border border-border/80 bg-[var(--surface-panel)] text-card-foreground shadow-[var(--shadow-soft)] hover:border-primary/25",
                        )}
                        key={`${metric.label}-${metric.value}`}
                      >
                        <p
                          className={cn(
                            "text-xs font-semibold uppercase tracking-[0.12em]",
                            isDark
                              ? "text-background/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {metric.label}
                        </p>
                        <p className="mt-4 text-2xl font-semibold tracking-tight">
                          {metric.value}
                        </p>
                      </div>
                    );
                  })}
                </section>
              ) : null}

              {children}
            </div>
          </PageAnimateWrapper>
        </div>
      </div>

      {/* Interactive Overlays */}
      <SpotlightSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        role={role}
      />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setSettingsOpen} />
      <RestTimerOverlay />
      <ShortcutsHelpOverlay />
    </main>
  );
}
