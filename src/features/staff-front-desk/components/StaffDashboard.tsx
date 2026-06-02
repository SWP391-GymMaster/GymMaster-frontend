import Link from "next/link"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  DollarSign,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react"

import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"

const actions = [
  {
    href: staffRoutes.members,
    title: "Tìm hội viên",
    description: "Tra cứu hồ sơ, trạng thái gói và thao tác tiếp theo.",
    icon: Search,
  },
  {
    href: staffRoutes.sellPackage,
    title: "Bán gói tập",
    description: "Tạo giao dịch bán gói mới và ghi nhận thanh toán.",
    icon: CreditCard,
  },
  {
    href: staffRoutes.renewPackage,
    title: "Gia hạn gói",
    description: "Nối tiếp gói hiện có theo đúng ngày hết hạn.",
    icon: RefreshCw,
  },
  {
    href: staffRoutes.checkIn,
    title: "Check-in",
    description: "Xác minh điều kiện vào phòng trước khi xác nhận.",
    icon: ShieldCheck,
  },
]

const tasks = [
  {
    name: "Nguyen Minh Anh",
    code: "GM-101",
    label: "Gia hạn hết hạn",
    meta: "Hết hạn 2 ngày",
    priority: "Ưu tiên cao",
  },
  {
    name: "Tran Bao Long",
    code: "GM-102",
    label: "Chưa thanh toán",
    meta: "2.400.000đ",
    priority: "Ưu tiên cao",
  },
  {
    name: "Le Hoang My",
    code: "GM-103",
    label: "Chờ check-in",
    meta: "08:15 hôm nay",
    priority: "Ưu tiên trung bình",
  },
]

const activities = [
  ["10:24", "Check-in thành công", "Nguyen Minh Anh (GM-101)"],
  ["10:15", "Bán gói Premium 30", "Cho Tran Bao Long (GM-102)"],
  ["09:48", "Tạo đơn thanh toán", "2.400.000đ · Chờ thanh toán"],
  ["09:32", "Gia hạn gói Premium 30", "Cho Le Hoang My (GM-103)"],
]

export function StaffDashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Chào buổi sáng, Staff
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Bạn có 7 công việc cần xử lý hôm nay. Bắt đầu từ tra cứu hội viên,
            bán/gia hạn gói đến check-in và ghi nhận thanh toán.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <FrontDeskMetric
              helper="+8 so với hôm qua"
              icon={ShieldCheck}
              label="Check-in hôm nay"
              value="32"
            />
            <FrontDeskMetric
              helper="Trong 7 ngày tới"
              icon={CalendarClock}
              label="Gia hạn sắp đến"
              tone="warning"
              value="18"
            />
            <FrontDeskMetric
              helper="Tổng tiền 8.450.000đ"
              icon={AlertTriangle}
              label="Đơn chưa thanh toán"
              tone="danger"
              value="12"
            />
            <FrontDeskMetric
              helper="Doanh thu 22.850.000đ"
              icon={DollarSign}
              label="Gói bán hôm nay"
              tone="info"
              value="9"
            />
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Tổng quan hôm nay</p>
          <div className="mt-5 flex items-center gap-5">
            <div
              className="flex size-32 items-center justify-center rounded-full"
              style={{
                background:
                  "conic-gradient(hsl(var(--primary)) 0deg 245deg, hsl(var(--muted)) 245deg 360deg)",
              }}
            >
              <div className="flex size-24 flex-col items-center justify-center rounded-full bg-card">
                <p className="text-2xl font-semibold text-foreground">68%</p>
                <p className="text-xs text-muted-foreground">mục tiêu</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <SummaryLine label="Mục tiêu" value="50 check-in" />
              <SummaryLine label="Đã thực hiện" value="32" />
              <SummaryLine label="Còn lại" value="18" />
            </div>
          </div>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
            href={staffRoutes.checkIn}
          >
            Xem chi tiết mục tiêu →
          </Link>
        </aside>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Thao tác nhanh
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Truy cập nhanh các chức năng front-desk thường dùng.
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-primary hover:underline"
            href={staffRoutes.members}
          >
            Mở tìm kiếm
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                className="group rounded-2xl border border-border bg-background p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
                href={action.href}
                key={action.href}
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="mt-4 block font-semibold text-foreground">
                  {action.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                  {action.description}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Hôm nay cần xử lý
            </h3>
            <Link className="text-sm font-semibold text-primary hover:underline" href={staffRoutes.members}>
              Xem tất cả công việc →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-border">
            {tasks.map((task) => (
              <div className="flex flex-wrap items-center gap-4 py-4" key={task.code}>
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {task.name.split(" ").slice(-2).map((part) => part[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{task.name}</p>
                  <p className="text-sm text-muted-foreground">{task.code}</p>
                </div>
                <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                  {task.label}
                </span>
                <span className="text-sm font-medium text-muted-foreground">{task.meta}</span>
                <span className="text-xs font-semibold text-orange-600">{task.priority}</span>
                <Link
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                  href={staffRoutes.members}
                >
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Hoạt động gần đây
            </h3>
            <span className="text-sm font-semibold text-primary">Xem tất cả</span>
          </div>

          <div className="relative mt-5 space-y-5 before:absolute before:bottom-3 before:left-[4.25rem] before:top-3 before:w-px before:bg-border">
            {activities.map(([time, title, description]) => (
              <div className="grid grid-cols-[56px_24px_minmax(0,1fr)] gap-3" key={`${time}-${title}`}>
                <span className="text-sm font-medium text-muted-foreground">{time}</span>
                <span className="relative z-10 mt-1 size-3 rounded-full bg-primary ring-4 ring-card" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}

function FrontDeskMetric({
  helper,
  icon: Icon,
  label,
  tone = "success",
  value,
}: {
  helper: string
  icon: typeof Search
  label: string
  tone?: "success" | "warning" | "danger" | "info"
  value: string
}) {
  const toneClass = {
    success: "bg-primary/10 text-primary",
    warning: "bg-orange-500/10 text-orange-600",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-blue-500/10 text-blue-600",
  }[tone]

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className={`flex size-11 items-center justify-center rounded-full ${toneClass}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-primary">{helper}</p>
    </article>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}
