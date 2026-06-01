"use client"

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
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-800">{error.message}</p>
        {onRetry ? (
          <button
            className="mt-3 inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-700 active:scale-[0.97]"
            onClick={onRetry}
            type="button"
          >
            Retry
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
    <div className="space-y-4">
      {/* Hero section */}
      <Member360Hero
        email={member?.email ?? ""}
        fullName={member?.fullName ?? ""}
        isLoading={isLoading}
        memberCode={member?.memberCode ?? ""}
        phone={member?.phone ?? ""}
        status={member?.status ?? "active"}
        viewContext={viewContext}
      />

      {/* Split layout */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          <MembershipSummaryCard
            endDate={membership?.endDate}
            isLoading={isLoading}
            membershipStatus={membership?.status}
            packageName={membership?.packageName}
            paymentStatus={membership?.paymentStatus}
            startDate={membership?.startDate}
          />
          <CheckInTimeline entries={checkIns} isLoading={isLoading} />
        </div>
        <div className="space-y-4">
          <AssignedPTCard
            assignedAt={pt?.assignedAt}
            fullName={pt?.fullName}
            isLoading={isLoading}
            specialty={pt?.specialty}
          />
          {!isLoading && memberId > 0 ? (
            <QuickActionPanel actions={roleActions} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
