"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  useRenewStaffMembership,
  useStaffMemberDetail,
  useStaffMemberSearch,
  useStaffPackages,
} from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { ManualPaymentPanel } from "@/features/staff-front-desk/components/ManualPaymentPanel"
import {
  sellPackageSchema,
  staffSearchSchema,
  type SellPackageFormInput,
  type SellPackageInput,
  type StaffSearchInput,
} from "@/features/staff-front-desk/schemas/staff-front-desk.schemas"
import type {
  ManualPaymentResult,
  MembershipSnapshot,
  StaffFrontDeskMemberSummary,
} from "@/features/staff-front-desk/types/staff-front-desk.types"
import { mapStaffOperationError } from "@/features/staff-front-desk/utils/staff-operation-errors"

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00.000Z`)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)

  return nextDate.toISOString().slice(0, 10)
}

function getRenewalStartDate(membership?: MembershipSnapshot | null) {
  if (!membership?.endsAt) {
    return new Date().toISOString().slice(0, 10)
  }

  return addDays(membership.endsAt, 1)
}

export function RenewPackageWizard() {
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [selectedMember, setSelectedMember] =
    useState<StaffFrontDeskMemberSummary | null>(null)
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [renewalResult, setRenewalResult] = useState<MembershipSnapshot | null>(
    null,
  )
  const [paymentResult, setPaymentResult] = useState<ManualPaymentResult | null>(
    null,
  )
  const members = useStaffMemberSearch(submittedQuery)
  const memberDetail = useStaffMemberDetail(selectedMember?.id ?? null)
  const packages = useStaffPackages()
  const renew = useRenewStaffMembership()
  const {
    formState: { errors: searchErrors },
    handleSubmit: handleSearchSubmit,
    register: registerSearch,
  } = useForm<StaffSearchInput>({
    resolver: zodResolver(staffSearchSchema),
    defaultValues: {
      query: "",
    },
  })
  const {
    formState: { errors: renewalErrors },
    handleSubmit: handleRenewalSubmit,
    setValue,
  } = useForm<SellPackageFormInput, unknown, SellPackageInput>({
    resolver: zodResolver(sellPackageSchema),
    defaultValues: {
      memberId: 0,
      packageId: 0,
      startDate: getRenewalStartDate(null),
      paymentMethod: "cash",
    },
  })
  const selectedPackage = useMemo(
    () => packages.data?.find((item) => item.id === selectedPackageId),
    [packages.data, selectedPackageId],
  )
  const currentMembership = memberDetail.data?.currentMembership
  const renewalStart = getRenewalStartDate(currentMembership)
  const renewalEnd = selectedPackage
    ? addDays(renewalStart, selectedPackage.durationDays)
    : null
  const operationError = renew.error ? mapStaffOperationError(renew.error) : null

  function onSearch(values: StaffSearchInput) {
    setSubmittedQuery(values.query)
    setSelectedMember(null)
    setSelectedPackageId(null)
    setRenewalResult(null)
    setPaymentResult(null)
    setValue("memberId", 0, { shouldValidate: false })
    setValue("packageId", 0, { shouldValidate: false })
  }

  async function onSubmitRenewal(values: SellPackageInput) {
    if (!currentMembership) {
      toast.error("Select a member with an existing membership.")
      return
    }

    const result = await renew.mutateAsync({
      membershipId: currentMembership.id,
      packageId: values.packageId,
      startDate: renewalStart,
      paymentMethod: values.paymentMethod,
    })
    setRenewalResult(result)
    setPaymentResult(null)
    toast.success("Renewal created")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">
          1. Select member
        </h2>
        <form
          className="mt-4 flex gap-2"
          onSubmit={handleSearchSubmit(onSearch)}
        >
          <label className="sr-only" htmlFor="renew-member-search">
            Search member for renewal
          </label>
          <input
            className="min-h-11 flex-1 rounded-full border border-zinc-200 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            data-testid="staff-renew-member-search"
            id="renew-member-search"
            placeholder="Name, email, phone, or member code"
            {...registerSearch("query")}
          />
          <Button type="submit">Find</Button>
        </form>
        {searchErrors.query ? (
          <p className="mt-3 text-sm font-medium text-red-700">
            {searchErrors.query.message}
          </p>
        ) : null}

        <div className="mt-4 grid gap-2">
          {!submittedQuery ? (
            <StateBlock
              description="Search by member code, phone, email, or name before previewing a renewal."
              title="Search to select a member."
              tone="empty"
            />
          ) : null}
          {members.isLoading ? (
            <StateBlock
              description="Loading member records and current membership context."
              title="Loading members..."
              tone="loading"
            />
          ) : null}
          {members.data?.items.map((member) => (
            <button
              className="rounded-[1.25rem] border border-zinc-200 bg-white p-3 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.97] data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50"
              data-selected={selectedMember?.id === member.id}
              key={member.id}
              onClick={() => {
                setSelectedMember(member)
                setRenewalResult(null)
                setPaymentResult(null)
                setValue("memberId", member.id, { shouldValidate: true })
                setValue("startDate", getRenewalStartDate(null), {
                  shouldValidate: true,
                })
              }}
              type="button"
            >
              <span className="block font-semibold">{member.fullName}</span>
              <span className="block text-sm text-zinc-600">
                {member.memberCode} · {member.currentPackageName ?? "No package"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">
          2. Renewal period
        </h2>

        <div className="mt-4 rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-950">
                Current membership
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                {currentMembership
                  ? `${currentMembership.packageName} · ends ${currentMembership.endsAt}`
                  : "Select a member with an existing membership."}
              </p>
            </div>
            {currentMembership ? (
              <StatusPill status={currentMembership.paymentStatus} />
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {packages.data?.map((gymPackage) => (
            <button
              className="rounded-[1.25rem] border border-zinc-200 bg-white p-4 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.97] disabled:opacity-50 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50"
              data-selected={selectedPackageId === gymPackage.id}
              disabled={!gymPackage.isActive}
              key={gymPackage.id}
              onClick={() => {
                setSelectedPackageId(gymPackage.id)
                setRenewalResult(null)
                setPaymentResult(null)
                setValue("packageId", gymPackage.id, { shouldValidate: true })
              }}
              type="button"
            >
              <span className="block text-base font-semibold">
                {gymPackage.name}
              </span>
              <span className="mt-1 block text-sm text-zinc-600">
                {gymPackage.durationDays} days ·{" "}
                {gymPackage.price.toLocaleString("vi-VN")} VND
              </span>
            </button>
          ))}
        </div>

        <div
          className="mt-5 rounded-[1.25rem] border border-zinc-200 bg-white p-4"
          data-testid="staff-renew-summary"
        >
          <p className="text-sm font-semibold text-zinc-950">
            Renewal impact
          </p>
          <dl className="mt-3 grid gap-2 text-sm text-zinc-700">
            <div className="flex justify-between gap-4">
              <dt>Member</dt>
              <dd>{selectedMember?.fullName ?? "Not selected"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Renewal package</dt>
              <dd>{selectedPackage?.name ?? "Not selected"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>New period</dt>
              <dd>
                {selectedPackage ? `${renewalStart} to ${renewalEnd}` : "Pending"}
              </dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleRenewalSubmit(onSubmitRenewal)}>
          {renewalErrors.memberId ||
          renewalErrors.packageId ||
          renewalErrors.startDate ? (
            <p className="mt-3 text-sm font-medium text-red-800">
              {renewalErrors.memberId?.message ??
                renewalErrors.packageId?.message ??
                renewalErrors.startDate?.message}
            </p>
          ) : null}
          <Button
            className="mt-4 min-h-11 rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
            data-testid="staff-renew-submit-button"
            disabled={renew.isPending}
            type="submit"
          >
            {renew.isPending ? "Creating..." : "Confirm renewal"}
          </Button>
        </form>

        {operationError ? (
          <StateBlock
            className="mt-3"
            description="Review the selected member and renewal package, then try again."
            title={operationError.message}
            tone="error"
          />
        ) : null}

        {renewalResult ? (
          <div
            className="mt-5 rounded-[1.25rem] border border-zinc-200 bg-white p-4"
            data-testid="staff-renew-result"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-950">
                  Renewal created for {renewalResult.packageName}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Renewal is pending until payment is recorded.
                </p>
              </div>
              <StatusPill status={paymentResult ? "paid" : "pending"} />
            </div>
            {paymentResult ? (
              <p className="mt-4 rounded-[1.25rem] bg-emerald-50 p-3 text-sm font-medium text-emerald-900">
                {paymentResult.message}
              </p>
            ) : (
              <div className="mt-4">
                <ManualPaymentPanel
                  membership={renewalResult}
                  onRecorded={setPaymentResult}
                />
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
