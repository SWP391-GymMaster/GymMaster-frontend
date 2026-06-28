"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createPtCheckIn,
  getPtAssignedMembers,
  getPtTodayCheckIns,
} from "@/features/pt-dashboard/api/pt-dashboard.api"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export const ptDashboardKeys = {
  all: ["pt-dashboard"] as const,
  members: () => [...ptDashboardKeys.all, "members"] as const,
  todayCheckIns: () => [...ptDashboardKeys.all, "today-checkins"] as const,
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

export function usePtTodayCheckIns() {
  const accessToken = usePtAccessToken()

  return useQuery({
    queryKey: ptDashboardKeys.todayCheckIns(),
    queryFn: () => getPtTodayCheckIns(accessToken ?? ""),
    enabled: Boolean(accessToken),
  })
}

export function usePtCreateCheckIn() {
  const accessToken = usePtAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: number) => createPtCheckIn(accessToken ?? "", memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ptDashboardKeys.todayCheckIns() })
    },
  })
}
