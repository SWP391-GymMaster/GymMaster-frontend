import type { UserRole } from "@/types/auth"

export type NotificationType = "checkin" | "payment" | "alert" | "system" | "workout" | "note"

export interface Notification {
  id: string
  title: string
  description: string
  createdAt: string // ISO 8601 string
  type: NotificationType
  isRead: boolean
  role: UserRole
  link?: string
}
