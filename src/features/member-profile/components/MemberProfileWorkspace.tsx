"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"
import {
  BadgeCheck,
  CalendarDays,
  KeyRound,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { UserAvatar } from "@/components/data/UserAvatar"
import { StateBlock } from "@/components/feedback/StateBlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useMyProfile,
  useUpdateMyProfile,
} from "@/features/member-profile/api/member-profile.queries"
import { AccountDialog } from "@/features/account/components/AccountDialog"
import {
  memberProfileSchema,
  type MemberProfileFormValues,
} from "@/features/member-profile/schemas/member-profile.schema"
import type {
  MyProfile,
  UpdateMyProfileInput,
} from "@/features/member-profile/types/member-profile.types"
import { ApiClientError } from "@/lib/api/http-client"
import { formatVnDate } from "@/lib/date/vn-time"
import { cn } from "@/lib/utils"

const inputClass =
  "min-h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10"

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"

const genderOptions = [
  { value: "unspecified", label: "Chưa cập nhật" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
] as const

const emptyFormValues: MemberProfileFormValues = {
  fullName: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  emergencyContact: "",
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : ""
}

function toUtcTimestamp(value?: string | null) {
  if (!value) return null
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(value)) return value
  return `${value}Z`
}

function formatIdentityDate(value?: string | null) {
  const utcValue = toUtcTimestamp(value)
  if (!utcValue) return "Chưa cập nhật"

  return formatVnDate(utcValue, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function toFormGender(value?: string | null): MemberProfileFormValues["gender"] {
  switch (value?.toLowerCase()) {
    case "male":
      return "male"
    case "female":
      return "female"
    case "other":
      return "other"
    default:
      return ""
  }
}

function toFormValues(profile: MyProfile): MemberProfileFormValues {
  return {
    fullName: profile.fullName,
    phone: profile.phone ?? "",
    dateOfBirth: toDateInput(profile.dateOfBirth),
    gender: toFormGender(profile.gender),
    address: profile.address ?? "",
    emergencyContact: profile.emergencyContact ?? "",
  }
}

function optionalText(value?: string | null) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : ""
}

function toDirtyInput(
  values: MemberProfileFormValues,
  dirtyFields: Partial<Record<keyof MemberProfileFormValues, boolean>>,
): UpdateMyProfileInput {
  const input: UpdateMyProfileInput = {}

  if (dirtyFields.fullName) {
    input.fullName = values.fullName.trim()
  }

  if (dirtyFields.phone) {
    input.phone = optionalText(values.phone)
  }

  if (dirtyFields.dateOfBirth) {
    input.dateOfBirth = optionalText(values.dateOfBirth) || null
  }

  if (dirtyFields.gender) {
    input.gender = optionalText(values.gender)
  }

  if (dirtyFields.address) {
    input.address = optionalText(values.address)
  }

  if (dirtyFields.emergencyContact) {
    input.emergencyContact = optionalText(values.emergencyContact)
  }

  return input
}

function formatGender(gender?: string | null) {
  switch (gender?.toLowerCase()) {
    case "male":
      return "Nam"
    case "female":
      return "Nữ"
    case "other":
      return "Khác"
    default:
      return "Chưa cập nhật"
  }
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
      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  )
}

function IdentityItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {value || "Chưa cập nhật"}
          </p>
        </div>
      </div>
    </article>
  )
}

function FormErrorSummary({
  errors,
  message,
}: {
  errors: FieldErrors<MemberProfileFormValues>
  message: string | null
}) {
  const hasFieldErrors = Object.keys(errors).length > 0

  if (!message && !hasFieldErrors) return null

  return (
    <div
      className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
      role="alert"
    >
      {message ?? "Vui lòng kiểm tra lại các trường thông tin."}
    </div>
  )
}

