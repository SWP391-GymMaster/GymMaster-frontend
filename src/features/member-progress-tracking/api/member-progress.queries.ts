"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getMemberProgress,
  createProgressEntry,
} from "@/features/member-progress-tracking/api/member-progress.api"
import type { CreateProgressEntryInput } from "@/features/member-progress-tracking/types/member-progress.types"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const memberProgressKeys = {
  all: ["member-progress"] as const,
  progress: (memberId: number) =>
    [...memberProgressKeys.all, "entries", memberId] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useCurrentMemberProfileId() {
  return useAuthSessionStore((state) => {
    if (state.session?.role !== "member") {
      return null
    }

    return state.session?.user?.memberProfileId ?? null;
  })
}

export function useMemberProgress(memberId: number | null) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: memberId
      ? memberProgressKeys.progress(memberId)
      : [...memberProgressKeys.all, "entries", "none"],
    queryFn: () => getMemberProgress(accessToken ?? "", memberId ?? 0),
    enabled: Boolean(accessToken) && Boolean(memberId),
  })
}

export function useCreateProgressEntry(memberId: number) {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProgressEntryInput) =>
      createProgressEntry(accessToken ?? "", memberId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: memberProgressKeys.progress(memberId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["member-360"],
        }),
      ])
    },
  })
}
