"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark";
export type ColorPreset = "lime" | "steel" | "orange";

interface SidebarState {
  isCollapsed: boolean;
  theme: Theme;
  colorPreset: ColorPreset;
  isSettingsOpen: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
  setColorPreset: (preset: ColorPreset) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      theme: "light",
      colorPreset: "lime",
      isSettingsOpen: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          if (theme === "dark") {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      },
      setColorPreset: (colorPreset) => {
        set({ colorPreset });
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          // Remove old theme classes
          root.classList.remove("theme-lime", "theme-steel", "theme-orange");
          // Add new theme class
          root.classList.add(`theme-${colorPreset}`);
        }
      },
      setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
    }),
    {
      name: "gymmaster-sidebar-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
