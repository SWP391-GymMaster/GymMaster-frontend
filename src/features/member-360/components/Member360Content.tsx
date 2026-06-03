"use client"

import {
  Activity,
  Bell,
  CalendarDays,
  CreditCard,
  Dumbbell,
  UserPlus,
  Scale,
  Percent,
} from "lucide-react"

import { useMemberProgress } from "@/features/member-progress-tracking/api/member-progress.queries"
import { useMemberCheckIns } from "@/features/billing/api/billing.queries"
import { useMemberWorkoutPlans, useMemberTrainerNotes } from "@/features/pt-training/api/pt-training.queries"

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

          <ActivityNotesPanel memberId={memberId} pt={pt} isLoading={isLoading} />
        </div>

        <aside className="space-y-6">
          <AssignedPTCard
            assignedAt={pt?.assignedAt}
            fullName={pt?.fullName}
            isLoading={isLoading}
            specialty={pt?.specialty}
          />

          <MemberQuickStats memberId={memberId} isLoading={isLoading} />

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

function MemberQuickStats({
  memberId,
  isLoading,
}: {
  memberId: number
  isLoading?: boolean
}) {
  const progressQuery = useMemberProgress(memberId || null)
  const checkinsQuery = useMemberCheckIns(memberId || null)
  const workoutsQuery = useMemberWorkoutPlans(memberId || null)

  const progressEntries = progressQuery.data ?? []
  const checkinsCount = checkinsQuery.data?.length ?? 0
  const workoutsCount = workoutsQuery.data?.length ?? 0

  const isStatsLoading =
    isLoading ||
    progressQuery.isLoading ||
    checkinsQuery.isLoading ||
    workoutsQuery.isLoading

  if (isStatsLoading) {
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

  // Sort by date descending
  const sorted = [...progressEntries].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  )
  const latest = sorted[0]
  const weightVal = latest ? `${latest.weightKg} kg` : "Chưa đo"
  const fatVal =
    latest?.bodyFatPct !== undefined && latest.bodyFatPct !== null
      ? `${latest.bodyFatPct}%`
      : "—"

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Thống kê nhanh</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <QuickStat icon={Activity} label="Tổng check-in" value={`${checkinsCount} lần`} />
        <QuickStat icon={Dumbbell} label="Buổi cùng PT" value={`${workoutsCount} buổi`} />
        <QuickStat icon={Scale} label="Cân nặng" value={weightVal} />
        <QuickStat icon={Percent} label="Tỷ lệ mỡ" value={fatVal} />
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

function ActivityNotesPanel({
  memberId,
  pt,
  isLoading,
}: {
  memberId: number
  pt?: Member360Data["assignedPT"]
  isLoading?: boolean
}) {
  const checkinsQuery = useMemberCheckIns(memberId || null)
  const notesQuery = useMemberTrainerNotes(memberId || null)

  const isPanelLoading = isLoading || checkinsQuery.isLoading || notesQuery.isLoading

  if (isPanelLoading) {
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

  type TimelineEvent = {
    id: string
    title: string
    description: string
    meta: string
    date: string
    type: "checkin" | "note" | "assignment"
  }

  const events: TimelineEvent[] = []

  if (checkinsQuery.data) {
    checkinsQuery.data.forEach((ci) => {
      const formattedDate = new Date(ci.checkInAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      events.push({
        id: `checkin-${ci.id}`,
        title: "Check-in hệ thống",
        description: ci.source === "front-desk" ? "Check-in thành công tại quầy lễ tân." : "Tự check-in thành công qua ứng dụng.",
        meta: formattedDate,
        date: ci.checkInAt,
        type: "checkin",
      })
    })
  }

  if (notesQuery.data) {
    notesQuery.data.forEach((note) => {
      const formattedDate = new Date(note.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      events.push({
        id: `note-${note.id}`,
        title: "Ghi chú huấn luyện",
        description: note.content,
        meta: `Bởi PT · ${formattedDate}`,
        date: note.createdAt,
        type: "note",
      })
    })
  }

  if (pt) {
    const formattedDate = new Date(pt.assignedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    events.push({
      id: `assignment-${pt.id}`,
      title: "Phân công PT",
      description: `Huấn luyện viên ${pt.fullName} được chỉ định phụ trách hội viên.`,
      meta: `Hệ thống · ${formattedDate}`,
      date: pt.assignedAt,
      type: "assignment",
    })
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          Ghi chú & hoạt động gần đây
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">Chưa ghi nhận hoạt động nào.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {events.map((evt) => (
            <div className="flex gap-3" key={evt.id} data-testid={`timeline-event-${evt.type}`}>
              <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {evt.type === "note" ? (
                  <Bell aria-hidden="true" className="size-4" />
                ) : evt.type === "assignment" ? (
                  <UserPlus aria-hidden="true" className="size-4" />
                ) : (
                  <Activity aria-hidden="true" className="size-4" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{evt.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{evt.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{evt.meta}</p>
              </div>
            </div>
          ))}
        </div>
      )}
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
