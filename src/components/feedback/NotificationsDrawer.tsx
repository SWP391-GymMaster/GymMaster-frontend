"use client";

import { X, Bell, UserCheck, ShieldAlert, Award, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "checkin" | "payment" | "alert" | "system";
}

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Hội viên Check-in thành công",
    description: "Lâm Minh Anh (Gói Premium 30 ngày) vừa check-in tại quầy chính.",
    time: "3 phút trước",
    type: "checkin",
  },
  {
    id: "2",
    title: "Đăng ký giáo án tập luyện mới",
    description: "HLV Phạm Quốc Thái vừa gửi giáo án mới cho hội viên Trần Văn Long.",
    time: "25 phút trước",
    type: "system",
  },
  {
    id: "3",
    title: "Thanh toán thành công",
    description: "Đã xác nhận hóa đơn #INV-9281 của hội viên Hoàng Lan Chi (2.400.000 đ).",
    time: "1 giờ trước",
    type: "payment",
  },
  {
    id: "4",
    title: "Nhắc nhở phân công PT",
    description: "Hội viên mới Nguyễn Thị Mai đang chờ chỉ định PT đồng hành.",
    time: "3 giờ trước",
    type: "alert",
  },
];

const iconMap = {
  checkin: UserCheck,
  payment: Award,
  alert: ShieldAlert,
  system: Calendar,
};

const badgeColors = {
  checkin: "bg-emerald-500/10 text-emerald-500",
  payment: "bg-amber-500/10 text-amber-500",
  alert: "bg-destructive/10 text-destructive",
  system: "bg-blue-500/10 text-blue-500",
};

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
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
              <div className="h-full flex flex-col bg-card border-l border-border shadow-2xl p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Bell className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Thông báo vận hành
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Các hoạt động diễn ra trong hôm nay
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    type="button"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Notification items */}
                <div className="flex-1 py-4 flex flex-col gap-3 overflow-y-auto">
                  {mockNotifications.map((notif) => {
                    const Icon = iconMap[notif.type];
                    return (
                      <div
                        key={notif.id}
                        className="flex items-start gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/30 transition-all duration-200"
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${badgeColors[notif.type]}`}>
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {notif.description}
                          </p>
                          <span className="text-[10px] font-semibold text-muted-foreground/60 mt-2 block">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer action */}
                <div className="border-t pt-4 mt-auto">
                  <button
                    onClick={onClose}
                    type="button"
                    className="w-full rounded-xl py-3 text-center text-sm font-semibold border hover:bg-muted/40 transition active:scale-[0.98]"
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
