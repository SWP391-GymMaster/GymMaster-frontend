"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  HeartPulse,
  Mail,
  Phone,
  Scale,
  ShieldCheck,
  TrendingUp,
  UserRound,
  VenusAndMars,
} from "lucide-react"

import { StatusPill, type Status } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { formatVnDate, formatVnTime } from "@/lib/date/vn-time"
import { cn } from "@/lib/utils"
import type { QuickAction } from "@/features/member-360/components/QuickActionPanel"

export type MemberProfileContext = "admin" | "staff" | "pt" | "member"

export type MemberProfileIdentity = {
  id: number
  memberCode: string
  fullName: string
  email?: string
  phone?: string
  status: "active" | "pending" | "expired" | "locked" | "unknown"
  dateOfBirth?: string | null
  gender?: string | null
}

export type MemberProfileMembership = {
  packageName?: string
  startDate?: string
  endDate?: string
  status?: "active" | "pending_payment" | "expired" | "cancelled" | "pending" | "locked" | "unknown"
  paymentStatus?: "paid" | "pending" | "refunded" | "cancelled" | "unknown"
  supportsPT?: boolean
}

export type MemberProfileAssignedPT = {
  fullName?: string
  specialty?: string
  assignedAt?: string
}

export type MemberProfileCheckIn = {
  id: number
  checkInAt: string
  source?: string
}

export type MemberProfileStats = {
  checkInCount?: number
  workoutCount?: number
  latestWeightKg?: number | null
  latestBodyFatPct?: number | null
  progressUpdatedAt?: string | null
}

export type MemberProfileActivity = {
  id: string
  title: string
  description: string
  meta: string
  date: string
  type: "checkin" | "note" | "assignment" | "membership" | "progress"
}

type RoleAwareMemberProfileProps = {
  viewContext: MemberProfileContext
  member?: MemberProfileIdentity
  membership?: MemberProfileMembership | null
  assignedPT?: MemberProfileAssignedPT | null
  checkIns?: MemberProfileCheckIn[]
  actions?: QuickAction[]
  stats?: MemberProfileStats
  activityEvents?: MemberProfileActivity[]
  isLoading?: boolean
  isStatsLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  unavailable?: {
    title: string
    description: string
  }
}

const contextLabels: Record<MemberProfileContext, string> = {
  admin: "Hồ sơ vận hành",
  staff: "Quầy lễ tân",
  pt: "Hội viên phụ trách",
  member: "Hồ sơ của tôi",
}

const contextDescriptions: Record<MemberProfileContext, string> = {
  admin: "Tổng quan hội viên, gói tập, PT và trạng thái vận hành.",
  staff: "Kiểm tra quyền vào phòng, gói tập và thao tác tại quầy.",
  pt: "Theo dõi check-in, tiến độ và hoạt động luyện tập.",
  member: "Theo dõi gói tập, PT phụ trách và tiến độ cá nhân.",
}

export function RoleAwareMemberProfile({
  viewContext,
  member,
  membership,
  assignedPT,
  checkIns = [],
  actions = [],
  stats,
  activityEvents = [],
  isLoading,
  isStatsLoading,
  error,
  onRetry,
  unavailable,
}: RoleAwareMemberProfileProps) {
  if (error) {
    return (
      <section className="gm-panel p-6">
        <StateBlock
          description="Kiểm tra lại quyền truy cập hoặc thử tải lại hồ sơ."
          title={error.message}
          tone="error"
        />
        {onRetry ? (
          <button
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
            onClick={onRetry}
            type="button"
          >
            Thử lại
          </button>
        ) : null}
      </section>
    )
  }

  if (unavailable) {
    return (
      <section className="gm-panel p-6">
        <StateBlock
          description={unavailable.description}
          title={unavailable.title}
          tone="empty"
        />
      </section>
    )
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!member) {
    return (
      <section className="gm-panel p-6">
        <StateBlock
          description="Chọn một hội viên hợp lệ hoặc quay lại danh sách để tìm hồ sơ khác."
          title="Không có dữ liệu hồ sơ."
          tone="empty"
        />
      </section>
    )
  }

  const safeMembership = membership ?? null

  return (
    <div className="space-y-6" data-testid={`member-profile-${viewContext}`}>
      <ProfileHero
        member={member}
        membership={safeMembership}
        viewContext={viewContext}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-6">
          <LifecycleGrid
            checkIns={checkIns}
            isStatsLoading={isStatsLoading}
            membership={safeMembership}
            stats={stats}
            viewContext={viewContext}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <CheckInRhythmCard checkIns={checkIns} />
            <ProgressSnapshotCard
              isLoading={isStatsLoading}
              stats={stats}
              viewContext={viewContext}
            />
          </div>

          <ActivityTimeline events={activityEvents} />
        </main>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <ActionRail actions={actions} viewContext={viewContext} />
          <AssignedTrainerPanel assignedPT={assignedPT} viewContext={viewContext} />
          <ProfileFactsPanel member={member} />
        </aside>
      </div>
    </div>
  )
}