export function MemberProfileWorkspace() {
  const profileQuery = useMyProfile()
  const updateProfile = useUpdateMyProfile()
  const [formError, setFormError] = useState<string | null>(null)
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const profile = profileQuery.data
  const defaultValues = useMemo<MemberProfileFormValues>(
    () =>
      profile
        ? toFormValues(profile)
        : emptyFormValues,
    [profile],
  )

  const {
    control,
    formState: { dirtyFields, errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<MemberProfileFormValues>({
    resolver: zodResolver(memberProfileSchema),
    defaultValues,
  })
  const watchedGender = useWatch({ control, name: "gender" })

  useEffect(() => {
    if (profile) {
      reset(toFormValues(profile))
    }
  }, [profile, reset])

  async function onSubmit(values: MemberProfileFormValues) {
    setFormError(null)
    const input = toDirtyInput(values, dirtyFields)

    if (Object.keys(input).length === 0) {
      return
    }

    try {
      const updatedProfile = await updateProfile.mutateAsync(input)
      reset(toFormValues(updatedProfile))
    } catch (error) {
      if (error instanceof ApiClientError && error.code === "DUPLICATE") {
        setError("phone", {
          type: "server",
          message: "Số điện thoại này đã được sử dụng.",
        })
        return
      }

      setFormError(
        error instanceof Error && error.message
          ? error.message
          : "Không cập nhật được hồ sơ. Vui lòng thử lại.",
      )
    }
  }

  if (profileQuery.isLoading) {
    return (
      <StateBlock
        className="rounded-[1.5rem]"
        description="GymMaster đang mở hồ sơ tài khoản của bạn."
        title="Đang tải hồ sơ..."
        tone="loading"
      />
    )
  }

  if (profileQuery.isError) {
    return (
      <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
        <StateBlock
          description="Vui lòng thử lại hoặc đăng nhập lại nếu phiên đã hết hạn."
          title="Không tải được hồ sơ"
          tone="error"
        />
        <Button
          className="mt-4 min-h-11 rounded-full active:scale-[0.98]"
          onClick={() => void profileQuery.refetch()}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Tải lại
        </Button>
      </section>
    )
  }

  if (!profile) {
    return (
      <StateBlock
        description="Hệ thống chưa nhận được dữ liệu hồ sơ. Vui lòng tải lại trang."
        title="Chưa có dữ liệu hồ sơ"
        tone="empty"
      />
    )
  }

  const genderValue = watchedGender || "unspecified"

  return (
    <>
      <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <IdentityItem icon={Mail} label="Email" value={profile.email} />
        <IdentityItem
          icon={BadgeCheck}
          label="Mã hội viên"
          value={profile.memberCode}
        />
        <IdentityItem
          icon={CalendarDays}
          label="Ngày tham gia"
          value={formatIdentityDate(profile.joinedAt)}
        />
      </div>

      <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar
              avatarUrl={profile.avatarUrl}
              name={profile.fullName}
              size="lg"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Ảnh đại diện và tài khoản
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Ảnh, họ tên và số điện thoại được dùng chung trong toàn bộ GymMaster.
              </p>
            </div>
          </div>
          <Button
            className="min-h-11 rounded-full active:scale-[0.98]"
            onClick={() => setIsAccountOpen(true)}
            type="button"
            variant="outline"
          >
            <UserRound aria-hidden="true" className="size-4" />
            Tài khoản của tôi
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Hồ sơ của tôi
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Thông tin cá nhân
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Cập nhật thông tin để quầy lễ tân và PT nhận diện bạn chính xác hơn.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-primary" />
              {formatGender(profile.gender)}
            </span>
          </div>

          <form
            className="mt-6 grid gap-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormErrorSummary errors={errors} message={formError} />

            <div className="grid gap-5 lg:grid-cols-2">
              <Field
                error={errors.fullName?.message}
                htmlFor="member-profile-full-name"
                label="Họ và tên"
              >
                <Input
                  aria-invalid={Boolean(errors.fullName)}
                  className={inputClass}
                  data-testid="member-profile-full-name"
                  id="member-profile-full-name"
                  {...register("fullName")}
                />
              </Field>

              <Field
                error={errors.phone?.message}
                htmlFor="member-profile-phone"
                label="Số điện thoại"
              >
                <Input
                  aria-invalid={Boolean(errors.phone)}
                  className={inputClass}
                  data-testid="member-profile-phone"
                  id="member-profile-phone"
                  inputMode="tel"
                  placeholder="0900000001"
                  {...register("phone")}
                />
              </Field>

              <Field
                error={errors.dateOfBirth?.message}
                htmlFor="member-profile-date-of-birth"
                label="Ngày sinh"
              >
                <Input
                  aria-invalid={Boolean(errors.dateOfBirth)}
                  className={inputClass}
                  data-testid="member-profile-date-of-birth"
                  id="member-profile-date-of-birth"
                  type="date"
                  {...register("dateOfBirth")}
                />
              </Field>

              <Field
                error={errors.gender?.message}
                htmlFor="member-profile-gender"
                label="Giới tính"
              >
                <Select
                  onValueChange={(value) =>
                    setValue(
                      "gender",
                      (value === "unspecified"
                        ? ""
                        : value) as MemberProfileFormValues["gender"],
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                  value={genderValue}
                >
                  <SelectTrigger
                    aria-invalid={Boolean(errors.gender)}
                    className="min-h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                    data-testid="member-profile-gender"
                    id="member-profile-gender"
                  >
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-border bg-card text-card-foreground">
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                error={errors.address?.message}
                htmlFor="member-profile-address"
                label="Địa chỉ"
              >
                <Input
                  aria-invalid={Boolean(errors.address)}
                  className={inputClass}
                  data-testid="member-profile-address"
                  id="member-profile-address"
                  {...register("address")}
                />
              </Field>

              <Field
                error={errors.emergencyContact?.message}
                htmlFor="member-profile-emergency-contact"
                label="Liên hệ khẩn cấp"
              >
                <Input
                  aria-invalid={Boolean(errors.emergencyContact)}
                  className={inputClass}
                  data-testid="member-profile-emergency-contact"
                  id="member-profile-emergency-contact"
                  {...register("emergencyContact")}
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Chỉ các trường đã thay đổi mới được gửi lên hệ thống.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className={cn(
                    "min-h-11 rounded-full px-5 active:scale-[0.98]",
                    !isDirty ? "opacity-70" : "",
                  )}
                  disabled={!isDirty || isSubmitting || updateProfile.isPending}
                  type="submit"
                >
                  <Save aria-hidden="true" className="size-4" />
                  {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </form>
        </section>

        <aside className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound aria-hidden="true" className="size-5" />
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
            Bảo mật tài khoản
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Mật khẩu được quản lý riêng với hồ sơ cá nhân. Nếu bạn đăng nhập bằng
            Google, hãy dùng Quên mật khẩu để tạo mật khẩu trước khi đổi.
          </p>
          <Button
            asChild
            className="mt-5 min-h-11 w-full rounded-full active:scale-[0.98]"
            variant="outline"
          >
            <Link href="/change-password">
              <KeyRound aria-hidden="true" className="size-4" />
              Đổi mật khẩu
            </Link>
          </Button>
        </aside>
      </div>
      </section>
      <AccountDialog open={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </>
  )
}
