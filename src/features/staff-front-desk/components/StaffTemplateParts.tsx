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
    <nav
      aria-label="Staff operation steps"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const isDone = index < activeIndex
          const isActive = index === activeIndex

          return (
            <div className="flex items-center gap-3" key={step}>
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground",
                )}
              >
                {isDone ? <Check aria-hidden="true" className="size-4" /> : index + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-[0.16em]",
                    isActive || isDone ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Bước {index + 1}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {step}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
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
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Search aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tìm theo mã hội viên, số điện thoại, email hoặc tên.
          </p>
        </div>
      </div>

      <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={id}>
          {label}
        </label>
        <input
          className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
          data-testid={testId}
          id={id}
          placeholder={placeholder}
          {...registerInput}
        />
        <button
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
          type="submit"
        >
          <Search aria-hidden="true" className="size-4" />
          Tìm
        </button>
      </form>

      {error ? <p className="mt-3 text-sm font-medium text-destructive">{error}</p> : null}
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function StaffMemberCard({
  member,
  selected,
  onSelect,
  subtitle,
}: StaffMemberCardProps) {
  return (
    <button
      className="rounded-xl border border-border bg-background p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.98] data-[selected=true]:border-primary/40 data-[selected=true]:bg-primary/10 data-[selected=true]:shadow-sm"
      data-selected={selected}
      onClick={onSelect}
      type="button"
    >
      <span className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials(member.fullName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-foreground">{member.fullName}</span>
            <StatusPill status={toStatusPillStatus(member.membershipStatus)} />
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {subtitle ?? `${member.memberCode} · ${member.phone}`}
          </span>
          {member.email ? (
            <span className="mt-1 block truncate text-xs text-muted-foreground">
              {member.email}
            </span>
          ) : null}
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
      className="group relative flex min-h-[17rem] flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 data-[selected=true]:border-primary data-[selected=true]:bg-primary/10 data-[selected=true]:shadow-primary/10"
      data-selected={selected}
      disabled={!gymPackage.isActive}
      onClick={onSelect}
      type="button"
    >
      {recommended ? (
        <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-sm">
          Đề xuất
        </span>
      ) : null}

      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {isAnnual ? "Premium" : "Cơ bản"}
          </span>
          <span className="mt-2 block text-xl font-semibold text-foreground">
            {gymPackage.name}
          </span>
        </span>
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground",
          )}
        >
          {selected ? <Check aria-hidden="true" className="size-4" /> : <Circle aria-hidden="true" className="size-3" />}
        </span>
      </span>

      <span className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-black tracking-tight text-foreground">
          {price}
        </span>
        <span className="text-sm font-medium text-muted-foreground">VND</span>
      </span>
      <span className="mt-1 text-sm text-muted-foreground">
        {gymPackage.durationDays} ngày
      </span>

      <span className="mt-5 grid gap-2 text-sm text-muted-foreground">
        {[
          "Kích hoạt tại quầy lễ tân",
          "Hỗ trợ ghi nhận thanh toán thủ công",
          gymPackage.description ?? "Gói ra vào phòng tập",
        ].map((feature) => (
          <span className="flex items-start gap-2" key={feature}>
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
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
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
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
    <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
      <p className="border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {member?.fullName ?? "Chưa chọn hội viên"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
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
        "mt-5 rounded-2xl border p-5",
        isSuccess
          ? "border-primary/20 bg-primary/10 text-foreground"
          : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
      data-testid="staff-checkin-result"
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            isSuccess ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground",
          )}
        >
          {isSuccess ? (
            <ShieldCheck aria-hidden="true" className="size-6" />
          ) : (
            <AlertTriangle aria-hidden="true" className="size-6" />
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
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <CreditCard aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-orange-950">
              Cần ghi nhận thanh toán
            </p>
            <p className="mt-1 text-sm text-orange-900">
              Gói hội viên đang chờ cho đến khi lễ tân ghi nhận thanh toán.
            </p>
          </div>
        </div>
        <StatusPill status="pending" />
      </div>
      <button
        className="mt-4 min-h-11 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-foreground/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
    <p className="mt-4 flex items-start gap-3 rounded-2xl bg-primary/10 p-4 text-sm font-medium text-foreground">
      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      {message ?? "Đã ghi nhận thanh toán. Gói hội viên đang hoạt động."}
    </p>
  )
}

export function BlockedHint({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
      <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  )
}
