"use client"

import { CalendarDays, Dumbbell, Phone, UserRound } from "lucide-react"

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
      <div className="gm-panel h-44 animate-pulse" />
    )
  }

  const member = data?.member
  const pt = data?.assignedPT
  const membership = data?.currentMembership

  return (
    <section className="gm-panel relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound aria-hidden="true" className="size-9" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Hội viên phụ trách
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                {member?.fullName ?? "Hội viên"}
              </h2>
              {member?.status ? <StatusPill status={member.status} /> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Dumbbell aria-hidden="true" className="size-4" />
                {member?.memberCode ?? "Chưa rõ"}
              </span>
              <span className="flex items-center gap-2">
                <Phone aria-hidden="true" className="size-4" />
                {member?.phone ?? "Chưa có số điện thoại"}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" />
                Gói: {membership?.packageName ?? "Chưa có"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <ContextTile label="PT hiện tại" value={pt?.fullName ?? "Chưa phân công"} />
          <ContextTile label="Chuyên môn" value={pt?.specialty ?? "Tập luyện tổng quát"} />
        </div>
      </div>
    </section>
  )
}

function ContextTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="gm-panel-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}
