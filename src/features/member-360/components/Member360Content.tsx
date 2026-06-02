"use client"

import {
  Activity,
  Bell,
  CalendarDays,
  CreditCard,
  Dumbbell,
  RotateCcw,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Member360Data } from "@/features/member-360/types/member-360.types"
import { Member360Hero } from "@/features/member-360/components/Member360Hero"
import { MembershipSummaryCard } from "@/features/member-360/components/MembershipSummaryCard"
import { AssignedPTCard } from "@/features/member-360/components/AssignedPTCard"
import { CheckInTimeline } from "@/features/member-360/components/CheckInTimeline"
import {
  QuickActionPanel,
  getPtActions,
  getAdminActions,
  getStaffActions,
} from "@/features/member-360/components/QuickActionPanel"

type ViewContext = "pt" | "admin" | "staff"

type Member360ContentProps = {
  data?: Member360Data
  isLoading?: boolean
  error?: Error | null
  viewContext?: ViewContext
  onRetry?: () => void
}

export function Member360Content({
  data,
  isLoading,
  error,
  viewContext = "admin",
  onRetry,
}: Member360ContentProps) {
  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">{error.message}</p>
        {onRetry ? (
          <button
            className="mt-3 inline-flex min-h-10 items-center rounded-full bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:brightness-95 active:scale-[0.97]"
            onClick={onRetry}
            type="button"
          >
            Thử lại
          </button>
        ) : null}
      </div>
    )
  }

  const member = data?.member
  const membership = data?.currentMembership
  const pt = data?.assignedPT
  const checkIns = data?.recentCheckIns

  const memberId = member?.id ?? 0

  const roleActions =
    viewContext === "pt"
      ? getPtActions(memberId)
      : viewContext === "admin"
        ? getAdminActions(memberId)
        : getStaffActions()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Member 360°</span>
          <span className="mx-2">/</span>
          <span>{member?.memberCode || "Đang tải hồ sơ"}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {viewContext !== "pt" ? (
            <>
              <Button className="min-h-10 rounded-xl" type="button" variant="outline">
                <CreditCard aria-hidden="true" className="size-4" />
                Gia hạn gói
              </Button>
              <Button className="min-h-10 rounded-xl" type="button" variant="outline">
                <UserPlus aria-hidden="true" className="size-4" />
                Phân công PT
              </Button>
            </>
          ) : null}
          <Button className="min-h-10 rounded-xl bg-primary text-primary-foreground hover:brightness-95" type="button">
            <Activity aria-hidden="true" className="size-4" />
            Ghi nhận check-in
          </Button>
        </div>
      </div>

      <Member360Hero
        email={member?.email ?? ""}
        fullName={member?.fullName ?? ""}
        isLoading={isLoading}
        memberCode={member?.memberCode ?? ""}
        phone={member?.phone ?? ""}
        status={member?.status ?? "active"}
        viewContext={viewContext}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.58fr)]">
        <div className="space-y-6">
          <MembershipSummaryCard
            endDate={membership?.endDate}
            isLoading={isLoading}
            membershipStatus={membership?.status}
            packageName={membership?.packageName}
            paymentStatus={membership?.paymentStatus}
            startDate={membership?.startDate}
          />

          <CheckInTimeline entries={checkIns} isLoading={isLoading} />

          <ActivityNotesPanel isLoading={isLoading} />
        </div>

        <aside className="space-y-6">
          <AssignedPTCard
            assignedAt={pt?.assignedAt}
            fullName={pt?.fullName}
            isLoading={isLoading}
            specialty={pt?.specialty}
          />

          <MemberQuickStats isLoading={isLoading} />

          {!isLoading && memberId > 0 ? (
            <QuickActionPanel actions={roleActions} />
          ) : null}

          <MemberAttentionCard
            endDate={membership?.endDate}
            isLoading={isLoading}
            membershipStatus={membership?.status}
          />
        </aside>
      </div>
    </div>
  )
}

function MemberQuickStats({ isLoading }: { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-20 animate-pulse rounded-xl bg-muted" key={index} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Thống kê nhanh</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <QuickStat icon={Activity} label="Tổng check-in" value="32 lần" />
        <QuickStat icon={CalendarDays} label="Tuần này" value="3 lần" />
        <QuickStat icon={RotateCcw} label="Tỷ lệ tham gia" value="88%" />
        <QuickStat icon={Dumbbell} label="Buổi cùng PT" value="12 buổi" />
      </div>
    </section>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  )
}

function ActivityNotesPanel({ isLoading }: { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-14 animate-pulse rounded-xl bg-muted" key={index} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          Ghi chú & hoạt động gần đây
        </p>
        <button className="text-sm font-medium text-primary" type="button">
          Xem tất cả
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {[
          ["Tư vấn dinh dưỡng", "Tăng protein, giảm carb tinh bột buổi tối.", "Bởi Coach PT · 04/06/2026 20:15"],
          ["Phân công PT", "Coach PT được chỉ định phụ trách hội viên.", "Bởi Admin User · 01/06/2026 10:30"],
          ["Check-in bởi hệ thống", "Chi nhánh Q1 · Tầng 2", "06/06/2026 16:15"],
        ].map(([title, description, meta], index) => (
          <div className="flex gap-3" key={title}>
            <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {index === 0 ? <Bell aria-hidden="true" className="size-4" /> : <Activity aria-hidden="true" className="size-4" />}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MemberAttentionCard({
  endDate,
  isLoading,
  membershipStatus,
}: {
  endDate?: string
  isLoading?: boolean
  membershipStatus?: "Active" | "PendingPayment" | "Expired"
}) {
  if (isLoading) return null

  const isExpired = membershipStatus === "Expired"

  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
      <p className="text-sm font-semibold text-orange-900">Cần lưu ý</p>
      <div className="mt-3 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
          <CalendarDays aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-orange-950">
            {isExpired ? "Gói tập đã hết hạn" : "Theo dõi thời hạn gói tập"}
          </p>
          <p className="mt-1 text-xs text-orange-800">
            {endDate ? `Ngày kết thúc: ${formatDate(endDate)}` : "Chưa có ngày kết thúc"}
          </p>
        </div>
      </div>
    </section>
  )
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
