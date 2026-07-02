"use client"

import { formatVnDate } from "@/lib/date/vn-time"
import { useMemberProgress } from "@/features/member-progress-tracking/api/member-progress.queries"
import { useMemberCheckIns } from "@/features/billing/api/billing.queries"
import {
  useMemberTrainerNotes,
  useMemberWorkoutPlans,
} from "@/features/pt-training/api/pt-training.queries"
import {
  getAdminActions,
  getMemberActions,
  getPtActions,
} from "@/features/member-360/components/QuickActionPanel"
import {
  RoleAwareMemberProfile,
  type MemberProfileActivity,
  type MemberProfileContext,
} from "@/features/member-360/components/RoleAwareMemberProfile"

import type { Member360Data } from "@/features/member-360/types/member-360.types"

type Member360ContentProps = {
  data?: Member360Data
  isLoading?: boolean
  error?: Error | null
  viewContext?: Exclude<MemberProfileContext, "staff">
  onRetry?: () => void
  unavailable?: {
    title: string
    description: string
  }
}

export function Member360Content({
  data,
  isLoading,
  error,
  viewContext = "admin",
  onRetry,
  unavailable,
}: Member360ContentProps) {
  const member = data?.member
  const memberId = member?.id ?? 0

  const progressQuery = useMemberProgress(memberId || null)
  const checkinsQuery = useMemberCheckIns(memberId || null)
  const workoutsQuery = useMemberWorkoutPlans(memberId || null)
  const notesQuery = useMemberTrainerNotes(memberId || null)

  const progressEntries = progressQuery.data ?? []
  const sortedProgress = [...progressEntries].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  )
  const latestProgress = sortedProgress[0]
  const checkIns = checkinsQuery.data ?? data?.recentCheckIns ?? []
  const workouts = workoutsQuery.data ?? []

  const stats = {
    checkInCount: checkIns.length,
    workoutCount: workouts.length,
    latestWeightKg: latestProgress?.weightKg ?? null,
    latestBodyFatPct: latestProgress?.bodyFatPct ?? null,
    progressUpdatedAt: latestProgress?.measuredAt ?? null,
  }

  const activityEvents = buildActivityEvents({
    checkIns,
    notes: notesQuery.data ?? [],
    assignedPT: data?.assignedPT,
    membership: data?.currentMembership,
    latestProgress,
  })

  const actions =
    memberId > 0
      ? viewContext === "pt"
        ? getPtActions(memberId)
        : viewContext === "member"
          ? getMemberActions()
          : getAdminActions(memberId)
      : []

  return (
    <RoleAwareMemberProfile
      actions={actions}
      activityEvents={activityEvents}
      assignedPT={data?.assignedPT ?? null}
      checkIns={checkIns}
      error={error}
      isLoading={isLoading}
      isStatsLoading={
        progressQuery.isLoading ||
        checkinsQuery.isLoading ||
        workoutsQuery.isLoading ||
        notesQuery.isLoading
      }
      member={
        member
          ? {
              id: member.id,
              dateOfBirth: member.dateOfBirth,
              email: member.email,
              fullName: member.fullName,
              gender: member.gender,
              memberCode: member.memberCode,
              phone: member.phone,
              status: member.status,
            }
          : undefined
      }
      membership={data?.currentMembership ?? null}
      onRetry={onRetry}
      stats={stats}
      unavailable={unavailable}
      viewContext={viewContext}
    />
  )
}

function buildActivityEvents({
  checkIns,
  notes,
  assignedPT,
  membership,
  latestProgress,
}: {
  checkIns: Array<{ id: number; checkInAt: string; source?: string }>
  notes: Array<{ id: number; content: string; createdAt: string }>
  assignedPT?: Member360Data["assignedPT"]
  membership?: Member360Data["currentMembership"] | null
  latestProgress?: {
    id: number
    measuredAt: string
    weightKg: number
    bodyFatPct?: number
  }
}) {
  const events: MemberProfileActivity[] = []

  checkIns.forEach((checkIn) => {
    events.push({
      id: `checkin-${checkIn.id}`,
      title: "Check-in thành công",
      description:
        checkIn.source === "front-desk"
          ? "Hội viên được xác nhận vào phòng tại quầy lễ tân."
          : "Hội viên được ghi nhận qua ứng dụng.",
      meta: formatDateTime(checkIn.checkInAt),
      date: checkIn.checkInAt,
      type: "checkin",
    })
  })

  notes.forEach((note) => {
    events.push({
      id: `note-${note.id}`,
      title: "Ghi chú PT",
      description: note.content,
      meta: formatDateTime(note.createdAt),
      date: note.createdAt,
      type: "note",
    })
  })

  if (assignedPT) {
    events.push({
      id: `assignment-${assignedPT.id}`,
      title: "Phân công PT",
      description: `${assignedPT.fullName} đang phụ trách hội viên này.`,
      meta: formatDateTime(assignedPT.assignedAt),
      date: assignedPT.assignedAt,
      type: "assignment",
    })
  }

  if (membership) {
    events.push({
      id: `membership-${membership.id}`,
      title: "Gói hội viên",
      description: `${membership.packageName} đang ở trạng thái ${membership.status}.`,
      meta: formatDateTime(membership.startDate),
      date: membership.startDate,
      type: "membership",
    })
  }

  if (latestProgress) {
    events.push({
      id: `progress-${latestProgress.id}`,
      title: "Cập nhật tiến độ",
      description: `Cân nặng ${latestProgress.weightKg} kg${
        latestProgress.bodyFatPct ? `, body fat ${latestProgress.bodyFatPct}%` : ""
      }.`,
      meta: formatDateTime(latestProgress.measuredAt),
      date: latestProgress.measuredAt,
      type: "progress",
    })
  }

  return events
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
