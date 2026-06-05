import { http } from "msw"
import { ok, requireAuth, fail } from "@/mocks/utils/api-response"
import type { Notification } from "@/features/notifications/types"

// Initial notifications to populate when no data exists in localStorage
const defaultNotifications: Notification[] = [
  // Admin notifications
  {
    id: "admin-1",
    title: "Cảnh báo bảo mật",
    description: "Phát hiện đăng nhập bất thường từ địa chỉ IP lạ.",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    type: "alert",
    isRead: false,
    role: "admin",
  },
  {
    id: "admin-2",
    title: "Phân công HLV đồng hành",
    description: "HLV Phạm Quốc Thái đã được chỉ định đồng hành cùng hội viên Trần Văn Long.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    type: "system",
    isRead: true,
    role: "admin",
    link: "/admin/assignments",
  },
  // Staff notifications
  {
    id: "staff-1",
    title: "Hội viên Check-in thành công",
    description: "Lâm Minh Anh vừa check-in tại quầy chính.",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    type: "checkin",
    isRead: false,
    role: "staff",
    link: "/staff/members",
  },
  {
    id: "staff-2",
    title: "Thanh toán thành công",
    description: "Đã xác nhận hóa đơn #INV-9281 của hội viên Hoàng Lan Chi (2.400.000 đ).",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    type: "payment",
    isRead: false,
    role: "staff",
    link: "/staff/payments",
  },
  // PT notifications
  {
    id: "pt-1",
    title: "Nhận hội viên mới",
    description: "Bạn vừa được phân công hướng dẫn hội viên mới Nguyễn Thị Mai.",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    type: "system",
    isRead: false,
    role: "pt",
    link: "/pt/members",
  },
  // Member notifications
  {
    id: "member-1",
    title: "Giáo án tập luyện mới",
    description: "HLV Phạm Quốc Thái vừa đăng tải giáo án mới: Hypertrophy Phase 1.",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    type: "workout",
    isRead: false,
    role: "member",
    link: "/member/workout",
  },
  {
    id: "member-2",
    title: "Nhận ghi chú từ HLV",
    description: "HLV của bạn vừa gửi nhận xét về buổi tập squat hôm nay.",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
    type: "note",
    isRead: true,
    role: "member",
    link: "/member/notes",
  },
]

const STORAGE_KEY = "gymmaster.mock.notifications"

// Retrieve notifications from localStorage or memory
export function getStoredNotifications(): Notification[] {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        return JSON.parse(raw) as Notification[]
      } catch {
        // Fallback
      }
    }
    // Initialize with default
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifications))
  }
  return [...defaultNotifications]
}

// Persist notifications
export function saveNotifications(notifications: Notification[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } else {
    // In node/test environment, mutate our default memory reference
    defaultNotifications.length = 0
    defaultNotifications.push(...notifications)
  }
}

// Helper to add a notification
export function addNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">) {
  const list = getStoredNotifications()
  const newNotif: Notification = {
    ...notification,
    id: `notif-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  }
  list.unshift(newNotif)
  saveNotifications(list)
}

export const notificationsHandlers = [
  // Get notifications by role
  http.get("/api/notifications", ({ request }) => {
    const authRole = requireAuth(request)
    if (typeof authRole !== "string") return authRole

    const url = new URL(request.url)
    const targetRole = url.searchParams.get("role") || authRole

    const list = getStoredNotifications()
    const filtered = list.filter((item) => item.role === targetRole)
    
    return ok(filtered)
  }),

  // Mark single as read
  http.post("/api/notifications/:id/read", ({ params, request }) => {
    const authRole = requireAuth(request)
    if (typeof authRole !== "string") return authRole

    const list = getStoredNotifications()
    const index = list.findIndex((item) => item.id === params.id)

    if (index === -1) {
      return fail("NOT_FOUND", "Notification not found", 404)
    }

    list[index].isRead = true
    saveNotifications(list)

    return ok(list[index])
  }),

  // Mark all as read for role
  http.post("/api/notifications/read-all", ({ request }) => {
    const authRole = requireAuth(request)
    if (typeof authRole !== "string") return authRole

    const url = new URL(request.url)
    const targetRole = url.searchParams.get("role") || authRole

    const list = getStoredNotifications()
    let count = 0

    const updated = list.map((item) => {
      if (item.role === targetRole && !item.isRead) {
        count++
        return { ...item, isRead: true }
      }
      return item
    })

    saveNotifications(updated)
    return ok({ count })
  }),

  // Delete notification
  http.delete("/api/notifications/:id", ({ params, request }) => {
    const authRole = requireAuth(request)
    if (typeof authRole !== "string") return authRole

    const list = getStoredNotifications()
    const filtered = list.filter((item) => item.id !== params.id)

    saveNotifications(filtered)
    return ok({ success: true })
  }),
]
