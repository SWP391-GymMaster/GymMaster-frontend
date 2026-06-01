"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  useCreateStaffCheckIn,
  useStaffMemberSearch,
} from "@/features/staff-front-desk/api/staff-front-desk.queries"
import {
  checkInSchema,
  type CheckInInput,
} from "@/features/staff-front-desk/schemas/staff-front-desk.schemas"
import type {
  CheckInResult,
  StaffFrontDeskMemberSummary,
} from "@/features/staff-front-desk/types/staff-front-desk.types"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"
import { toStatusPillStatus } from "@/features/staff-front-desk/utils/staff-status"

export function CheckInTerminal() {
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [selectedMember, setSelectedMember] =
    useState<StaffFrontDeskMemberSummary | null>(null)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const members = useStaffMemberSearch(submittedQuery)
  const checkIn = useCreateStaffCheckIn()
  const mutationError = checkIn.error ? mapStaffOperationError(checkIn.error) : null
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      query: "",
    },
  })

  function onSearch(values: CheckInInput) {
    setSubmittedQuery(values.query)
    setSelectedMember(null)
    setResult(null)
  }

  async function onConfirm() {
    if (!selectedMember) return

    if (selectedMember.membershipStatus !== "active") {
      setResult({
        memberId: selectedMember.id,
        status: "denied",
        reasonCode: "MEMBERSHIP_INACTIVE",
        safeMessage:
          "Check-in denied. This member needs an active paid membership before entry.",
      })
      return
    }

    const nextResult = await checkIn.mutateAsync(selectedMember.id)
    setResult(nextResult)
    toast.success("Check-in confirmed")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
          Terminal lookup
        </p>
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit(onSearch)}
        >
          <label className="sr-only" htmlFor="check-in-search">
            Search member to check in
          </label>
          <input
            className="min-h-14 flex-1 rounded-full border border-white/15 bg-white/10 px-5 text-lg text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/10"
            data-testid="staff-checkin-search"
            id="check-in-search"
            placeholder="Member code, phone, email, or name"
            {...register("query")}
          />
          <Button
            className="min-h-14 rounded-full bg-emerald-400 px-6 text-zinc-950 hover:bg-emerald-300"
            type="submit"
          >
            Find
          </Button>
        </form>
        {errors.query ? (
          <p className="mt-3 text-sm font-medium text-red-200">
            {errors.query.message}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">Candidate</h2>
        {!submittedQuery ? (
          <StateBlock
            className="mt-4"
            description="Search by member code, phone, email, or name before confirming entry."
            title="Search to load a candidate."
            tone="empty"
          />
        ) : null}
        {members.isLoading ? (
          <StateBlock
            className="mt-4"
            description="Checking member status before entry confirmation."
            title="Loading candidate..."
            tone="loading"
          />
        ) : null}
        {members.data?.items.length === 0 ? (
          <StateBlock
            className="mt-4"
            description="Search by another code, phone, email, or member name."
            title="No matching member found."
            tone="empty"
          />
        ) : null}
        <div className="mt-4 grid gap-3">
          {members.data?.items.map((member) => (
            <button
              className="rounded-[1.25rem] border border-zinc-200 bg-white p-4 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.97] data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50"
              data-selected={selectedMember?.id === member.id}
              key={member.id}
              onClick={() => {
                setSelectedMember(member)
                setResult(null)
              }}
              type="button"
            >
              <span className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="block font-semibold text-zinc-950">
                    {member.fullName}
                  </span>
                  <span className="mt-1 block text-sm text-zinc-600">
                    {member.memberCode} · {member.phone}
                  </span>
                </span>
                <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
              </span>
            </button>
          ))}
        </div>

        <Button
          className="mt-5 min-h-12 rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
          data-testid="staff-checkin-confirm"
          disabled={!selectedMember || checkIn.isPending}
          onClick={onConfirm}
          type="button"
        >
          {checkIn.isPending ? "Confirming..." : "Confirm check-in"}
        </Button>

        {mutationError ? (
          <StateBlock
            className="mt-3"
            description="Resolve the membership issue before confirming entry."
            title={mutationError.message}
            tone="error"
          />
        ) : null}

        {result ? (
          <div
            className="mt-5 rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4"
            data-testid="staff-checkin-result"
          >
            <StatusPill
              status={result.status === "checked-in" ? "checked-in" : "failed"}
            />
            <p className="mt-3 text-base font-semibold text-zinc-950">
              {result.safeMessage}
            </p>
            {result.checkedInAt ? (
              <p className="mt-1 text-sm text-zinc-600">
                Time: {result.checkedInAt}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
