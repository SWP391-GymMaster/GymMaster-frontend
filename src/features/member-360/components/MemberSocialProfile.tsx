"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Dumbbell,
  FileClock,
  HeartPulse,
  NotebookPen,
  Scale,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserRound,
  UtensilsCrossed,
} from "lucide-react"

import { StatusPill, type Status } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { useMemberCheckIns } from "@/features/billing/api/billing.queries"
import { useMemberProgress } from "@/features/member-progress-tracking/api/member-progress.queries"
import type { MockProgressEntry } from "@/features/member-progress-tracking/types/member-progress.types"
import type { Member360Data } from "@/features/member-360/types/member-360.types"
import {
  useMemberTrainerNotes,
  useMemberWorkoutPlans,
} from "@/features/pt-training/api/pt-training.queries"
import type { TrainerNote, WorkoutPlan } from "@/features/pt-training/types/pt-training.types"
import { gymMasterAssets } from "@/lib/gymmaster-assets"
import { cn } from "@/lib/utils"
import { formatVnDate, formatVnTime } from "@/lib/date/vn-time"

type MemberSocialProfileProps = {
  data?: Member360Data
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  unavailable?: {
    title: string
    description: string
  }
}

type FeedKind = "checkin" | "progress" | "workout" | "note" | "membership" | "coach"

type FeedItem = {
  id: string
  kind: FeedKind
  title: string
  body: string
  meta: string
  date: string
  accent?: string
}

const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "activity", label: "Hoạt động" },
  { id: "progress", label: "Tiến độ" },
  { id: "membership", label: "Gói tập" },
] as const

type ProfileTab = (typeof tabs)[number]["id"]

