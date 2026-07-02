"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Check,
  CheckSquare,
  Search,
  Trash2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Award,
  ShieldAlert,
  Calendar,
  Dumbbell,
  FileText,
} from "lucide-react"
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/features/notifications/api/notifications.queries"
import type { Notification, NotificationType } from "@/features/notifications/types"
import { cn } from "@/lib/utils"
import { formatVnDate, formatVnTime } from "@/lib/date/vn-time"

const iconMap = {
  checkin: UserCheck,
  payment: Award,
  alert: ShieldAlert,
  system: Calendar,
  workout: Dumbbell,
  note: FileText,
}

const typeLabels: Record<NotificationType, string> = {
  checkin: "Check-in",
  payment: "Thanh toán",
  alert: "Cảnh báo",
  system: "Hệ thống",
  workout: "Giáo án",
  note: "Ghi chú",
}

const badgeColors = {
  checkin: "bg-primary/10 text-primary border-primary/20",
  payment: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  alert: "bg-destructive/10 text-destructive border-destructive/20",
  system: "bg-[var(--status-info)]/15 text-[var(--status-info)] border-[var(--status-info)]/25",
  workout: "bg-lime-500/10 text-lime-600 border-lime-500/20",
  note: "bg-[var(--status-info)]/15 text-[var(--status-info)] border-[var(--status-info)]/25",
}

export function AdminNotificationsContent() {
  const router = useRouter()
  const { data: notifications = [], isLoading } = useNotifications("admin")
  
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()
  const deleteMutation = useDeleteNotification()

  // State filters
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all")
  const [page, setPage] = useState(1)
  const pageSize = 8

  const handleRowClick = (notif: Notification) => {
    if (!notif.isRead) {
      markReadMutation.mutate({ id: notif.id, role: "admin" })
    }
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    markReadMutation.mutate({ id, role: "admin" })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteMutation.mutate({ id, role: "admin" })
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate({ role: "admin" })
  }

  // Filter list
  const filteredList = notifications.filter((notif) => {
    // Search filter
    const matchesSearch =
      notif.title.toLowerCase().includes(search.toLowerCase()) ||
      notif.description.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    // Type filter
    if (filterType !== "all" && notif.type !== filterType) return false

    // Status filter
    if (filterStatus === "unread" && notif.isRead) return false
    if (filterStatus === "read" && !notif.isRead) return false

    return true
  })

  // Pagination
  const total = filteredList.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize)

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Actions Bar */}
      <div className="gm-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Tìm kiếm tiêu đề hoặc nội dung thông báo..."
            className="gm-field h-10 w-full pl-10 pr-4 text-sm text-foreground transition placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 text-xs font-bold text-primary transition duration-200 hover:bg-primary/20 active:scale-[0.98] disabled:opacity-50"
            >
              <CheckSquare className="size-4" />
              Đọc tất cả
            </button>
          )}
        </div>
      </div>

      {/* Grid: Left Filters Bento, Right Table Bento */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Left Filters Rail */}
        <div className="gm-panel flex h-fit flex-col gap-5 p-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Trạng thái</h3>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  { id: "all", label: "Tất cả thông báo" },
                  { id: "unread", label: "Chưa đọc" },
                  { id: "read", label: "Đã đọc" },
                ] as const
              ).map((status) => (
                <button
                  key={status.id}
                  onClick={() => {
                    setFilterStatus(status.id)
                    setPage(1)
                  }}
                  className={cn(
                    "w-full rounded-full px-3 py-2 text-left text-xs font-semibold transition-all duration-200",
                    filterStatus === status.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border/60" />

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Danh mục</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setFilterType("all")
                  setPage(1)
                }}
                className={cn(
                    "w-full rounded-full px-3 py-2 text-left text-xs font-semibold transition-all duration-200",
                  filterType === "all"
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                Tất cả loại
              </button>
              {Object.keys(typeLabels).map((typeKey) => {
                const label = typeLabels[typeKey as NotificationType]
                return (
                  <button
                    key={typeKey}
                    onClick={() => {
                      setFilterType(typeKey)
                      setPage(1)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                      filterType === typeKey
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Table Panel */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="gm-panel space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="gm-panel-muted grid grid-cols-[120px_100px_1fr_80px_60px] gap-4 p-4"
                  key={index}
                >
                  <div className="h-4 animate-pulse rounded bg-muted" />
                  <div className="h-4 animate-pulse rounded bg-muted" />
                  <div className="h-4 animate-pulse rounded bg-muted" />
                  <div className="h-4 animate-pulse rounded bg-muted" />
                  <div className="h-4 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : paginatedList.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-[var(--surface-panel)] p-12 text-center shadow-[var(--shadow-soft)]">
              <Inbox className="mx-auto size-10 text-muted-foreground/60" />
              <h4 className="mt-3 text-sm font-semibold text-foreground">Không có thông báo nào</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Thử thay đổi bộ lọc bên trái hoặc điều chỉnh từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="gm-panel overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-[160px_120px_1fr_100px_80px] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Thời gian</span>
                <span>Phân loại</span>
                <span>Chi tiết thông báo</span>
                <span>Trạng thái</span>
                <span className="text-right">Hành động</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {paginatedList.map((notif) => {
                  const Icon = iconMap[notif.type] || Bell
                  const colorClass = badgeColors[notif.type] || "bg-muted text-muted-foreground border-border"

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleRowClick(notif)}
                      className={cn(
                        "group flex flex-col md:grid md:grid-cols-[160px_120px_1fr_100px_80px] gap-2 md:gap-4 items-start md:items-center px-5 py-4 cursor-pointer text-left transition duration-150",
                        notif.isRead
                          ? "bg-card/50 hover:bg-muted/15 opacity-80"
                          : "bg-card hover:bg-muted/25"
                      )}
                    >
                      {/* Time */}
                      <div className="text-xs">
                        <p className="font-semibold text-foreground">
                          {formatVnDate(notif.createdAt)}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {formatVnTime(notif.createdAt, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Type Badge */}
                      <div>
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border", colorClass)}>
                          <Icon className="size-3 shrink-0" />
                          {typeLabels[notif.type] || notif.type}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 pr-4">
                        <p className={cn("text-sm text-foreground truncate", !notif.isRead ? "font-bold" : "font-medium")}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {notif.description}
                        </p>
                      </div>

                      {/* Read Status */}
                      <div>
                        {notif.isRead ? (
                          <span className="inline-flex rounded-full bg-muted border border-border px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                            Đã đọc
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary animate-pulse">
                            Mới
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1.5 w-full md:w-auto mt-2 md:mt-0" onClick={(e) => e.stopPropagation()}>
                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkRead(e, notif.id)}
                            type="button"
                            title="Đánh dấu đã đọc"
                            className="p-1.5 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-primary hover:text-primary transition duration-150 active:scale-95"
                          >
                            <Check className="size-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notif.id)}
                          type="button"
                          title="Xóa thông báo"
                          className="p-1.5 rounded-lg border border-border hover:border-destructive/30 hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition duration-150 active:scale-95"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-border bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground font-medium">
                    Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} trong số {total} thông báo
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-[0.98] disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      type="button"
                    >
                      <ChevronLeft className="size-3.5" />
                      Trước
                    </button>
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-foreground text-xs font-bold text-background px-2">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-[0.98] disabled:opacity-40"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      type="button"
                    >
                      Sau
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
