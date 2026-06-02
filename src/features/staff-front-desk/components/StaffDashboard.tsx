import Link from "next/link"
import { CreditCard, Search, ShieldCheck, UserPlus } from "lucide-react"

import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"

const actions = [
  {
    href: staffRoutes.members,
    title: "Tìm hội viên",
    description: "Tìm theo tên, email, số điện thoại hoặc mã hội viên.",
    icon: Search,
  },
  {
    href: staffRoutes.sellPackage,
    title: "Bán gói tập",
    description: "Tạo đơn bán gói và theo dõi trạng thái thanh toán.",
    icon: CreditCard,
  },
  {
    href: staffRoutes.checkIn,
    title: "Check-in",
    description: "Kiểm tra gói active trước khi xác nhận vào phòng tập.",
    icon: ShieldCheck,
  },
  {
    href: staffRoutes.renewPackage,
    title: "Gia hạn",
    description: "Nối gói hiện có với trạng thái thanh toán rõ ràng.",
    icon: UserPlus,
  },
]

export function StaffDashboard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Trung tâm lễ tân
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
          Từ tra cứu đến check-in mà không mất ngữ cảnh.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
          Lễ tân có thể tìm hội viên, xác nhận trạng thái, bán hoặc gia hạn gói,
          ghi thanh toán thủ công và xác thực vào phòng tập từ các workspace riêng.
        </p>
      </section>
      <section className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              className="group flex min-h-24 items-center gap-4 rounded-[1.25rem] border border-white/70 bg-white/85 p-4 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
              href={action.href}
              key={action.href}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block text-base font-semibold text-zinc-950">
                  {action.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-zinc-600">
                  {action.description}
                </span>
              </span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
