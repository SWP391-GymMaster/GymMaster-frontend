"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import {
  useSellStaffMembership,
  useStaffMemberSearch,
  useStaffPackages,
} from "@/features/staff-front-desk/api/staff-front-desk.queries"
import { ManualPaymentPanel } from "@/features/staff-front-desk/components/ManualPaymentPanel"
import {
  OrderSummaryShell,
  PackageCard,
  PaymentCompleteBanner,
  StaffMemberCard,
  StaffSearchPanel,
  StaffWizardStepper,
  SummaryRow,
} from "@/features/staff-front-desk/components/StaffTemplateParts"
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
  const activeStep = saleResult ? 3 : selectedPackage ? 2 : selectedMember ? 1 : 0

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
    <div className="grid gap-5">
      <StaffWizardStepper
        activeIndex={activeStep}
        steps={["Member", "Package", "Payment", "Confirm"]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-5">
          <StaffSearchPanel
            error={searchErrors.query?.message}
            id="sell-member-search"
            label="Select member"
            onSubmit={handleSearchSubmit(onSearch)}
            placeholder="Name, email, phone, or member code"
            registerInput={registerSearch("query")}
            testId="staff-sell-member-search"
          >
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
              <StaffMemberCard
                key={member.id}
                member={member}
                onSelect={() => {
                  setSelectedMember(member)
                  setSaleResult(null)
                  setPaymentResult(null)
                  setValue("memberId", member.id, { shouldValidate: true })
                }}
                selected={selectedMember?.id === member.id}
              />
            ))}
          </StaffSearchPanel>

          <section className="rounded-[1.5rem] border border-zinc-200 bg-white/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-zinc-950">
                  Choose Package
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Package cards follow the Staff sell wizard template.
                </p>
              </div>
              <StatusPill status={selectedPackage ? "active" : "pending"} />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {packages.data?.map((gymPackage, index) => (
                <PackageCard
                  gymPackage={gymPackage}
                  key={gymPackage.id}
                  onSelect={() => {
                    setSelectedPackageId(gymPackage.id)
                    setSaleResult(null)
                    setPaymentResult(null)
                    setValue("packageId", gymPackage.id, {
                      shouldValidate: true,
                    })
                  }}
                  recommended={index === 1}
                  selected={selectedPackageId === gymPackage.id}
                />
              ))}
            </div>
          </section>
        </div>

        <OrderSummaryShell
          footer={
            <>
              <form onSubmit={handleSaleSubmit(onSubmitSale)}>
                {saleErrors.memberId ||
                saleErrors.packageId ||
                saleErrors.startDate ? (
                  <p className="mt-3 text-sm font-medium text-red-800">
                    {saleErrors.memberId?.message ??
                      saleErrors.packageId?.message ??
                      saleErrors.startDate?.message}
                  </p>
                ) : null}
                <button
                  className="mt-4 min-h-12 w-full rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="staff-sell-submit-button"
                  disabled={sell.isPending}
                  type="submit"
                >
                  {sell.isPending ? "Creating..." : "Confirm package sale"}
                </button>
              </form>

              {operationError ? (
                <StateBlock
                  className="mt-3"
                  description="Review the selected member and package, then try again."
                  title={operationError.message}
                  tone="error"
                />
              ) : null}
            </>
          }
          member={selectedMember}
          title="Order Summary"
        >
          <SummaryRow
            label="Package"
            value={selectedPackage?.name ?? "Not selected"}
          />
          <SummaryRow label="Start" value={today} />
          <SummaryRow
            label="Total"
            value={
              selectedPackage
                ? `${selectedPackage.price.toLocaleString("vi-VN")} VND`
                : "Pending"
            }
          />
        </OrderSummaryShell>
      </div>

      {saleResult ? (
        <section
          className="rounded-[1.5rem] border border-zinc-200 bg-white/90 p-5 shadow-sm"
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
            <PaymentCompleteBanner message={paymentResult.message} />
          ) : (
            <div className="mt-4">
              <ManualPaymentPanel
                membership={saleResult}
                onRecorded={setPaymentResult}
              />
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
