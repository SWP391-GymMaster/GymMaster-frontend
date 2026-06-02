"use client"

import type { ReactNode } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  CreditCard,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"

import { StatusPill } from "@/components/data/StatusPill"
import { cn } from "@/lib/utils"
import type {
  PackageOption,
  StaffFrontDeskMemberSummary,
} from "@/features/staff-front-desk/types/staff-front-desk.types"
import { toStatusPillStatus } from "@/features/staff-front-desk/utils/staff-status"

type StaffWizardStepperProps = {
  steps: string[]
  activeIndex: number
}

export function StaffWizardStepper({
  steps,
  activeIndex,
}: StaffWizardStepperProps) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-zinc-200 bg-white/90 p-4 shadow-sm md:grid-cols-4">
      {steps.map((step, index) => {
        const isDone = index < activeIndex
        const isActive = index === activeIndex

        return (
          <div className="flex items-center gap-3" key={step}>
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                isDone
                  ? "border-primary bg-primary text-white"
                  : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-200 bg-zinc-50 text-zinc-400",
              )}
            >
              {isDone ? <Check className="size-4" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.18em]",
                  isActive || isDone ? "text-primary" : "text-zinc-400",
                )}
              >
                Bước {index + 1}
              </p>
              <p className="truncate text-sm font-semibold text-zinc-950">
                {step}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

type StaffSearchPanelProps = {
  id: string
  testId: string
  label: string
  placeholder: string
  error?: string
  children: ReactNode
  onSubmit: () => void
  registerInput: UseFormRegisterReturn
}

export function StaffSearchPanel({
  id,
  testId,
  label,
  placeholder,
  error,
  children,
  onSubmit,
  registerInput,
}: StaffSearchPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-zinc-200 bg-white/90 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Search className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">{label}</h2>
          <p className="text-sm text-zinc-500">
            Tìm theo mã hội viên, số điện thoại, email hoặc tên.
          </p>
        </div>
      </div>
      <form className="mt-5 flex gap-2" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={id}>
          {label}
        </label>
        <input
          className="min-h-12 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-zinc-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          data-testid={testId}
          id={id}
          placeholder={placeholder}
          {...registerInput}
        />
        <button
          className="min-h-12 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary active:scale-[0.98]"
          type="submit"
        >
          Tìm
        </button>
      </form>
      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  )
}

type StaffMemberCardProps = {
  member: StaffFrontDeskMemberSummary
  selected: boolean
  onSelect: () => void
  subtitle?: string
}

export function StaffMemberCard({
  member,
  selected,
  onSelect,
  subtitle,
}: StaffMemberCardProps) {
  return (
    <button
      className="rounded-[1.25rem] border border-zinc-200 bg-white p-4 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg active:scale-[0.98] data-[selected=true]:border-primary data-[selected=true]:bg-primary/10"
      data-selected={selected}
      onClick={onSelect}
      type="button"
    >
      <span className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white">
          {member.fullName
            .split(" ")
            .map((part) => part[0])
            .slice(-2)
            .join("")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-zinc-950">{member.fullName}</span>
            <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
          </span>
          <span className="mt-1 block text-sm text-zinc-600">
            {subtitle ?? `${member.memberCode} · ${member.phone}`}
          </span>
        </span>
      </span>
    </button>
  )
}

type PackageCardProps = {
  gymPackage: PackageOption
  selected: boolean
  recommended?: boolean
  onSelect: () => void
}

export function PackageCard({
  gymPackage,
  selected,
  recommended,
  onSelect,
}: PackageCardProps) {
  const price = gymPackage.price.toLocaleString("vi-VN")
  const isAnnual = gymPackage.durationDays >= 300

  return (
    <button
      className="group relative flex min-h-[16rem] flex-col rounded-[1.5rem] border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 data-[selected=true]:border-primary data-[selected=true]:bg-primary/10 data-[selected=true]:shadow-primary/10"
      data-selected={selected}
      disabled={!gymPackage.isActive}
      onClick={onSelect}
      type="button"
    >
      {recommended ? (
        <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-sm">
          Đề xuất
        </span>
      ) : null}
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {isAnnual ? "Premium" : "Cơ bản"}
          </span>
          <span className="mt-2 block text-xl font-semibold text-zinc-950">
            {gymPackage.name}
          </span>
        </span>
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-white"
              : "border-zinc-300 bg-white text-zinc-300",
          )}
        >
          {selected ? <Check className="size-4" /> : <Circle className="size-3" />}
        </span>
      </span>
      <span className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-black tracking-tight text-zinc-950">
          {price}
        </span>
        <span className="text-sm font-medium text-zinc-500">VND</span>
      </span>
      <span className="mt-1 text-sm text-zinc-500">
        {gymPackage.durationDays} ngày
      </span>
      <span className="mt-5 grid gap-2 text-sm text-zinc-600">
        {[
          "Kích hoạt tại quầy lễ tân",
          "Hỗ trợ ghi nhận thanh toán thủ công",
          gymPackage.description ?? "Gói ra vào phòng tập",
        ].map((feature) => (
          <span className="flex items-start gap-2" key={feature}>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            {feature}
          </span>
        ))}
      </span>
    </button>
  )
}

