"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { CalendarDays, CreditCard, RefreshCw } from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import {
  useRenewStaffMembership,
  useStaffMemberDetail,
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
  const searchParams = useSearchParams()
  const memberIdParam = searchParams?.get("memberId")
  const queryParam = searchParams?.get("query")

  const [submittedQuery, setSubmittedQuery] = useState(queryParam ?? "")
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
      query: queryParam ?? "",
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

  useEffect(() => {
    if (memberIdParam && members.data?.items && !selectedMember) {
      const match = members.data.items.find(
        (m) => m.id === Number(memberIdParam),
      )
      if (match) {
        const timer = setTimeout(() => {
          setSelectedMember(match)
          setValue("memberId", match.id, { shouldValidate: true })
          setValue("startDate", getRenewalStartDate(null), {
            shouldValidate: true,
          })
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [memberIdParam, members.data, selectedMember, setValue])
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
  // Backend gia han la atomic (gia han + ghi nhan thanh toan) -> ket qua tra ve da paid/active.
  const renewalPaid =
    Boolean(paymentResult) || renewalResult?.paymentStatus === "paid"
  const activeStep = renewalResult
    ? 3
    : selectedPackage
      ? 2
      : selectedMember
        ? 1
        : 0

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
      toast.error("Chọn hội viên đang có gói trước khi gia hạn.")
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
    toast.success("Đã gia hạn và ghi nhận thanh toán")
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <WorkflowCard icon={RefreshCw} label="Chế độ gia hạn" title="Xem trước & xác nhận" />
        <WorkflowCard icon={CalendarDays} label="Quy tắc gói" title="Nối từ ngày hết hạn" />
        <WorkflowCard icon={CreditCard} label="Xử lý thanh toán" title="Xác nhận thủ công" />
      </section>

      <StaffWizardStepper
        activeIndex={activeStep}
        steps={["Hội viên", "Gói hiện tại", "Gia hạn", "Thanh toán"]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-5">
          <StaffSearchPanel
            error={searchErrors.query?.message}
            id="renew-member-search"
            label="1. Chọn hội viên"
            onSubmit={handleSearchSubmit(onSearch)}
            placeholder="Tên, email, số điện thoại hoặc mã hội viên"
            registerInput={registerSearch("query")}
            testId="staff-renew-member-search"
          >
            {!submittedQuery ? (
              <StateBlock
                description="Tìm theo mã hội viên, số điện thoại, email hoặc tên trước khi xem trước gia hạn."
                title="Tìm để chọn hội viên."
                tone="empty"
              />
            ) : null}
            {members.isLoading ? (
              <StateBlock
                description="Đang tải hồ sơ hội viên và thông tin gói hiện tại."
                title="Đang tải hội viên..."
                tone="loading"
              />
            ) : null}
            {members.data?.items.map((member) => (
              <StaffMemberCard
                key={member.id}
                member={member}
                onSelect={() => {
                  setSelectedMember(member)
                  setRenewalResult(null)
                  setPaymentResult(null)
                  setValue("memberId", member.id, { shouldValidate: true })
                  setValue("startDate", getRenewalStartDate(null), {
                    shouldValidate: true,
                  })
                }}
                selected={selectedMember?.id === member.id}
                subtitle={`${member.memberCode} · ${
                  member.currentPackageName ?? "Chưa có gói"
                }`}
              />
            ))}
          </StaffSearchPanel>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">2. Gói hiện tại</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentMembership
                  ? `${currentMembership.packageName} · hết hạn ${currentMembership.endsAt}`
                  : "Chọn hội viên đang có gói trước khi gia hạn."}
              </p>
              {currentMembership ? (
                <div className="mt-3">
                  <StatusPill status={currentMembership.paymentStatus} />
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  3. Chọn gói gia hạn
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Xem trước thời hạn mới trước khi xác nhận gia hạn.
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
                    setRenewalResult(null)
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

            {selectedPackage ? (
              <section className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <RenewalBox label="Ngày hết hạn hiện tại" value={currentMembership?.endsAt ?? "Chưa có"} />
                <span className="hidden text-center text-xl font-semibold text-muted-foreground md:block">+</span>
                <RenewalBox label="Thời lượng gói mới" value={`${selectedPackage.durationDays} ngày`} />
                <span className="hidden text-center text-xl font-semibold text-muted-foreground md:block">=</span>
                <RenewalBox emphasis label="Ngày hết hạn mới" value={renewalEnd ?? "Đang chờ"} />
              </section>
            ) : null}
          </section>
        </div>

        <OrderSummaryShell
          footer={
            <>
              <form onSubmit={handleRenewalSubmit(onSubmitRenewal)}>
                {renewalErrors.memberId ||
                renewalErrors.packageId ||
                renewalErrors.startDate ? (
                  <p className="mt-3 text-sm font-medium text-destructive">
                    {renewalErrors.memberId?.message ??
                      renewalErrors.packageId?.message ??
                      renewalErrors.startDate?.message}
                  </p>
                ) : null}
                <button
                  className="mt-4 min-h-12 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="staff-renew-submit-button"
                  disabled={renew.isPending}
                  type="submit"
                >
                  {renew.isPending ? "Đang tạo..." : "Xác nhận gia hạn"}
                </button>
              </form>

              {operationError ? (
                <StateBlock
                  className="mt-3"
                  description="Kiểm tra lại hội viên và gói gia hạn, sau đó thử lại."
                  title={operationError.message}
                  tone="error"
                />
              ) : null}
            </>
          }
          member={selectedMember}
          title="Tác động gia hạn"
        >
          <div data-testid="staff-renew-summary">
            <SummaryRow
              label="Hiện tại"
              value={
                currentMembership
                  ? `${currentMembership.packageName} · hết hạn ${currentMembership.endsAt}`
                  : "Chưa chọn"
              }
            />
            <SummaryRow
              label="Gói gia hạn"
              value={selectedPackage?.name ?? "Chưa chọn"}
            />
            <SummaryRow
              label="Thời hạn mới"
              value={
                selectedPackage ? `${renewalStart} đến ${renewalEnd}` : "Đang chờ"
              }
            />
          </div>
        </OrderSummaryShell>
      </div>

      {renewalResult ? (
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          data-testid="staff-renew-result"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">
                Đã gia hạn {renewalResult.packageName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {renewalPaid
                  ? `Gói đã hoạt động đến ${renewalResult.endsAt}. Đã ghi nhận thanh toán tại quầy.`
                  : "Gia hạn đang chờ cho đến khi ghi nhận thanh toán."}
              </p>
            </div>
            <StatusPill status={renewalPaid ? "paid" : "pending"} />
          </div>
          {renewalPaid ? (
            <PaymentCompleteBanner
              message={
                paymentResult?.message ??
                "Đã thu tiền và kích hoạt gói. Không cần xác nhận thêm bên lễ tân."
              }
            />
          ) : (
            <div className="mt-4">
              <ManualPaymentPanel
                membership={renewalResult}
                onRecorded={setPaymentResult}
              />
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

function WorkflowCard({
  icon: Icon,
  label,
  title,
}: {
  icon: typeof RefreshCw
  label: string
  title: string
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</p>
        </div>
      </div>
    </section>
  )
}

function RenewalBox({
  emphasis,
  label,
  value,
}: {
  emphasis?: boolean
  label: string
  value: string
}) {
  return (
    <div className={`rounded-xl border p-4 text-center ${emphasis ? "border-primary bg-primary/10" : "border-border bg-background"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
