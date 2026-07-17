"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, type ReactNode } from "react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Hash,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { RoleBadge } from "@/components/data/RoleBadge"
import { StatusPill, type Status } from "@/components/data/StatusPill"
import { StateBlock } from "@/components/feedback/StateBlock"
import { DateOfBirthField } from "@/components/forms/DateOfBirthField"
import { GenderSelect } from "@/components/forms/GenderSelect"
import { PhoneField } from "@/components/forms/PhoneField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InstallAppAction } from "@/components/pwa/InstallAppAction"
import { toCanonicalGender } from "@/lib/validation/person"
import {
  useMyPersonalProfile,
  useMyTrainerProfile,
  useUpdateMyAccount,
  useUpdateMyPersonalProfile,
} from "@/features/account/api/account.queries"
import { AccountAvatarUploader } from "@/features/account/components/AccountAvatarUploader"
import {
  accountPersonalProfileSchema,
  accountSchema,
  type AccountFormValues,
  type AccountPersonalProfileFormValues,
} from "@/features/account/schemas/account.schema"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { ApiClientError } from "@/lib/api/http-client"
import type { UserRole } from "@/types/auth"

type AccountProfileWorkspaceProps = {
  role: Extract<UserRole, "admin" | "staff" | "pt">
}

const inputClass =
  "min-h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"

const emptyPersonalValues: AccountPersonalProfileFormValues = {
  dateOfBirth: "",
  gender: "",
  address: "",
  emergencyContact: "",
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : ""
}

function toPersonalFormValues(
  profile?: {
    dateOfBirth?: string | null
    gender?: string | null
    address?: string | null
    emergencyContact?: string | null
  } | null,
): AccountPersonalProfileFormValues {
  return {
    dateOfBirth: toDateInput(profile?.dateOfBirth),
    gender: toFormGender(profile?.gender),
    address: profile?.address ?? "",
    emergencyContact: profile?.emergencyContact ?? "",
  }
}

function toFormGender(value?: string | null): AccountPersonalProfileFormValues["gender"] {
  return toCanonicalGender(value)
}

function optionalText(value?: string | null) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

function displayText(value?: string | null) {
  return optionalText(value) ?? "Chưa cập nhật"
}

function formatExperience(value?: number | null) {
  return value == null ? "Chưa cập nhật" : `${value} năm`
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode
  error?: string
  htmlFor: string
  label: string
}) {
  return (
    <div className="grid gap-2">
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  )
}

function InfoRow({
  children,
  icon: Icon,
  label,
}: {
  children: ReactNode
  icon: LucideIcon
  label: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-sm font-semibold text-foreground">
        {children}
      </span>
    </div>
  )
}

function DetailRow({
  label,
  multiline,
  value,
}: {
  label: string
  multiline?: boolean
  value: ReactNode
}) {
  return (
    <div className={multiline ? "grid gap-1.5 py-3" : "flex items-center justify-between gap-3 py-3"}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={
          multiline
            ? "text-sm leading-6 text-foreground"
            : "min-w-0 truncate text-right text-sm font-semibold text-foreground"
        }
      >
        {value}
      </span>
    </div>
  )
}

function FormErrorSummary({
  errors,
  message,
}: {
  errors: FieldErrors<AccountFormValues | AccountPersonalProfileFormValues>
  message: string | null
}) {
  const hasFieldErrors = Object.keys(errors).length > 0

  if (!message && !hasFieldErrors) return null

  return (
    <div
      className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
      role="alert"
    >
      {message ?? "Vui lòng kiểm tra lại thông tin."}
    </div>
  )
}

function ProfessionalProfileCard() {
  const trainerProfile = useMyTrainerProfile()
  const isNotFound =
    trainerProfile.error instanceof ApiClientError &&
    trainerProfile.error.code === "NOT_FOUND"

  return (
    <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BriefcaseBusiness aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Hồ sơ chuyên môn
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Thông tin PT
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Chuyên môn do quản trị viên quản lý, PT chỉ xem tại đây.
          </p>
        </div>
      </div>

      {trainerProfile.isLoading ? (
        <StateBlock
          className="mt-5 rounded-2xl"
          description="Đang tải hồ sơ chuyên môn của bạn."
          title="Đang tải hồ sơ PT..."
          tone="loading"
        />
      ) : isNotFound ? (
        <StateBlock
          className="mt-5 rounded-2xl"
          description="Liên hệ quản trị viên để tạo hồ sơ PT trước khi cập nhật thông tin cá nhân."
          title="Chưa có hồ sơ huấn luyện viên"
          tone="empty"
        />
      ) : trainerProfile.isError ? (
        <StateBlock
          className="mt-5 rounded-2xl"
          description="Vui lòng thử lại sau hoặc liên hệ quản trị viên."
          title="Không tải được hồ sơ chuyên môn"
          tone="error"
        />
      ) : (
        <div className="mt-3 divide-y divide-border">
          <DetailRow label="Chuyên môn" value={displayText(trainerProfile.data?.specialty)} />
          <DetailRow label="Kinh nghiệm" value={formatExperience(trainerProfile.data?.yearsOfExperience)} />
          <DetailRow label="Bio" multiline value={displayText(trainerProfile.data?.bio)} />
        </div>
      )}
    </section>
  )
}

