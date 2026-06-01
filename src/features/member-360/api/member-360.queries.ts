"use client"

import { useQuery } from "@tanstack/react-query"

import { getMember360Data } from "@/features/member-360/api/member-360.api"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const member360Keys = {
  all: ["member-360"] as const,
  detail: (id: number) => [...member360Keys.all, "detail", id] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useMember360Data(memberId: number | null) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: member360Keys.detail(memberId ?? 0),
    queryFn: () => getMember360Data(accessToken ?? "", memberId ?? 0),
    enabled: Boolean(accessToken) && Boolean(memberId),
  })
}