export function MemberSocialProfile({
  data,
  isLoading,
  error,
  onRetry,
  unavailable,
}: MemberSocialProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview")
  const member = data?.member
  const memberId = member?.id ?? null

  const progressQuery = useMemberProgress(memberId)
  const checkInsQuery = useMemberCheckIns(memberId)
  const workoutsQuery = useMemberWorkoutPlans(memberId)
  const notesQuery = useMemberTrainerNotes(memberId)

  const progressEntries = useMemo(
    () => sortByDate(progressQuery.data ?? [], "measuredAt"),
    [progressQuery.data],
  )
  const checkIns = useMemo(
    () => sortByDate(checkInsQuery.data ?? data?.recentCheckIns ?? [], "checkInAt"),
    [checkInsQuery.data, data?.recentCheckIns],
  )
  const workouts = useMemo(
    () => sortWorkouts(workoutsQuery.data ?? []),
    [workoutsQuery.data],
  )
  const notes = useMemo(
    () => sortByDate(notesQuery.data ?? [], "createdAt"),
    [notesQuery.data],
  )

  const latestProgress = progressEntries[0]
  const firstProgress = progressEntries[progressEntries.length - 1]
  const weightDelta =
    latestProgress && firstProgress && latestProgress.id !== firstProgress.id
      ? Number((firstProgress.weightKg - latestProgress.weightKg).toFixed(1))
      : null

  const feed = useMemo(
    () =>
      buildSocialFeed({
        assignedPT: data?.assignedPT,
        checkIns,
        membership: data?.currentMembership ?? null,
        notes,
        progressEntries,
        workouts,
      }),
    [checkIns, data?.assignedPT, data?.currentMembership, notes, progressEntries, workouts],
  )

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
    return <SocialProfileSkeleton />
  }

  if (!member) {
    return (
      <section className="gm-panel p-6">
        <StateBlock
          description="Tài khoản hiện tại chưa có hồ sơ hội viên để hiển thị."
          title="Không có dữ liệu hồ sơ."
          tone="empty"
        />
      </section>
    )
  }

  const membership = data?.currentMembership ?? null
  const latestWorkout = workouts[0]
  const latestNote = notes[0]
  const isStatsLoading =
    progressQuery.isLoading ||
    checkInsQuery.isLoading ||
    workoutsQuery.isLoading ||
    notesQuery.isLoading

  return (
    <div className="space-y-6" data-testid="member-social-profile">
      <SocialProfileHero
        assignedPT={data?.assignedPT ?? null}
        checkInCount={checkIns.length}
        member={member}
        membership={membership}
        weightDelta={weightDelta}
        workoutCount={workouts.length}
      />

      <nav
        aria-label="Điều hướng hồ sơ"
        className="sticky top-20 z-10 -mx-1 overflow-x-auto py-1 lg:top-24"
      >
        <div className="inline-flex min-w-full gap-2 rounded-full border border-border/80 bg-[color-mix(in_oklch,var(--surface-panel)_88%,transparent)] p-1 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:min-w-0">
          {tabs.map((tab) => (
            <button
              aria-pressed={activeTab === tab.id}
              className={cn(
                "min-h-10 flex-1 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition hover:bg-primary/10 active:scale-[0.98] sm:flex-none",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-[0_12px_28px_color-mix(in_oklch,var(--primary)_22%,transparent)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-6">
          {activeTab === "overview" ? (
            <>
              <HighlightStrip
                isLoading={isStatsLoading}
                latestProgress={latestProgress}
                latestWorkout={latestWorkout}
                membership={membership}
                nextNote={latestNote}
              />
              <FeedSection feed={feed.slice(0, 5)} title="Nhật ký gần đây" />
            </>
          ) : null}

          {activeTab === "activity" ? (
            <FeedSection
              emptyDescription="Check-in, giáo án, ghi chú PT và tiến độ sẽ xuất hiện tại đây."
              feed={feed}
              title="Hoạt động của tôi"
            />
          ) : null}

          {activeTab === "progress" ? (
            <ProgressSocialSection
              isLoading={progressQuery.isLoading}
              progressEntries={progressEntries}
              weightDelta={weightDelta}
            />
          ) : null}

          {activeTab === "membership" ? (
            <MembershipSocialSection
              assignedPT={data?.assignedPT ?? null}
              membership={membership}
            />
          ) : null}
        </main>

        <aside className="space-y-6 xl:sticky xl:top-36 xl:self-start">
          <SocialActionCard />
          <ProfileFactsCard
            member={member}
            progress={latestProgress}
            checkInCount={checkIns.length}
          />
        </aside>
      </div>
    </div>
  )
}

function SocialProfileHero({
  member,
  membership,
  assignedPT,
  checkInCount,
  workoutCount,
  weightDelta,
}: {
  member: Member360Data["member"]
  membership: Member360Data["currentMembership"] | null
  assignedPT: Member360Data["assignedPT"] | null
  checkInCount: number
  workoutCount: number
  weightDelta: number | null
}) {
  return (
    <section className="gm-panel overflow-hidden p-0">
      <div
        className="relative min-h-[260px] bg-cover bg-center md:min-h-[320px]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(7,12,10,0.15), rgba(7,12,10,0.92)), url(${gymMasterAssets.backgrounds.memberToday})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary)_30%,transparent),transparent_36%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
              <div className="grid size-28 shrink-0 place-items-center rounded-[2rem] border border-white/30 bg-white/15 text-3xl font-black text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl md:size-36 md:text-4xl">
                {getInitials(member.fullName)}
              </div>

              <div className="min-w-0 pb-1 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                    Hồ sơ của tôi
                  </span>
                  <StatusPill
                    className="border-white/20 bg-white/15 text-white"
                    label="Hội viên"
                    status="assigned"
                  />
                  {membership ? (
                    <StatusPill
                      className="border-primary/30 bg-primary text-primary-foreground"
                      label={`${membership.packageName} active`}
                      status={toStatus(membership.status)}
                    />
                  ) : null}
                </div>

                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  {member.fullName}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 md:text-base">
                  Strength days, clean meals, steady progress.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
              <SocialStat label="Check-ins" value={String(checkInCount)} />
              <SocialStat label="Giáo án" value={String(workoutCount)} />
              <SocialStat
                label="Progress"
                value={weightDelta !== null ? `${weightDelta > 0 ? "-" : "+"}${Math.abs(weightDelta)} kg` : "Mới"}
              />
              <SocialStat label="PT" value={assignedPT?.fullName ?? "Chưa có"} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-border/70 bg-[var(--surface-panel)] p-5 md:grid-cols-[1fr_auto] md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full border border-border bg-card px-3 py-1 font-semibold text-foreground">
            {member.memberCode}
          </span>
          <span>{member.phone}</span>
          <span className="hidden sm:inline">•</span>
          <span>{member.email}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <SocialHeroLink href="/member/progress" icon={TrendingUp} label="Cập nhật tiến độ" />
          <SocialHeroLink href="/member/nutrition/meal-journal" icon={UtensilsCrossed} label="Ghi bữa ăn" />
          <SocialHeroLink href="/member/workout" icon={Dumbbell} label="Xem giáo án" />
        </div>
      </div>
    </section>
  )
}

function HighlightStrip({
  membership,
  latestProgress,
  latestWorkout,
  nextNote,
  isLoading,
}: {
  membership: Member360Data["currentMembership"] | null
  latestProgress?: MockProgressEntry
  latestWorkout?: WorkoutPlan
  nextNote?: TrainerNote
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <section className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="h-32 animate-pulse rounded-[1.5rem] bg-muted" key={index} />
        ))}
      </section>
    )
  }

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <HighlightCard
        icon={CreditCard}
        label="Gói hiện tại"
        title={membership?.packageName ?? "Chưa có gói"}
        value={membership?.endDate ? `Đến ${formatShortDate(membership.endDate)}` : "Liên hệ quầy"}
      />
      <HighlightCard
        icon={Scale}
        label="Cơ thể"
        title={latestProgress ? `${latestProgress.weightKg} kg` : "Chưa ghi nhận"}
        value={latestProgress?.bodyFatPct ? `${latestProgress.bodyFatPct}% body fat` : "Cập nhật chỉ số"}
      />
      <HighlightCard
        icon={NotebookPen}
        label="PT note"
        title={nextNote ? "Có phản hồi mới" : latestWorkout?.title ?? "Giáo án"}
        value={nextNote?.content ?? latestWorkout?.title ?? "Xem buổi tập hôm nay"}
      />
    </section>
  )
}

