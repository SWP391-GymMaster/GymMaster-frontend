"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/features/notifications/api/notifications.api"

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (role: string) => [...notificationKeys.all, "list", role] as const,
}

function useAccessToken() {
  return useAuthSessionStore((state) => state.session?.accessToken)
}

export function useNotifications(role: string) {
  const accessToken = useAccessToken()

  return useQuery({
    queryKey: notificationKeys.list(role),
    queryFn: async () => {
      if (!accessToken || !role) return []
      return getNotifications(accessToken, role)
    },
    enabled: !!accessToken && !!role,
    // Refetch notifications every 10 seconds for real-time simulation
    refetchInterval: 10000,
  })
}

export function useMarkNotificationRead() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; role: string }) => {
      if (!accessToken) throw new Error("No access token")
      return markNotificationRead(accessToken, id)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(variables.role),
      })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ role }: { role: string }) => {
      if (!accessToken) throw new Error("No access token")
      return markAllNotificationsRead(accessToken, role)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(variables.role),
      })
    },
  })
}

export function useDeleteNotification() {
  const accessToken = useAccessToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; role: string }) => {
      if (!accessToken) throw new Error("No access token")
      return deleteNotification(accessToken, id)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(variables.role),
      })
    },
  })
}
