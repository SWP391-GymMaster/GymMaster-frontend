"use client"

import { useQuery } from "@tanstack/react-query"

import { getPtAssignedMembers } from "@/features/pt-dashboard/api/pt-dashboard.api"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const ptDashboardKeys = {
  all: ["pt-dashboard"] as const,
  members: () => [...ptDashboardKeys.all, "members"] as const,
}

function usePtAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function usePtAssignedMembers() {
  const accessToken = usePtAccessToken()

  return useQuery({
    queryKey: ptDashboardKeys.members(),
    queryFn: () => getPtAssignedMembers(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}