type SummaryRowProps = {
  label: string
  value: ReactNode
}

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-3 last:border-b-0">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-zinc-950">{value}</dd>
    </div>
  )
}

type OrderSummaryShellProps = {
  title: string
  member?: StaffFrontDeskMemberSummary | null
  children: ReactNode
  footer: ReactNode
}

export function OrderSummaryShell({
  title,
  member,
  children,
  footer,
}: OrderSummaryShellProps) {
  return (
    <aside className="rounded-[1.5rem] border border-zinc-200 bg-white/95 p-5 shadow-sm lg:sticky lg:top-6">
      <p className="border-b border-zinc-200 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-950">
            {member?.fullName ?? "Chưa chọn hội viên"}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {member?.email ?? "Chọn hội viên để tiếp tục"}
          </p>
        </div>
      </div>
      <dl className="mt-4">{children}</dl>
      <div className="mt-5">{footer}</div>
    </aside>
  )
}

type CheckInResultPanelProps = {
  status: "success" | "blocked"
  message: string
  checkedInAt?: string | null
}

export function CheckInResultPanel({
  status,
  message,
  checkedInAt,
}: CheckInResultPanelProps) {
  const isSuccess = status === "success"

  return (
    <div
      className={cn(
        "mt-5 rounded-[1.5rem] border p-5",
        isSuccess
          ? "border-primary/20 bg-primary/10 text-foreground"
          : "border-red-200 bg-red-50 text-red-950",
      )}
      data-testid="staff-checkin-result"
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            isSuccess ? "bg-primary text-white" : "bg-red-600 text-white",
          )}
        >
          {isSuccess ? (
            <ShieldCheck className="size-6" />
          ) : (
            <AlertTriangle className="size-6" />
          )}
        </span>
        <div>
          <StatusPill status={isSuccess ? "checked-in" : "failed"} />
          <p className="mt-3 text-lg font-semibold">{message}</p>
          {checkedInAt ? (
            <p className="mt-1 text-sm opacity-80">Thời gian: {checkedInAt}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type PaymentRequiredBannerProps = {
  onRecordPayment: () => void
  isPending: boolean
  error?: ReactNode
}

export function PaymentRequiredBanner({
  onRecordPayment,
  isPending,
  error,
}: PaymentRequiredBannerProps) {
  return (
    <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-800">
            <CreditCard className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Cần ghi nhận thanh toán
            </p>
            <p className="mt-1 text-sm text-amber-900">
              Gói hội viên đang chờ cho đến khi lễ tân ghi nhận thanh toán.
            </p>
          </div>
        </div>
        <StatusPill status="pending" />
      </div>
      <button
        className="mt-4 min-h-11 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98]"
        data-testid="staff-record-payment-button"
        disabled={isPending}
        onClick={onRecordPayment}
      type="button"
    >
        {isPending ? "Đang ghi nhận..." : "Ghi nhận thanh toán tiền mặt"}
      </button>
      {error ? <div className="mt-3">{error}</div> : null}
    </section>
  )
}

export function PaymentCompleteBanner({ message }: { message?: string }) {
  return (
    <p className="mt-4 flex items-start gap-3 rounded-[1.5rem] bg-primary/10 p-4 text-sm font-medium text-foreground">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
      {message ?? "Đã ghi nhận thanh toán. Gói hội viên đang hoạt động."}
    </p>
  )
}

export function BlockedHint({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-900">
      <XCircle className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  )
}
