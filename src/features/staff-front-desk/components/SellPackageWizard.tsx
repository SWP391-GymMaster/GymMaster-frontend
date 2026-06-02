"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { CreditCard, PackagePlus, UserPlus, WalletCards } from "lucide-react"

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
    toast.success("Đã tạo giao dịch bán gói")
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <WorkflowCard icon={PackagePlus} label="Trạng thái bán" title={saleResult ? "Đã tạo đơn" : "Chờ thanh toán"} />
        <WorkflowCard icon={CreditCard} label="Nguồn gói" title="Mock API catalog" />
        <WorkflowCard icon={WalletCards} label="Phương thức thanh toán" title="Xác nhận thủ công" />
      </section>

      <StaffWizardStepper
        activeIndex={activeStep}
        steps={["Hội viên", "Gói tập", "Thanh toán", "Xác nhận"]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-5">
          <StaffSearchPanel
            error={searchErrors.query?.message}
            id="sell-member-search"
            label="1. Chọn hội viên"
            onSubmit={handleSearchSubmit(onSearch)}
            placeholder="Tên, email, số điện thoại hoặc mã hội viên"
            registerInput={registerSearch("query")}
            testId="staff-sell-member-search"
          >
            {!submittedQuery ? (
              <StateBlock
                description="Tìm theo mã hội viên, số điện thoại, email hoặc tên trước khi tạo giao dịch bán gói."
                title="Tìm để chọn hội viên."
                tone="empty"
              />
            ) : null}
            {members.isLoading ? (
              <StateBlock
                description="Đang tải hồ sơ hội viên đủ điều kiện trước khi bán gói."
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
                  setSaleResult(null)
                  setPaymentResult(null)
                  setValue("memberId", member.id, { shouldValidate: true })
                }}
                selected={selectedMember?.id === member.id}
              />
            ))}
          </StaffSearchPanel>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  2. Chọn gói tập
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gợi ý các gói tập phù hợp với nhu cầu của hội viên.
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

            {selectedPackage ? (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm font-medium text-foreground">
                Gợi ý: {selectedPackage.name} phù hợp để bắt đầu hoặc duy trì lịch tập ổn định.
              </div>
            ) : null}
          </section>
        </div>

        <OrderSummaryShell
          footer={
            <>
              <form onSubmit={handleSaleSubmit(onSubmitSale)}>
                {saleErrors.memberId ||
                saleErrors.packageId ||
                saleErrors.startDate ? (
                  <p className="mt-3 text-sm font-medium text-destructive">
                    {saleErrors.memberId?.message ??
                      saleErrors.packageId?.message ??
                      saleErrors.startDate?.message}
                  </p>
                ) : null}
                <button
                  className="mt-4 min-h-12 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="staff-sell-submit-button"
                  disabled={sell.isPending}
                  type="submit"
                >
                  {sell.isPending ? "Đang tạo..." : "Xác nhận bán gói"}
                </button>
              </form>

              {operationError ? (
                <StateBlock
                  className="mt-3"
                  description="Kiểm tra lại hội viên và gói đã chọn, sau đó thử lại."
                  title={operationError.message}
                  tone="error"
                />
              ) : null}
            </>
          }
          member={selectedMember}
          title="Tóm tắt giao dịch"
        >
          <SummaryRow
            label="Gói tập"
            value={selectedPackage?.name ?? "Chưa chọn"}
          />
          <SummaryRow label="Ngày bắt đầu" value={today} />
          <SummaryRow
            label="Tổng tiền"
            value={
              selectedPackage
                ? `${selectedPackage.price.toLocaleString("vi-VN")} VND`
                : "Đang chờ"
            }
          />
        </OrderSummaryShell>
      </div>

      {saleResult ? (
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          data-testid="staff-sell-result"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">
                Đã tạo bán gói {saleResult.packageName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Gói hội viên đang chờ cho đến khi ghi nhận thanh toán.
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

function WorkflowCard({
  icon: Icon,
  label,
  title,
}: {
  icon: typeof PackagePlus
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
