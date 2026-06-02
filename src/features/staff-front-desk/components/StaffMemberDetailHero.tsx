"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"
import { useStaffMemberDetail } from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"
import { toStatusPillStatus } from "@/features/staff-front-desk/utils/staff-status"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function StaffMemberDetailHero() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const detail = useStaffMemberDetail(Number.isFinite(memberId) ? memberId : null)
  const error = detail.error ? mapStaffOperationError(detail.error) : null

  if (detail.isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <StateBlock
          description="Đang tải gói hội viên, thanh toán và check-in gần đây."
          title="Đang tải chi tiết hội viên..."
          tone="loading"
        />
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <StateBlock
          description="Quay lại tìm hội viên hoặc thử lại sau khi kiểm tra mã hội viên."
          title={error.message}
          tone="error"
        />
      </section>
    )
  }

  if (!detail.data) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <StateBlock
          description="Quay lại tìm hội viên và chọn một hồ sơ hợp lệ."
          title="Không thể tải chi tiết hội viên."
          tone="empty"
        />
      </section>
    )
  }

  const { member, currentMembership, recentCheckIns } = detail.data

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {initials(member.fullName)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                  {member.fullName}
                </h2>
                <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
                {currentMembership?.paymentStatus ? (
                  <StatusPill status={currentMembership.paymentStatus} />
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {member.memberCode} · Hồ sơ hội viên tại quầy lễ tân
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Phone aria-hidden="true" className="size-4" />
                  {member.phone}
                </span>
                <span className="flex items-center gap-2">
                  <Mail aria-hidden="true" className="size-4" />
                  {member.email}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  Hết hạn: {currentMembership?.endsAt ?? "Chưa có kỳ active"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
            <DetailMetric label="Gói tập" value={currentMembership?.packageName ?? "Chưa có"} />
            <DetailMetric label="Thanh toán" value={currentMembership?.paymentStatus ?? "N/A"} />
            <DetailMetric label="Check-in" value={member.lastCheckInAt ?? "Chưa có"} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Tổng quan hội viên</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InfoTile icon={CreditCard} label="Gói hiện tại" value={currentMembership?.packageName ?? "Chưa có"} />
            <InfoTile icon={ShieldCheck} label="Quyền vào phòng" value={member.membershipStatus === "active" ? "Được vào" : "Cần xử lý"} />
            <InfoTile icon={CheckCircle2} label="Check-in gần nhất" value={member.lastCheckInAt ?? "Chưa có"} />
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Thao tác tiếp theo</h3>
          <div className="mt-4 grid gap-3">
            <Link
              className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.97]"
              href={staffRoutes.checkIn}
            >
              Check-in hội viên
            </Link>
            <Link
              className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.97]"
              href={staffRoutes.sellPackage}
            >
              Bán gói tập
            </Link>
            <Link
              className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.97]"
              href={staffRoutes.renewPackage}
            >
              Gia hạn gói
            </Link>
          </div>
        </aside>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Check-in gần đây</p>
        {recentCheckIns.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {recentCheckIns.slice(-6).map((checkin) => (
              <div className="rounded-xl border border-border bg-background p-4" key={checkin.id}>
                <p className="text-sm font-semibold text-foreground">Check-in thành công</p>
                <p className="mt-1 text-sm text-muted-foreground">{checkin.checkInAt}</p>
              </div>
            ))}
          </div>
        ) : (
          <StateBlock
            className="mt-4"
            description="Check-in gần đây của lễ tân sẽ hiển thị sau khi xác nhận vào phòng tập."
            title="Chưa có lượt check-in."
            tone="empty"
          />
        )}
      </section>
    </div>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