function AccountInfoCard() {
  const user = useAuthSessionStore((state) => state.session?.user ?? null)
  const updateAccount = useUpdateMyAccount()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
    },
  })

  useEffect(() => {
    reset({
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
    })
  }, [reset, user?.fullName, user?.phone])

  async function onSubmit(values: AccountFormValues) {
    try {
      await updateAccount.mutateAsync({
        fullName: values.fullName,
        phone: values.phone || null,
      })
      reset(values)
    } catch (error) {
      if (error instanceof ApiClientError && error.code === "DUPLICATE") {
        setError("phone", {
          type: "server",
          message: "Số điện thoại này đã được sử dụng.",
        })
      }
    }
  }

  const status: Status = user?.status === "locked" ? "locked" : "active"

  return (
    <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Thông tin tài khoản
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Tên hiển thị và liên hệ
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Email và trạng thái do hệ thống quản lý.
        </p>
      </div>

      <form className="mt-6 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
        <FormErrorSummary errors={errors} message={null} />
        <div className="grid gap-5 md:grid-cols-2">
          <Field error={errors.fullName?.message} htmlFor="account-profile-full-name" label="Họ và tên">
            <Input
              aria-invalid={Boolean(errors.fullName)}
              className={inputClass}
              data-testid="account-profile-full-name"
              id="account-profile-full-name"
              {...register("fullName")}
            />
          </Field>
          <Field error={errors.phone?.message} htmlFor="account-profile-phone" label="Số điện thoại">
            <PhoneField
              aria-invalid={Boolean(errors.phone)}
              className={inputClass}
              data-testid="account-profile-phone"
              id="account-profile-phone"
              {...register("phone")}
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-border bg-[var(--surface-panel-muted)] p-4">
          <div className="divide-y divide-border">
            <InfoRow icon={Mail} label="Email">
              {user?.email ?? "—"}
            </InfoRow>
            <InfoRow icon={Hash} label="Mã tài khoản">
              {user?.userId ? `#${user.userId}` : "—"}
            </InfoRow>
            <InfoRow icon={BadgeCheck} label="Trạng thái">
              <StatusPill status={status} />
            </InfoRow>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-5">
          <Button
            className="min-h-11 rounded-full px-5 active:scale-[0.98]"
            disabled={isSubmitting || updateAccount.isPending}
            type="submit"
          >
            <Save aria-hidden="true" className="size-4" />
            {updateAccount.isPending ? "Đang lưu..." : "Lưu tài khoản"}
          </Button>
        </div>
      </form>
    </section>
  )
}