function ProfileHero({
  member,
  membership,
  viewContext,
}: {
  member: MemberProfileIdentity
  membership: MemberProfileMembership | null
  viewContext: MemberProfileContext
}) {
  const initials = getInitials(member.fullName)
  const status = toStatus(member.status)

  return (
    <section className="gm-panel relative overflow-hidden p-5 md:p-6">
      <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-primary/5 to-transparent" />

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid size-24 shrink-0 place-items-center rounded-[2rem] border border-primary/20 bg-primary/10 text-2xl font-semibold text-primary shadow-[var(--shadow-soft)] md:size-28">
            {initials || <UserRound aria-hidden="true" className="size-10" />}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {contextLabels[viewContext]}
              </span>
              <StatusPill status={status} />
              {membership?.paymentStatus ? (
                <StatusPill status={toStatus(membership.paymentStatus)} />
              ) : null}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {member.fullName}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {contextDescriptions[viewContext]}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-card px-3 py-1 font-semibold text-foreground">
                {member.memberCode || `#${member.id}`}
              </span>
              {member.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone aria-hidden="true" className="size-4" />
                  {member.phone}
                </span>
              ) : null}
              {member.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail aria-hidden="true" className="size-4" />
                  {member.email}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <HeroMetric
            icon={ShieldCheck}
            label="Gói hiện tại"
            value={membership?.packageName ?? "Chưa có"}
          />
          <HeroMetric
            icon={CalendarDays}
            label="Hết hạn"
            value={membership?.endDate ? formatShortDate(membership.endDate) : "Chưa có"}
          />
          <HeroMetric
            icon={Dumbbell}
            label="PT"
            value={membership?.supportsPT ? "Có PT" : "Theo gói"}
          />
        </div>
      </div>
    </section>
  )
}

function LifecycleGrid({
  membership,
  checkIns,
  stats,
  isStatsLoading,
  viewContext,
}: {
  membership: MemberProfileMembership | null
  checkIns: MemberProfileCheckIn[]
  stats?: MemberProfileStats
  isStatsLoading?: boolean
  viewContext: MemberProfileContext
}) {
  const latestCheckIn = getLatestCheckIn(checkIns)

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <LifecycleCard
        icon={ShieldCheck}
        label="Quyền vào phòng"
        status={toStatus(membership?.status)}
        value={accessLabel(membership?.status)}
      />
      <LifecycleCard
        icon={Clock3}
        label="Check-in gần nhất"
        value={latestCheckIn ? formatDateTime(latestCheckIn.checkInAt) : "Chưa có"}
      />
      <LifecycleCard
        icon={Scale}
        label="Cân nặng"
        value={
          isStatsLoading
            ? "Đang tải"
            : stats?.latestWeightKg
              ? `${stats.latestWeightKg} kg`
              : viewContext === "staff"
                ? "Không khả dụng"
                : "Chưa đo"
        }
      />
      <LifecycleCard
        icon={HeartPulse}
        label="Tỷ lệ mỡ"
        value={
          isStatsLoading
            ? "Đang tải"
            : stats?.latestBodyFatPct !== undefined && stats?.latestBodyFatPct !== null
              ? `${stats.latestBodyFatPct}%`
              : viewContext === "staff"
                ? "Không khả dụng"
                : "Chưa đo"
        }
      />
    </section>
  )
}

