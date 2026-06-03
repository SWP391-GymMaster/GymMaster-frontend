"use client"

import Link from "next/link"
import { ArrowLeft, LayoutDashboard, LockKeyhole } from "lucide-react"

type PermissionDeniedProps = {
  dashboardPath?: string
}

export function PermissionDenied({ dashboardPath }: PermissionDeniedProps) {
  return (
    <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden bg-background px-6 py-12 text-center text-foreground">
      <div className="relative z-10 w-full max-w-xl rounded-[1.5rem] border border-border bg-card p-8 shadow-[0_16px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <LockKeyhole aria-hidden="true" className="size-10 text-destructive" />
        </div>
        <div className="mb-4 inline-flex rounded-full border border-border bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
          Quyền truy cập bị giới hạn
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Bạn không có quyền truy cập khu vực này.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Tài khoản của bạn đã đăng nhập, nhưng khu vực này thuộc vai trò khác.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
            type="button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Quay lại
          </button>
          {dashboardPath ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
              href={dashboardPath}
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              Về dashboard của tôi
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

