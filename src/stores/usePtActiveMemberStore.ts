"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ActiveMemberContext = {
  id: number;
  memberCode: string;
  fullName: string;
} | null;

interface PtActiveMemberState {
  activeMember: ActiveMemberContext;
  setActiveMember: (member: ActiveMemberContext) => void;
  clearActiveMember: () => void;
}

export const usePtActiveMemberStore = create<PtActiveMemberState>()(
  persist(
    (set) => ({
      activeMember: null,
      setActiveMember: (activeMember) => set({ activeMember }),
      clearActiveMember: () => set({ activeMember: null }),
    }),
    {
      name: "gymmaster-pt-active-member",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
