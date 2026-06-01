"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { staffRoutes } from "@/features/staff-front-desk/constants/staff-routes"
import { useStaffMemberDetail } from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"
import { toStatusPillStatus } from "@/features/staff-front-desk/utils/staff-status"

export function StaffMemberDetailHero() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const detail = useStaffMemberDetail(Number.isFinite(memberId) ? memberId : null)
  const error = detail.error ? mapStaffOperationError(detail.error) : null

  if (detail.isLoading) {
    return (
      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm">
        <StateBlock
          description="Loading membership, payment, and recent check-in context."
          title="Loading member detail..."
          tone="loading"
        />
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-sm">
        <StateBlock
          description="Return to member search or retry after checking the member id."
          title={error.message}
          tone="error"
        />
      </section>
    )
  }

  if (!detail.data) {
    return (
      <section className="rounded-[1.5rem] border border-zinc-200 bg-white/85 p-6">
        <StateBlock
          description="Return to member search and select a valid member record."
          title="Member detail is unavailable."
          tone="empty"
        />
      </section>
    )
  }

  const { member, currentMembership, recentCheckIns } = detail.data

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
          {currentMembership?.paymentStatus ? (
            <StatusPill status={currentMembership.paymentStatus} />
          ) : null}
        </div>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
          {member.fullName}
        </h2>
        <p className="mt-3 text-base leading-7 text-zinc-300">
          {member.memberCode} · {member.phone} · {member.email}
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-zinc-400">Package</dt>
            <dd className="mt-1 text-lg font-semibold">
              {currentMembership?.packageName ?? "None"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-400">Ends</dt>
            <dd className="mt-1 text-lg font-semibold">
              {currentMembership?.endsAt ?? "No active window"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-400">Last check-in</dt>
            <dd className="mt-1 text-lg font-semibold">
              {member.lastCheckInAt ?? "No recent check-in"}
            </dd>
          </div>
        </dl>
      </section>

      <aside className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-950">Next actions</h3>
        <div className="mt-4 grid gap-3">
          <Link
            className="rounded-full bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.97]"
            href={staffRoutes.checkIn}
          >
            Check in member
          </Link>
          <Link
            className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-medium text-zinc-900 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-300 hover:shadow-sm active:scale-[0.97]"
            href={staffRoutes.sellPackage}
          >
            Sell package
          </Link>
          <Link
            className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-medium text-zinc-900 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-300 hover:shadow-sm active:scale-[0.97]"
            href={staffRoutes.renewPackage}
          >
            Renew package
          </Link>
        </div>
        <div className="mt-6 rounded-[1.25rem] bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-950">Recent activity</p>
          {recentCheckIns.length ? (
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              {recentCheckIns.slice(-3).map((checkin) => (
                <li key={checkin.id}>{checkin.checkInAt}</li>
              ))}
            </ul>
          ) : (
            <StateBlock
              className="mt-3"
              description="Recent Staff check-ins will appear here after entry confirmation."
              title="No check-ins recorded."
              tone="empty"
            />
          )}
        </div>
      </aside>
    </div>
  )
}
