"use client"

import Link from "next/link"
import { Dumbbell, Users, ArrowRight } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { usePtAssignedMembers } from "@/features/pt-dashboard/api/pt-dashboard.queries"

export function PtDashboardContent() {
  const { data, isLoading, error, refetch } = usePtAssignedMembers()

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-800">
          {error instanceof Error ? error.message : "Failed to load members."}
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-700 active:scale-[0.97]"
          onClick={() => refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm"
            >
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[1.25rem] border border-zinc-200 bg-white p-4"
            />
          ))}
        </div>
      </div>
    )
  }

  const members = data ?? []
  const activeCount = members.filter((m) => m.status === "active").length

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Assigned members
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {members.length}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Active</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-700">
            {activeCount}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Pending / Expired
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {members.length - activeCount}
          </p>
        </div>
      </div>

      {/* Member list */}
      {members.length > 0 ? (
        <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users aria-hidden="true" className="size-5 text-zinc-500" />
            <p className="text-sm font-medium text-zinc-500">
              Your assigned members
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {members.map((member) => (
              <Link
                className="flex items-center gap-4 rounded-[1.25rem] border border-zinc-200 bg-white p-4 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.97]"
                href={`/pt/members/${member.id}`}
                key={member.id}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                  <Dumbbell aria-hidden="true" className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-semibold text-zinc-950">
                    {member.fullName}
                  </span>
                  <span className="mt-0.5 block text-sm text-zinc-600">
                    {member.memberCode} · {member.phone}
                  </span>
                </span>
                <StatusPill status={member.status} />
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-zinc-400"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
          <Dumbbell
            aria-hidden="true"
            className="mx-auto size-8 text-zinc-300"
          />
          <p className="mt-3 font-medium">
            No members assigned yet
          </p>
          <p className="mt-1">
            Assigned members will appear here once Admin assigns them to you.
          </p>
        </div>
      )}
    </div>
  )
}