function PersonalProfileCard({ role }: AccountProfileWorkspaceProps) {
  const profileQuery = useMyPersonalProfile()
  const updateProfile = useUpdateMyPersonalProfile()
  const isPtNotFound =
    role === "pt" &&
    profileQuery.error instanceof ApiClientError &&
    profileQuery.error.code === "NOT_FOUND"

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<AccountPersonalProfileFormValues>({
    resolver: zodResolver(accountPersonalProfileSchema),
    defaultValues: emptyPersonalValues,
  })
  const watchedGender = useWatch({ control, name: "gender" })

  useEffect(() => {
    if (profileQuery.data) {
      reset(toPersonalFormValues(profileQuery.data))
    }
  }, [profileQuery.data, reset])

  async function onSubmit(values: AccountPersonalProfileFormValues) {
    const updated = await updateProfile.mutateAsync({
      dateOfBirth: optionalText(values.dateOfBirth),
      gender: optionalText(values.gender),
      address: optionalText(values.address),
      emergencyContact: optionalText(values.emergencyContact),
    })
    reset(toPersonalFormValues(updated))
  }

  const disabled = profileQuery.isLoading || isPtNotFound || updateProfile.isPending

  return (
    <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Thông tin cá nhân
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Hồ sơ vận hành
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Dữ liệu này giúp đội vận hành nhận diện và liên hệ bạn khi cần.
        </p>
      </div>

      {isPtNotFound ? (
        <StateBlock
          className="mt-5 rounded-2xl"
          description="Liên hệ quản trị viên để tạo hồ sơ trước khi cập nhật thông tin cá nhân."
          title="Chưa có hồ sơ huấn luyện viên"
          tone="empty"
        />
      ) : profileQuery.isError ? (
        <StateBlock
          className="mt-5 rounded-2xl"
          description="Vui lòng thử lại hoặc đăng nhập lại nếu phiên đã hết hạn."
          title="Không tải được thông tin cá nhân"
          tone="error"
        />
      ) : (
        <form className="mt-6 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <FormErrorSummary errors={errors} message={null} />
          <div className="grid gap-5 md:grid-cols-2">
            <Field error={errors.dateOfBirth?.message} htmlFor="account-profile-date-of-birth" label="Ngày sinh">
              <DateOfBirthField
                aria-invalid={Boolean(errors.dateOfBirth)}
                className={inputClass}
                data-testid="account-profile-date-of-birth"
                disabled={disabled}
                id="account-profile-date-of-birth"
                {...register("dateOfBirth")}
              />
            </Field>
            <Field error={errors.gender?.message} htmlFor="account-profile-gender" label="Giới tính">
              <GenderSelect
                disabled={disabled}
                id="account-profile-gender"
                onChange={(value) =>
                  setValue("gender", value, { shouldDirty: true, shouldValidate: true })
                }
                testId="account-profile-gender"
                value={watchedGender}
              />
            </Field>
            <Field error={errors.address?.message} htmlFor="account-profile-address" label="Địa chỉ">
              <Input
                aria-invalid={Boolean(errors.address)}
                className={inputClass}
                data-testid="account-profile-address"
                disabled={disabled}
                id="account-profile-address"
                {...register("address")}
              />
            </Field>
            <Field
              error={errors.emergencyContact?.message}
              htmlFor="account-profile-emergency-contact"
              label="Liên hệ khẩn cấp"
            >
              <Input
                aria-invalid={Boolean(errors.emergencyContact)}
                className={inputClass}
                data-testid="account-profile-emergency-contact"
                disabled={disabled}
                id="account-profile-emergency-contact"
                {...register("emergencyContact")}
              />
            </Field>
          </div>
          <div className="flex justify-end border-t border-border pt-5">
            <Button
              className="min-h-11 rounded-full px-5 active:scale-[0.98]"
              data-testid="account-personal-submit"
              disabled={disabled || isSubmitting}
              type="submit"
            >
              <Save aria-hidden="true" className="size-4" />
              {updateProfile.isPending ? "Đang lưu..." : "Lưu thông tin cá nhân"}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

function SecurityCard() {
  return (
    <aside className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck aria-hidden="true" className="size-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        Bảo mật tài khoản
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Mật khẩu được quản lý riêng với hồ sơ cá nhân. Nếu đăng nhập bằng Google, dùng Quên mật khẩu để tạo mật khẩu trước khi đổi.
      </p>
      <Button asChild className="mt-5 min-h-11 w-full rounded-full active:scale-[0.98]" variant="outline">
        <Link href="/change-password">
          <KeyRound aria-hidden="true" className="size-4" />
          Đổi mật khẩu
        </Link>
      </Button>
    </aside>
  )
}

export function AccountProfileWorkspace({ role }: AccountProfileWorkspaceProps) {
  const user = useAuthSessionStore((state) => state.session?.user ?? null)
  const previewName = user?.fullName ?? "GymMaster"

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Tài khoản
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {previewName}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Email
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Vai trò
              </p>
              <div className="mt-1">
                <RoleBadge role={role} />
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
        <AccountAvatarUploader
          avatarUrl={user?.avatarUrl}
          description="Tải ảnh đại diện JPG, PNG hoặc WebP để đồng nghiệp nhận diện bạn nhanh hơn."
          inputId="account-profile-avatar-file"
          inputTestId="account-profile-avatar-input"
          name={previewName}
          title="Ảnh đại diện"
          variant="inline"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <AccountInfoCard />
          <PersonalProfileCard role={role} />
          {role === "pt" ? <ProfessionalProfileCard /> : null}
        </div>
        <div className="grid content-start gap-6">
          <SecurityCard />
          <InstallAppAction />
        </div>
      </div>
    </section>
  )
}
