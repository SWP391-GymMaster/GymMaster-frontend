import { apiRequest } from "@/lib/api/http-client"
import type { Notification } from "@/features/notifications/types"

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function getNotifications(accessToken: string, role: string) {
  return apiRequest<Notification[]>(
    `/api/v1/notifications?role=${encodeURIComponent(role)}`,
    {
      headers: authHeaders(accessToken),
    },
  )
}

export async function markNotificationRead(accessToken: string, id: string) {
  return apiRequest<Notification>(
    `/api/v1/notifications/${encodeURIComponent(id)}/read`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
    },
  )
}

export async function markAllNotificationsRead(accessToken: string, role: string) {
  return apiRequest<{ count: number }>(
    `/api/v1/notifications/read-all?role=${encodeURIComponent(role)}`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
    },
  )
}

export async function deleteNotification(accessToken: string, id: string) {
  return apiRequest<{ success: boolean }>(
    `/api/v1/notifications/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: authHeaders(accessToken),
    },
  )
}
