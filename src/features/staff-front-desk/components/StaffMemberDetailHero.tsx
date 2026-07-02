"use client"

import { useParams } from "next/navigation"

import { useStaffMemberDetail } from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"
import { getStaffActions } from "@/features/member-360/components/QuickActionPanel"
import {
  RoleAwareMemberProfile,
  type MemberProfileActivity,
} from "@/features/member-360/components/RoleAwareMemberProfile"
import { formatVnDate } from "@/lib/date/vn-time"

export function StaffMemberDetailHero() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const detail = useStaffMemberDetail(Number.isFinite(memberId) ? memberId : null)
  const error = detail.error ? mapStaffOperationError(detail.error) : null
  const data = detail.data

  return (
    <RoleAwareMemberProfile
      actions={
        data
          ? getStaffActions(data.member.id, data.member.memberCode)
          : getStaffActions()
      }
      activityEvents={data ? buildStaffActivityEvents(data.recentCheckIns) : []}
      checkIns={data?.recentCheckIns ?? []}
      error={error ? new Error(error.message) : null}
      isLoading={detail.isLoading}
      member={
        data
          ? {
              id: data.member.id,
              email: data.member.email,
              fullName: data.member.fullName,
              memberCode: data.member.memberCode,
              phone: data.member.phone,
              status:
                data.member.accountStatus === "active"
                  ? "active"
                  : data.member.accountStatus === "locked"
                    ? "locked"
                    : "unknown",
            }
          : undefined
      }
      membership={
        data?.currentMembership
          ? {
              endDate: data.currentMembership.endsAt,
              packageName: data.currentMembership.packageName,
              paymentStatus: data.currentMembership.paymentStatus,
              startDate: data.currentMembership.startsAt,
              status: data.currentMembership.status,
              supportsPT: data.currentMembership.supportsPT,
            }
          : null
      }
      stats={{
        checkInCount: data?.recentCheckIns.length ?? 0,
      }}
      viewContext="staff"
    />
  )
}

function buildStaffActivityEvents(
  checkIns: Array<{ id: number; checkInAt: string; source: string }>,
) {
  return checkIns.map(
    (checkIn): MemberProfileActivity => ({
      id: `staff-checkin-${checkIn.id}`,
      title: "Check-in tại quầy",
      description: "Lễ tân đã ghi nhận hội viên vào phòng tập.",
      meta: formatDateTime(checkIn.checkInAt),
      date: checkIn.checkInAt,
      type: "checkin",
    }),
  )
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
