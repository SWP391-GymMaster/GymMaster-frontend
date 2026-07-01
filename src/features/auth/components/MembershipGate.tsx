"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Clock3, Lock } from "lucide-react"

import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"
import { StateBlock } from "@/components/feedback/StateBlock"

type MembershipGateProps = {
  children: ReactNode
  /**
   * Cho phep member CHUA co goi tap di qua (tier mien phi). Dung cho trang Nhat ky an:
   * nguoi chua mua goi van vao duoc de dung thu 20 mon dau. Backend tu gioi han 20 mon
   * va van chan quet AI (403) nen khong lo bypass bao mat. Mac dinh false -> khoa nhu cu.
   */
  allowFreeTier?: boolean
}

/**
 * Cong khoa tinh nang hoi vien.
 * User role "member" chi duoc mo khoa tinh nang khi co goi DANG HOAT DONG
 * (da thanh toan + le tan/quan ly xac nhan). Cac truong hop:
 *   - Chua co ho so (chua dang ky goi)        -> man "dang ky goi".
 *   - Co ho so nhung goi chua active           -> man "cho kich hoat" (pending/het han).
 *   - Goi active                               -> mo khoa.
 * Cac role khac (admin/staff/pt) di qua binh thuong.
 */
export function MembershipGate({ children, allowFreeTier = false }: MembershipGateProps) {
  const role = useAuthSessionStore((state) => state.session?.role)
  const memberProfileId = useAuthSessionStore(
    (state) => state.session?.user?.memberProfileId,
  )
  const isMember = role === "member"

  // Chi fetch khi la member co ho so; non-member / chua co ho so -> khong goi API.
  const { data, isLoading } = useMember360Data(
    isMember && memberProfileId ? memberProfileId : null,
  )

  // Role khac member -> di qua.
  if (!isMember) {
    return <>{children}</>
  }

  // Tier mien phi: cho member chua co goi vao dung thu (backend tu gioi han 20 mon + chan AI).
  if (allowFreeTier) {
    return <>{children}</>
  }

  // Chua co ho so hoi vien -> man dang ky goi.
  if (!memberProfileId) {
    return (
      <GateCard
        icon={<Lock className="size-6" />}
        title="Mở khóa tính năng hội viên"
        description="Bạn chưa đăng ký gói tập nào. Đăng ký một gói để trở thành hội viên và mở khóa nhật ký dinh dưỡng, tiến độ tập luyện, giáo án và nhiều tính năng khác."
        ctaLabel="Đăng ký gói tập"
      />
    )
  }

  // Dang kiem tra trang thai goi.
  if (isLoading) {
    return (
      <div className="flex min-h-[22rem] items-center justify-center">
        <StateBlock tone="loading" title="Đang kiểm tra gói tập..." />
      </div>
    )
  }

  // CHI mo khoa khi goi dang hoat dong (da thanh toan + xac nhan).
  const status = data?.currentMembership?.status
  if (status === "active") {
    return <>{children}</>
  }

  // Co ho so nhung goi chua active -> khoa, huong dan hoan tat / gia han.
  const description =
    status === "pending_payment"
      ? "Đơn đăng ký gói của bạn đang chờ thanh toán/xác nhận. Hoàn tất thanh toán (online hoặc tại quầy lễ tân) để kích hoạt và mở khóa các tính năng."
      : status === "expired"
        ? "Gói tập của bạn đã hết hạn. Gia hạn để tiếp tục dùng các tính năng hội viên."
        : "Bạn chưa có gói tập đang hoạt động. Đăng ký hoặc hoàn tất thanh toán để mở khóa các tính năng."

  return (
    <GateCard
      icon={<Clock3 className="size-6" />}
      title="Gói chưa được kích hoạt"
      description={description}
      ctaLabel="Tới trang gói tập"
    />
  )
}

function GateCard({
  icon,
  title,
  description,
  ctaLabel,
}: {
  icon: ReactNode
  title: string
  description: string
  ctaLabel: string
}) {
  return (
    <div className="flex min-h-[22rem] items-center justify-center">
      <div className="w-full max-w-md rounded-[1.5rem] border border-border/70 bg-card/75 p-8 text-center shadow-sm backdrop-blur">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Link
          href="/member/membership"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          {ctaLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
