"use client";

import { useLayoutEffect, useState } from "react";
import { Moon, Sun, Palette, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSidebarStore, Theme, ColorPreset } from "@/stores/useSideBarStore";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme, colorPreset, setColorPreset } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useLayoutEffect(() => {
    // Standard client-mount guard — must run synchronously to avoid
    // hydration mismatch when rendering theme-aware content.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const presets: { id: ColorPreset; name: string; colorClass: string }[] = [
    {
      id: "lime",
      name: "Lime (Mặc định)",
      colorClass: "bg-[oklch(0.66_0.19_142)]",
    },
    {
      id: "steel",
      name: "Steel Blue",
      colorClass: "bg-[oklch(0.58_0.095_210)]",
    },
    {
      id: "orange",
      name: "Active Orange",
      colorClass: "bg-[oklch(0.6_0.2_35)]",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border border-border bg-card shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Cấu hình giao diện
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Tùy chỉnh chế độ sáng/tối và tông màu nhấn cho không gian làm việc
            của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Chế độ màu */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase text-xs opacity-70">
              Chế độ màn hình
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition active:scale-[0.98] ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                }`}
              >
                <Sun className="size-4 shrink-0" />
                <span>Giao diện sáng</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition active:scale-[0.98] ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                }`}
              >
                <Moon className="size-4 shrink-0" />
                <span>Giao diện tối</span>
              </button>
            </div>
          </div>

          {/* Tông màu Preset */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase text-xs opacity-70 flex items-center gap-1.5">
              <Palette className="size-3.5" />
              <span>Tông màu nhấn</span>
            </h4>
            <div className="flex flex-col gap-2">
              {presets.map((preset) => {
                const isActive = colorPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setColorPreset(preset.id)}
                    className={`flex items-center justify-between w-full rounded-xl border p-3 text-sm font-medium transition active:scale-[0.98] ${
                      isActive
                        ? "border-primary bg-primary/5 text-foreground shadow-sm"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-5 rounded-full ring-2 ring-background shadow-inner shrink-0 ${preset.colorClass}`}
                      />
                      <span>{preset.name}</span>
                    </div>
                    {isActive && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
