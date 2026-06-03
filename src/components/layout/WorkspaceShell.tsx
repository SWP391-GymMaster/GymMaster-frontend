"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Bell, Command, Search } from "lucide-react";

import {
  CommandRail,
  MobileCommandHeader,
} from "@/components/layout/CommandRail";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import { useSidebarStore } from "@/stores/sidebar-store";
import { SpotlightSearch } from "@/features/billing/components/SpotlightSearch";
import { NotificationsDrawer } from "@/components/feedback/NotificationsDrawer";
import { SettingsDialog } from "@/features/billing/components/SettingsDialog";
import { RouteProgressBar } from "@/components/feedback/RouteProgressBar";
import { PageAnimateWrapper } from "@/components/layout/PageAnimateWrapper";

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
  const { isCollapsed, theme, colorPreset, isSettingsOpen, setSettingsOpen } =
    useSidebarStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* Route Progress indicator */}
      <RouteProgressBar />

      {/* Sidebars */}
      <CommandRail role={role} />
      <MobileCommandHeader role={role} />

      {/* Main content shell layout wrapper */}
      <div
        className={cn(
          "min-h-screen bg-[linear-gradient(135deg,hsl(var(--muted)/0.55),hsl(var(--background))_42%,hsl(var(--muted)/0.35))] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]",
        )}
      >
        <header className="sticky top-0 z-20 hidden min-h-[72px] items-center justify-between gap-6 border-b border-border/70 bg-background/85 px-8 backdrop-blur-xl lg:flex">
          {/* Spotlight Search Trigger */}
          <div
            className="relative w-full max-w-sm cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              readOnly
              className="h-11 w-full rounded-lg border border-border bg-muted/40 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 cursor-pointer"
              placeholder="Tìm hội viên, hóa đơn... (Cmd+K)"
              type="search"
            />
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications drawer trigger */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-[0.96]"
              type="button"
            >
              <Bell aria-hidden="true" className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
              <span className="sr-only">Thông báo</span>
            </button>

            {/* Spotlight shortcut button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-[0.96]"
              type="button"
            >
              <Command aria-hidden="true" className="size-5" />
              <span className="sr-only">Command menu</span>
            </button>

            <div className="h-10 w-px bg-border" />

            {/* Config theme presets click handler */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-3 text-left hover:opacity-90 transition active:scale-[0.98]"
              type="button"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {userLabels[role]}
                </p>
                <span className="mt-1 inline-flex rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {roleBadges[role]}
                </span>
              </div>
              <div className="size-10 rounded-full border-2 border-primary bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.45),hsl(var(--foreground)))] shadow-sm shrink-0" />
            </button>
          </div>
        </header>

        {/* Content body with entry animation mount wrapper */}
        <div className="px-4 py-5 md:px-8 lg:px-10 lg:py-10">
          <PageAnimateWrapper>
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
              <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
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
                  className="grid gap-4 md:grid-cols-3"
                >
                  {metrics.map((metric) => {
                    const isDark = metric.tone === "dark";

                    return (
                      <div
                        className={cn(
                          "rounded-2xl p-5 transition-[transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg",
                          isDark
                            ? "border border-white/10 bg-foreground text-background shadow-xl"
                            : "border border-border bg-card text-card-foreground shadow-sm",
                        )}
                        key={`${metric.label}-${metric.value}`}
                      >
                        <p
                          className={cn(
                            "text-sm",
                            isDark
                              ? "text-background/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {metric.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold">
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
      <NotificationsDrawer
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  );
}
