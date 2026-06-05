"use client";

import { X, Bell, UserCheck, ShieldAlert, Award, Calendar, Dumbbell, FileText, Check, Trash2, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSessionStore } from "@/features/auth/session/auth-session";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/features/notifications/api/notifications.queries";
import type { Notification, NotificationType } from "@/features/notifications/types";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const iconMap = {
  checkin: UserCheck,
  payment: Award,
  alert: ShieldAlert,
  system: Calendar,
  workout: Dumbbell,
  note: FileText,
};

const badgeColors = {
  checkin: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  payment: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  alert: "bg-destructive/10 text-destructive border-destructive/20",
  system: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  workout: "bg-lime-500/10 text-lime-500 border-lime-500/20",
  note: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const typeLabels: Record<NotificationType, string> = {
  checkin: "Check-in",
  payment: "Thanh toán",
  alert: "Cảnh báo",
  system: "Hệ thống",
  workout: "Giáo án",
  note: "Ghi chú",
};

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const router = useRouter();
  const role = useAuthSessionStore((state) => state.session?.role) || "member";
  
  const { data: notifications = [], isLoading, isError } = useNotifications(role);
  
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  // Filter States
  const [filterStatus, setFilterStatus] = useState<"all" | "unread">("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Prevent body scrolling when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      markReadMutation.mutate({ id: notif.id, role });
    }
    if (notif.link) {
      router.push(notif.link);
      onClose();
    }
  };

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markReadMutation.mutate({ id, role });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate({ id, role });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate({ role });
  };

  // Filter list
  const filteredNotifications = notifications.filter((notif) => {
    if (filterStatus === "unread" && notif.isRead) return false;
    if (filterType !== "all" && notif.type !== filterType) return false;
    return true;
  });

  // Unique types present in user's notifications for type filters
  const availableTypes = Array.from(new Set(notifications.map((n) => n.type)));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-sm"
            >
              <div className="h-full flex flex-col bg-card border-l border-border shadow-2xl p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/70">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Bell className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Thông báo vai trò
                      </h2>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        Khu vực {role === "admin" ? "Quản trị" : role === "staff" ? "Lễ tân" : role === "pt" ? "HLV" : "Hội viên"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    type="button"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Filters Row */}
                <div className="py-3 border-b border-border/70 flex flex-col gap-2">
                  <div className="flex gap-1.5 bg-muted/50 p-1 rounded-xl">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                        filterStatus === "all"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Tất cả ({notifications.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus("unread")}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                        filterStatus === "unread"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Chưa đọc ({notifications.filter((n) => !n.isRead).length})
                    </button>
                  </div>

                  {/* Category Chips Scrollable */}
                  {availableTypes.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none mask-image-horizontal">
                      <button
                        onClick={() => setFilterType("all")}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition shrink-0 ${
                          filterType === "all"
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted/30 border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        Tất cả loại
                      </button>
                      {availableTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition shrink-0 ${
                            filterType === type
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-muted/30 border-border hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {typeLabels[type as NotificationType] || type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notification items */}
                <div className="flex-1 py-4 flex flex-col gap-3 overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                      <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <p className="text-xs text-muted-foreground mt-3">Đang tải thông báo...</p>
                    </div>
                  ) : isError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-2xl border-destructive/20 bg-destructive/5">
                      <ShieldAlert className="size-8 text-destructive animate-pulse" />
                      <h4 className="font-semibold text-sm mt-3 text-destructive">Lỗi tải thông báo</h4>
                      <p className="text-xs text-muted-foreground mt-1">Không thể lấy dữ liệu từ hệ thống. Thử lại sau.</p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                      <div className="p-4 rounded-full bg-muted/40 mb-3">
                        <Inbox className="size-8 text-muted-foreground/55" />
                      </div>
                      <p className="font-medium text-sm">Không có thông báo nào</p>
                      <p className="text-xs text-muted-foreground/80 mt-1 max-w-[200px]">
                        {filterStatus === "unread" ? "Tất cả thông báo đã được đọc sạch sẽ." : "Danh sách trống."}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const Icon = iconMap[notif.type] || Calendar;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`group flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                            notif.isRead
                              ? "bg-card/50 border-border/50 hover:bg-muted/30 opacity-75"
                              : "bg-card border-border hover:border-primary/30 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 border ${badgeColors[notif.type] || "bg-muted border-border"}`}>
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className={`text-sm text-foreground leading-snug ${notif.isRead ? "font-medium" : "font-bold"}`}>
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {notif.description}
                            </p>
                            <div className="flex items-center justify-between mt-2.5">
                              <span className="text-[10px] font-semibold text-muted-foreground/60">
                                {new Date(notif.createdAt).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - {new Date(notif.createdAt).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </span>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {!notif.isRead && (
                                  <button
                                    onClick={(e) => handleMarkRead(e, notif.id)}
                                    type="button"
                                    title="Đánh dấu đã đọc"
                                    className="p-1 rounded hover:bg-primary/10 text-primary hover:text-primary transition"
                                  >
                                    <Check className="size-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleDelete(e, notif.id)}
                                  type="button"
                                  title="Xóa thông báo"
                                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer action */}
                <div className="border-t border-border/70 pt-4 mt-auto flex gap-2">
                  {notifications.some((n) => !n.isRead) && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markAllReadMutation.isPending}
                      type="button"
                      className="flex-1 rounded-xl py-2.5 text-center text-xs font-bold border border-primary text-primary hover:bg-primary/5 transition disabled:opacity-50 active:scale-[0.98]"
                    >
                      Đọc tất cả
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    type="button"
                    className="flex-1 rounded-xl py-2.5 text-center text-xs font-semibold border hover:bg-muted/40 transition active:scale-[0.98]"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
