"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShortcutsStore } from "@/stores/useShortcutsStore";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleOpen, close } = useShortcutsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in form fields
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Escape always closes the overlay
      if (e.key === "Escape") {
        close();
        return;
      }

      // Handle '?' key to toggle shortcuts dock (only outside inputs)
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        toggleOpen();
        return;
      }

      // Alt/Option key combinations
      if (e.altKey) {
        const key = e.key.toLowerCase();
        
        if (key === "c") {
          e.preventDefault();
          router.push("/staff/check-in");
        } else if (key === "s") {
          e.preventDefault();
          router.push("/staff/sell-package");
        } else if (key === "f") {
          e.preventDefault();
          const searchInput = document.querySelector("[data-shortcut-search]") as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, toggleOpen, close]);
}
