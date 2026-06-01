"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import {
  useSellStaffMembership,
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

const today = new Date().toISOString().slice(0, 10)

export function SellPackageWizard() {
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [selectedMember, setSelectedMember] =
    useState<StaffFrontDeskMemberSummary | null>(null)
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [saleResult, setSaleResult] = useState<MembershipSnapshot | null>(null)
  const [paymentResult, setPaymentResult] = useState<ManualPaymentResult | null>(
    null,
  )
  const members = useStaffMemberSearch(submittedQuery)
  const packages = useStaffPackages()
  const sell = useSellStaffMembership()
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
    formState: { errors: saleErrors },
    handleSubmit: handleSaleSubmit,
    setValue,
  } = useForm<SellPackageFormInput, unknown, SellPackageInput>({
    resolver: zodResolver(sellPackageSchema),
    defaultValues: {
      memberId: 0,
      packageId: 0,
      startDate: today,
      paymentMethod: "cash",
    },
  })
  const selectedPackage = useMemo(
    () => packages.data?.find((item) => item.id === selectedPackageId),
    [packages.data, selectedPackageId],
  )
  const operationError = sell.error ? mapStaffOperationError(sell.error) : null

  function onSearch(values: StaffSearchInput) {
    setSubmittedQuery(values.query)
    setSelectedMember(null)
    setSelectedPackageId(null)
    setSaleResult(null)
    setPaymentResult(null)
    setValue("memberId", 0, { shouldValidate: false })
    setValue("packageId", 0, { shouldValidate: false })
  }

  async function onSubmitSale(values: SellPackageInput) {
    const result = await sell.mutateAsync(values)
    setSaleResult(result)
    setPaymentResult(null)
    toast.success("Package sale created")
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
          <label className="sr-only" htmlFor="sell-member-search">
            Search member for package sale
          </label>
          <input
            className="min-h-11 flex-1 rounded-full border border-zinc-200 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            data-testid="staff-sell-member-search"
            id="sell-member-search"
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
              description="Search by member code, phone, email, or name before creating a package sale."
              title="Search to select a member."
              tone="empty"
            />
          ) : null}
          {members.isLoading ? (
            <StateBlock
              description="Loading eligible member records before package sale."
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
                setSaleResult(null)
                setPaymentResult(null)
                setValue("memberId", member.id, { shouldValidate: true })
              }}
              type="button"
            >
              <span className="block font-semibold">{member.fullName}</span>
              <span className="block text-sm text-zinc-600">
                {member.memberCode} · {member.phone}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">
          2. Package and payment
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {packages.data?.map((gymPackage) => (
            <button
              className="rounded-[1.25rem] border border-zinc-200 bg-white p-4 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.97] disabled:opacity-50 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50"
              data-selected={selectedPackageId === gymPackage.id}
              disabled={!gymPackage.isActive}
              key={gymPackage.id}
              onClick={() => {
                setSelectedPackageId(gymPackage.id)
                setSaleResult(null)
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

        <div className="mt-5 rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-950">
            Confirmation summary
          </p>
          <dl className="mt-3 grid gap-2 text-sm text-zinc-700">
            <div className="flex justify-between gap-4">
              <dt>Member</dt>
              <dd>{selectedMember?.fullName ?? "Not selected"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Package</dt>
              <dd>{selectedPackage?.name ?? "Not selected"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Start</dt>
              <dd>{today}</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSaleSubmit(onSubmitSale)}>
          {saleErrors.memberId || saleErrors.packageId || saleErrors.startDate ? (
            <p className="mt-3 text-sm font-medium text-red-800">
              {saleErrors.memberId?.message ??
                saleErrors.packageId?.message ??
                saleErrors.startDate?.message}
            </p>
          ) : null}
          <Button
            className="mt-4 min-h-11 rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
            data-testid="staff-sell-submit-button"
            disabled={sell.isPending}
            type="submit"
          >
            {sell.isPending ? "Creating..." : "Confirm package sale"}
          </Button>
        </form>

        {operationError ? (
          <StateBlock
            className="mt-3"
            description="Review the selected member and package, then try again."
            title={operationError.message}
            tone="error"
          />
        ) : null}

        {saleResult ? (
          <div
            className="mt-5 rounded-[1.25rem] border border-zinc-200 bg-white p-4"
            data-testid="staff-sell-result"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-950">
                  Sale created for {saleResult.packageName}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Membership is pending until payment is recorded.
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
                  membership={saleResult}
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
