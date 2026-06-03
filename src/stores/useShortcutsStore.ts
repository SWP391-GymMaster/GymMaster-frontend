import { create } from "zustand";

interface ShortcutsState {
  isOpen: boolean;
  toggleOpen: () => void;
  close: () => void;
}

export const useShortcutsStore = create<ShortcutsState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));