function FeedSection({
  feed,
  title,
  emptyDescription = "Khi bạn tập luyện, check-in hoặc nhận ghi chú từ PT, nhật ký sẽ xuất hiện tại đây.",
}: {
  feed: FeedItem[]
  title: string
  emptyDescription?: string
}) {
  return (
    <section className="gm-panel p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Dòng thời gian riêng tư cho hành trình tập luyện của bạn.
          </p>
        </div>
      </div>

      {feed.length ? (
        <div className="mt-5 space-y-4">
          {feed.map((item) => (
            <FeedCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <StateBlock
          className="mt-5"
          description={emptyDescription}
          title="Chưa có hoạt động"
          tone="empty"
        />
      )}
    </section>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  const Icon = feedIcons[item.kind]

  return (
    <article className="rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel-muted)] p-4 transition-[transform,border-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-soft)]">
      <div className="flex gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[1rem] bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
            </div>
            <span className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {feedLabels[item.kind]}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
          {item.accent ? (
            <div className="mt-4 rounded-[1.25rem] border border-primary/20 bg-primary/10 p-3 text-sm font-semibold text-foreground">
              {item.accent}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ProgressSocialSection({
  progressEntries,
  weightDelta,
  isLoading,
}: {
  progressEntries: MockProgressEntry[]
  weightDelta: number | null
  isLoading?: boolean
}) {
  const latest = progressEntries[0]

  return (
    <section className="gm-panel p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">Tiến độ cơ thể</p>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
            Theo dõi cân nặng và body fat như một hành trình, không phải bảng số liệu khô.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
          href="/member/progress"
        >
          Ghi chỉ số
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-6 h-72 animate-pulse rounded-[1.5rem] bg-muted" />
      ) : latest ? (
        <>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <HighlightCard
              icon={Scale}
              label="Cân nặng mới nhất"
              title={`${latest.weightKg} kg`}
              value={formatShortDate(latest.measuredAt)}
            />
            <HighlightCard
              icon={HeartPulse}
              label="Body fat"
              title={latest.bodyFatPct ? `${latest.bodyFatPct}%` : "Chưa đo"}
              value="Không bắt buộc"
            />
            <HighlightCard
              icon={weightDelta && weightDelta > 0 ? TrendingDown : TrendingUp}
              label="Xu hướng"
              title={weightDelta !== null ? `${weightDelta > 0 ? "-" : "+"}${Math.abs(weightDelta)} kg` : "Mới bắt đầu"}
              value="So với mốc đầu"
            />
          </div>
          <MiniProgressChart entries={progressEntries} />
        </>
      ) : (
        <StateBlock
          className="mt-5"
          description="Ghi cân nặng và body fat để hồ sơ bắt đầu có đường tiến bộ riêng."
          title="Chưa có dữ liệu tiến độ"
          tone="empty"
        />
      )}
    </section>
  )
}

function MembershipSocialSection({
  membership,
  assignedPT,
}: {
  membership: Member360Data["currentMembership"] | null
  assignedPT: Member360Data["assignedPT"] | null
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="gm-panel p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-foreground">Gói tập</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Quyền sử dụng phòng tập và thời hạn hiện tại.
            </p>
          </div>
          {membership ? <StatusPill status={toStatus(membership.status)} /> : null}
        </div>
        <div className="mt-6 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-5">
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {membership?.packageName ?? "Chưa có gói"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {membership?.startDate && membership.endDate
              ? `${formatShortDate(membership.startDate)} - ${formatShortDate(membership.endDate)}`
              : "Bạn có thể mua hoặc gia hạn gói trong mục Gói tập."}
          </p>
        </div>
        <Link
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
          href="/member/membership"
        >
          Xem gói tập
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </article>

      <article className="gm-panel p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-foreground">PT phụ trách</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Người theo dõi giáo án và phản hồi kỹ thuật.
            </p>
          </div>
          <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <Dumbbell aria-hidden="true" className="size-5" />
          </span>
        </div>
        {assignedPT ? (
          <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel-muted)] p-5">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {assignedPT.fullName}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{assignedPT.specialty}</p>
            <p className="mt-4 text-xs font-semibold text-muted-foreground">
              Phân công {formatShortDate(assignedPT.assignedAt)}
            </p>
          </div>
        ) : (
          <StateBlock
            className="mt-5"
            description="Khi gói tập có PT được kích hoạt, thông tin huấn luyện viên sẽ xuất hiện ở đây."
            title="Chưa có PT phụ trách"
            tone="empty"
          />
        )}
      </article>
    </section>
  )
}

function SocialActionCard() {
  return (
    <section className="gm-panel p-5">
      <p className="text-sm font-semibold text-foreground">Hành động nhanh</p>
      <div className="mt-4 grid gap-2">
        <ActionLink href="/member/progress" icon={TrendingUp} label="Cập nhật tiến độ" />
        <ActionLink href="/member/nutrition/meal-journal" icon={UtensilsCrossed} label="Ghi bữa ăn" />
        <ActionLink href="/member/membership" icon={CreditCard} label="Gói tập của tôi" />
        <ActionLink href="/member/notes" icon={FileClock} label="Ghi chú PT" />
      </div>
    </section>
  )
}

function ProfileFactsCard({
  member,
  progress,
  checkInCount,
}: {
  member: Member360Data["member"]
  progress?: MockProgressEntry
  checkInCount: number
}) {
  return (
    <section className="gm-panel p-5">
      <p className="text-sm font-semibold text-foreground">Thông tin cá nhân</p>
      <div className="mt-4 grid gap-3">
        <FactRow label="Mã hội viên" value={member.memberCode} />
        <FactRow label="Số điện thoại" value={member.phone || "Chưa cập nhật"} />
        <FactRow label="Email" value={member.email || "Chưa cập nhật"} />
        <FactRow label="Tổng check-in" value={`${checkInCount} lượt`} />
        <FactRow
          label="Cập nhật gần nhất"
          value={progress ? formatShortDate(progress.measuredAt) : "Chưa có"}
        />
      </div>
    </section>
  )
}

function MiniProgressChart({ entries }: { entries: MockProgressEntry[] }) {
  const visible = [...entries].reverse().slice(-6)
  const weights = visible.map((entry) => entry.weightKg)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const span = Math.max(max - min, 1)

  return (
    <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-[var(--surface-panel-muted)] p-5">
      <div className="flex h-44 items-end gap-2">
        {visible.map((entry) => {
          const height = 24 + ((entry.weightKg - min) / span) * 112
          return (
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={entry.id}>
              <div
                className="w-full rounded-t-2xl bg-primary/80 shadow-[0_12px_28px_color-mix(in_oklch,var(--primary)_18%,transparent)]"
                style={{ height }}
              />
              <span className="truncate text-[10px] font-semibold text-muted-foreground">
                {formatVnDate(entry.measuredAt, { day: "2-digit", month: "2-digit" })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HighlightCard({
  icon: Icon,
  label,
  title,
  value,
}: {
  icon: LucideIcon
  label: string
  title: string
  value: string
}) {
  return (
    <article className="gm-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-[1rem] bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 truncate text-xl font-semibold tracking-tight text-foreground">
        {title}
      </p>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{value}</p>
    </article>
  )
}

function SocialStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/16 bg-white/12 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
      <p className="truncate text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/62">
        {label}
      </p>
    </div>
  )
}

function SocialHeroLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/10 active:scale-[0.98]"
      href={href}
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </Link>
  )
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <Link
      className="group flex min-h-13 items-center gap-3 rounded-[1.25rem] border border-border/80 bg-[var(--surface-panel-muted)] p-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/10 active:scale-[0.98]"
      href={href}
    >
      <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronRight
        aria-hidden="true"
        className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  )
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--surface-panel-muted)] px-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

function SocialProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-[360px] animate-pulse rounded-[2rem] bg-muted" />
      <div className="h-14 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-32 animate-pulse rounded-[1.5rem] bg-muted" key={index} />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-[1.5rem] bg-muted" />
        </div>
        <div className="h-96 animate-pulse rounded-[1.5rem] bg-muted" />
      </div>
    </div>
  )
}

function buildSocialFeed({
  checkIns,
  progressEntries,
  workouts,
  notes,
  membership,
  assignedPT,
}: {
  checkIns: Array<{ id: number; checkInAt: string; source?: string }>
  progressEntries: MockProgressEntry[]
  workouts: WorkoutPlan[]
  notes: TrainerNote[]
  membership: Member360Data["currentMembership"] | null
  assignedPT?: Member360Data["assignedPT"]
}) {
  const feed: FeedItem[] = []

  checkIns.slice(0, 6).forEach((checkIn) => {
    feed.push({
      id: `checkin-${checkIn.id}`,
      kind: "checkin",
      title: "Check-in phòng tập",
      body:
        checkIn.source === "front-desk"
          ? "Bạn đã được xác nhận vào phòng tại quầy lễ tân."
          : "Một lượt tập mới đã được ghi nhận vào nhật ký cá nhân.",
      meta: formatDateTime(checkIn.checkInAt),
      date: checkIn.checkInAt,
      accent: formatVnTime(checkIn.checkInAt, { hour: "2-digit", minute: "2-digit" }),
    })
  })

  progressEntries.slice(0, 4).forEach((entry) => {
    feed.push({
      id: `progress-${entry.id}`,
      kind: "progress",
      title: "Cập nhật chỉ số cơ thể",
      body: `Cân nặng ${entry.weightKg} kg${
        entry.bodyFatPct ? `, body fat ${entry.bodyFatPct}%` : ""
      }.`,
      meta: formatShortDate(entry.measuredAt),
      date: entry.measuredAt,
      accent: "Giữ nhịp nhỏ, đều và có số liệu.",
    })
  })

  workouts.slice(0, 4).forEach((workout) => {
    feed.push({
      id: `workout-${workout.id}`,
      kind: "workout",
      title: workout.title,
      body: `${workout.exercises.length} bài tập đã được PT chuẩn bị cho buổi này.`,
      meta: formatShortDate(workout.updatedAt ?? workout.createdAt ?? workout.startDate),
      date: workout.updatedAt ?? workout.createdAt ?? workout.startDate ?? "",
      accent: workout.exercises
        .slice(0, 3)
        .map((exercise) => exercise.name)
        .join(" · "),
    })
  })

  notes.slice(0, 4).forEach((note) => {
    feed.push({
      id: `note-${note.id}`,
      kind: "note",
      title: "Ghi chú từ PT",
      body: note.content,
      meta: formatDateTime(note.createdAt),
      date: note.createdAt,
    })
  })

  if (membership) {
    feed.push({
      id: `membership-${membership.id}`,
      kind: "membership",
      title: "Gói tập đang hoạt động",
      body: `${membership.packageName} có hiệu lực đến ${formatShortDate(membership.endDate)}.`,
      meta: formatShortDate(membership.startDate),
      date: membership.startDate,
      accent: membership.supportsPT ? "Gói có hỗ trợ PT." : "Gói tự tập.",
    })
  }

  if (assignedPT) {
    feed.push({
      id: `coach-${assignedPT.id}`,
      kind: "coach",
      title: "PT phụ trách",
      body: `${assignedPT.fullName} đang theo dõi giáo án và phản hồi luyện tập của bạn.`,
      meta: formatShortDate(assignedPT.assignedAt),
      date: assignedPT.assignedAt,
      accent: assignedPT.specialty,
    })
  }

  return feed
    .filter((item) => Boolean(item.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function sortByDate<T>(items: T[], key: keyof T) {
  return [...items].sort((a, b) => {
    const aDate = String(a[key] ?? "")
    const bDate = String(b[key] ?? "")
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })
}

function sortWorkouts(items: WorkoutPlan[]) {
  return [...items].sort((a, b) => {
    const aDate = a.updatedAt ?? a.createdAt ?? a.startDate ?? ""
    const bDate = b.updatedAt ?? b.createdAt ?? b.startDate ?? ""
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })
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

function formatShortDate(dateStr?: string | null) {
  if (!dateStr) return "Chưa có"
  return formatVnDate(dateStr, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
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

const feedIcons: Record<FeedKind, LucideIcon> = {
  checkin: CheckCircle2,
  progress: TrendingUp,
  workout: Dumbbell,
  note: NotebookPen,
  membership: ShieldCheck,
  coach: UserRound,
}

const feedLabels: Record<FeedKind, string> = {
  checkin: "Check-in",
  progress: "Tiến độ",
  workout: "Giáo án",
  note: "PT note",
  membership: "Gói tập",
  coach: "Coach",
}