function CheckInRhythmCard({ checkIns }: { checkIns: MemberProfileCheckIn[] }) {
  const visible = [...checkIns]
    .sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime())
    .slice(0, 5)

  return (
    <section className="gm-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Nhịp check-in</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {checkIns.length ? `${checkIns.length} lượt đã ghi nhận` : "Chưa có lượt vào phòng"}
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Activity aria-hidden="true" className="size-5" />
        </span>
      </div>

      {visible.length ? (
        <div className="mt-5 space-y-3">
          {visible.map((entry, index) => (
            <div
              className="gm-panel-muted flex items-center gap-3 p-3"
              key={entry.id}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border",
                  index === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/25 bg-primary/10 text-primary",
                )}
              >
                <CheckCircle2 aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {formatTime(entry.checkInAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDay(entry.checkInAt)}
                </p>
              </div>
              <span className="rounded-full bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {entry.source === "front-desk" ? "Lễ tân" : "Ứng dụng"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <StateBlock
          className="mt-5"
          description="Khi hội viên check-in, lịch sử gần đây sẽ xuất hiện tại đây."
          title="Chưa có check-in"
          tone="empty"
        />
      )}
    </section>
  )
}

function ProgressSnapshotCard({
  stats,
  isLoading,
  viewContext,
}: {
  stats?: MemberProfileStats
  isLoading?: boolean
  viewContext: MemberProfileContext
}) {
  const hasProgress =
    stats?.latestWeightKg !== undefined ||
    stats?.latestBodyFatPct !== undefined ||
    Boolean(stats?.progressUpdatedAt)

  return (
    <section className="gm-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Tiến độ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cân nặng, body fat và giáo án liên quan.
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <TrendingUp aria-hidden="true" className="size-5" />
        </span>
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-24 animate-pulse rounded-[1.25rem] bg-muted" key={index} />
          ))}
        </div>
      ) : hasProgress || viewContext !== "staff" ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ProgressMetric
            label="Cân nặng"
            value={stats?.latestWeightKg ? `${stats.latestWeightKg} kg` : "Chưa đo"}
          />
          <ProgressMetric
            label="Body fat"
            value={
              stats?.latestBodyFatPct !== undefined && stats.latestBodyFatPct !== null
                ? `${stats.latestBodyFatPct}%`
                : "Chưa đo"
            }
          />
          <ProgressMetric
            label="Giáo án"
            value={
              stats?.workoutCount !== undefined
                ? `${stats.workoutCount} giáo án`
                : "Chưa có"
            }
          />
        </div>
      ) : (
        <StateBlock
          className="mt-5"
          description="Staff chỉ xem dữ liệu phục vụ vận hành tại quầy."
          title="Tiến độ không khả dụng cho vai trò này"
          tone="empty"
        />
      )}

      {stats?.progressUpdatedAt ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Cập nhật gần nhất {formatShortDate(stats.progressUpdatedAt)}
        </p>
      ) : null}
    </section>
  )
}

