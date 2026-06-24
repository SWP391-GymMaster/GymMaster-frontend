"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"

import { useAuthSessionStore } from "@/features/auth/session/auth-session"

type MembershipGateProps = {
  children: ReactNode
}

/**
 * Cong khoa tinh nang hoi vien.
 * User role "member" nhung CHUA co ho so hoi vien (chua dang ky/mua goi) ->
 * hien man "can dang ky goi de mo khoa" thay vi trang loi/trong.
 * Cac role khac (admin/staff/pt) di qua binh thuong.
 */
export function MembershipGate({ children }: MembershipGateProps) {
  const role = useAuthSessionStore((state) => state.session?.role)
  const memberProfileId = useAuthSessionStore(
    (state) => state.session?.user?.memberProfileId,
  )

  if (role === "member" && !memberProfileId) {
    return (
      <div className="flex min-h-[22rem] items-center justify-center">
        <div className="w-full max-w-md rounded-[1.5rem] border border-border/70 bg-card/75 p-8 text-center shadow-sm backdrop-blur">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </span>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
            Mở khóa tính năng hội viên
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn chưa đăng ký gói tập nào. Đăng ký một gói để trở thành hội viên
            và mở khóa nhật ký dinh dưỡng, tiến độ tập luyện, giáo án và nhiều
            tính năng khác.
          </p>
          <Link
            href="/member/membership"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
          >
            Đăng ký gói tập
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
