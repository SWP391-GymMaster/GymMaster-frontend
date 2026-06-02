"use client"

import { UserRound } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import type { Member360Data } from "@/features/member-360/types/member-360.types"

type TrainingMemberContextProps = {
  data?: Member360Data
  isLoading?: boolean
}

export function TrainingMemberContext({
  data,
  isLoading,
}: TrainingMemberContextProps) {
  if (isLoading) {
    return (
      <div className="h-32 animate-pulse rounded-xl border border-[#c2c6d6] bg-white" />
    )
  }

  const member = data?.member
  const pt = data?.assignedPT

  return (
    <section className="rounded-xl border border-[#c2c6d6] bg-[#2e3038] p-5 text-white shadow-xl">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl bg-[#2170e4]">
          <UserRound aria-hidden="true" className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#adc6ff]">
            Assigned member
          </p>
          <h2 className="mt-1 truncate text-2xl font-black tracking-tight">
            {member?.fullName ?? "Member"}
          </h2>
          <p className="mt-1 text-sm text-[#dee2f4]">
            {member?.memberCode ?? "Unknown"} · {member?.phone ?? "No phone"}
          </p>
        </div>
        {member?.status ? <StatusPill status={member.status} /> : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c2c6d8]">
            Current coach
          </p>
          <p className="mt-1 font-bold text-white">
            {pt?.fullName ?? "Unassigned"}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c2c6d8]">
            Specialty
          </p>
          <p className="mt-1 font-bold text-white">
            {pt?.specialty ?? "General training"}
          </p>
        </div>
      </div>
    </section>
  )
}