function ActivityTimeline({ events }: { events: MemberProfileActivity[] }) {
  const visible = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  return (
    <section className="gm-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Hoạt động gần đây</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check-in, PT, ghi chú và thay đổi quan trọng.
          </p>
        </div>
      </div>

      {visible.length ? (
        <div className="mt-5 space-y-4">
          {visible.map((event) => (
            <div className="flex gap-3" key={event.id}>
              <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <EventIcon type={event.type} />
              </span>
              <div className="min-w-0 flex-1 rounded-[1.25rem] border border-border/70 bg-[var(--surface-panel-muted)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  <span className="text-xs text-muted-foreground">{event.meta}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StateBlock
          className="mt-5"
          description="Các sự kiện mới sẽ xuất hiện khi hệ thống ghi nhận check-in, ghi chú hoặc phân công PT."
          title="Chưa có hoạt động gần đây"
          tone="empty"
        />
      )}
    </section>
  )
}

function ActionRail({
  actions,
  viewContext,
}: {
  actions: QuickAction[]
  viewContext: MemberProfileContext
}) {
  return (
    <section className="gm-panel p-5">
      <div>
        <p className="text-sm font-semibold text-foreground">Hành động</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo quyền {contextLabels[viewContext].toLowerCase()}.
        </p>
      </div>

      <div className="mt-4 grid gap-2">
        {actions.length ? (
          actions.map((action, index) => {
            const Icon = action.icon
            const primary = index === 0

            return (
              <Link
                className={cn(
                  "group flex min-h-14 items-center gap-3 rounded-[1.25rem] border p-3 text-sm font-semibold transition-[transform,box-shadow,border-color,background-color] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.98]",
                  primary
                    ? "border-primary/30 bg-primary text-primary-foreground shadow-[0_14px_34px_color-mix(in_oklch,var(--primary)_20%,transparent)] hover:brightness-95"
                    : "border-border/80 bg-[var(--surface-panel-muted)] text-foreground hover:border-primary/30 hover:bg-primary/10",
                )}
                href={action.href}
                key={`${action.href}-${action.label}`}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full",
                    primary ? "bg-primary-foreground/18" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{action.label}</span>
                  {action.description ? (
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-xs font-medium",
                        primary ? "text-primary-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      {action.description}
                    </span>
                  ) : null}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 transition group-hover:translate-x-0.5"
                />
              </Link>
            )
          })
        ) : (
          <StateBlock
            description="Vai trò hiện tại không có thao tác nhanh trên hồ sơ này."
            title="Không có hành động"
            tone="empty"
          />
        )}
      </div>
    </section>
  )
}

function AssignedTrainerPanel({
  assignedPT,
  viewContext,
}: {
  assignedPT?: MemberProfileAssignedPT | null
  viewContext: MemberProfileContext
}) {
  return (
    <section className="gm-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">PT phụ trách</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {viewContext === "staff"
              ? "Thông tin PT không nằm trong hồ sơ tại quầy."
              : "Theo dõi người phụ trách luyện tập."}
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Dumbbell aria-hidden="true" className="size-5" />
        </span>
      </div>

      {assignedPT?.fullName ? (
        <div className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-full bg-card text-primary">
              <Dumbbell aria-hidden="true" className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {assignedPT.fullName}
              </p>
              {assignedPT.specialty ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {assignedPT.specialty}
                </p>
              ) : null}
            </div>
          </div>
          {assignedPT.assignedAt ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Phân công {formatShortDate(assignedPT.assignedAt)}
            </p>
          ) : null}
        </div>
      ) : (
        <StateBlock
          className="mt-5"
          description={
            viewContext === "staff"
              ? "Staff vẫn có thể xử lý gói tập và check-in mà không cần dữ liệu PT."
              : "Admin có thể phân công PT khi hội viên cần huấn luyện cá nhân."
          }
          title={viewContext === "staff" ? "Không hiển thị cho Staff" : "Chưa có PT"}
          tone="empty"
        />
      )}
    </section>
  )
}

function ProfileFactsPanel({ member }: { member: MemberProfileIdentity }) {
  return (
    <section className="gm-panel p-5">
      <p className="text-sm font-semibold text-foreground">Thông tin cá nhân</p>
      <div className="mt-4 grid gap-3">
        <FactRow icon={VenusAndMars} label="Giới tính" value={genderLabel(member.gender)} />
        <FactRow icon={CalendarDays} label="Tuổi" value={ageLabel(member.dateOfBirth)} />
        <FactRow icon={Mail} label="Email" value={member.email || "Chưa cập nhật"} />
        <FactRow icon={Phone} label="SĐT" value={member.phone || "Chưa cập nhật"} />
      </div>
    </section>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <section className="gm-panel p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="size-28 animate-pulse rounded-[2rem] bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-10 w-72 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-32 animate-pulse rounded-[1.5rem] bg-muted" key={index} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-[1.5rem] bg-muted" />
            <div className="h-80 animate-pulse rounded-[1.5rem] bg-muted" />
          </div>
        </div>
        <div className="h-96 animate-pulse rounded-[1.5rem] bg-muted" />
      </div>
    </div>
  )
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="gm-panel-muted p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-3 truncate text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

function LifecycleCard({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: LucideIcon
  label: string
  value: string
  status?: Status
}) {
  return (
    <article className="gm-panel p-4 transition-[transform,box-shadow,border-color] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/25">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        {status ? <StatusPill className="min-h-7 px-2.5 text-xs" status={status} /> : null}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">{value}</p>
    </article>
  )
}

function ProgressMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="gm-panel-muted p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function FactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="gm-panel-muted flex items-center gap-3 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function EventIcon({ type }: { type: MemberProfileActivity["type"] }) {
  if (type === "checkin") return <CheckCircle2 aria-hidden="true" className="size-4" />
  if (type === "assignment") return <Dumbbell aria-hidden="true" className="size-4" />
  if (type === "progress") return <TrendingUp aria-hidden="true" className="size-4" />
  if (type === "membership") return <ShieldCheck aria-hidden="true" className="size-4" />
  return <Activity aria-hidden="true" className="size-4" />
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function toStatus(status?: string | null): Status {
  switch (status) {
    case "active":
    case "paid":
    case "pending":
    case "pending_payment":
    case "expired":
    case "failed":
    case "refunded":
    case "checked-in":
    case "assigned":
    case "locked":
    case "cancelled":
    case "inactive":
      return status
    default:
      return "unknown"
  }
}

function accessLabel(status?: string) {
  if (status === "active") return "Được vào phòng"
  if (status === "pending" || status === "pending_payment") return "Chờ thanh toán"
  if (status === "expired") return "Cần gia hạn"
  if (status === "locked") return "Đang khóa"
  if (status === "cancelled") return "Đã hủy"
  return "Chưa xác định"
}

function genderLabel(gender?: string | null) {
  switch (gender?.toLowerCase()) {
    case "male":
      return "Nam"
    case "female":
      return "Nữ"
    case "other":
      return "Khác"
    default:
      return "Chưa cập nhật"
  }
}

function ageLabel(dateOfBirth?: string | null) {
  if (!dateOfBirth) return "Chưa cập nhật"
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return "Chưa cập nhật"
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDiff = now.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1
  }
  return age >= 0 && age < 150 ? `${age}` : "Chưa cập nhật"
}

function getLatestCheckIn(checkIns: MemberProfileCheckIn[]) {
  return [...checkIns].sort(
    (a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime(),
  )[0]
}

function formatShortDate(dateStr?: string | null) {
  if (!dateStr) return ""
  return formatVnDate(dateStr, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDay(dateStr: string) {
  return formatVnDate(dateStr, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  })
}

function formatTime(dateStr: string) {
  return formatVnTime(dateStr, { hour: "2-digit", minute: "2-digit" })
}

function formatDateTime(dateStr: string) {
  return formatVnDate(dateStr, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
