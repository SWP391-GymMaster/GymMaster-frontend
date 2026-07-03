"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Hash,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RoleBadge } from "@/components/data/RoleBadge"
import { StatusPill, type Status } from "@/components/data/StatusPill"
import {
  useMyTrainerProfile,
  useUpdateMyAccount,
} from "@/features/account/api/account.queries"
import { AccountAvatarUploader } from "@/features/account/components/AccountAvatarUploader"
import {
  accountSchema,
  type AccountFormValues,
} from "@/features/account/schemas/account.schema"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { useMyProfile } from "@/features/member-profile/api/member-profile.queries"
import { ApiClientError } from "@/lib/api/http-client"
import { formatVnDate } from "@/lib/date/vn-time"
import type { UserRole } from "@/types/auth"

type AccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const inputClassName =
  "min-h-11 rounded-2xl border-border bg-background px-3 text-sm text-foreground"

const emptyValue = "Chưa cập nhật"

function ReadOnlyRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  )
}

function RoleDetailRow({
  label,
  multiline,
  value,
}: {
  label: string
  multiline?: boolean
  value: ReactNode
}) {
  return (
    <div
      className={
        multiline
          ? "grid gap-1.5 py-2.5"
          : "flex items-center justify-between gap-3 py-2.5"
      }
    >
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span
        className={
          multiline
            ? "text-sm leading-6 text-foreground"
            : "min-w-0 truncate text-right text-sm font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  )
}

function SectionStateLine({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 rounded-2xl border border-border bg-[var(--surface-panel-muted)] px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  )
}

function displayText(value?: string | null) {
  const trimmed = value?.trim() ?? ""

  return trimmed.length > 0 ? trimmed : emptyValue
}

function formatRoleDate(value?: string | null) {
  if (!value) {
    return emptyValue
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return emptyValue
  }

  return formatVnDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatGender(value?: string | null) {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return emptyValue
  }

  if (normalized === "male" || normalized === "nam") {
    return "Nam"
  }

  if (normalized === "female" || normalized === "nu" || normalized === "nữ") {
    return "Nữ"
  }

  if (normalized === "other" || normalized === "khac" || normalized === "khác") {
    return "Khác"
  }

  return value ?? emptyValue
}

function formatExperience(value?: number | null) {
  return value == null ? emptyValue : `${value} năm`
}

function AccountRoleSection({
  open,
  role,
}: {
  open: boolean
  role: UserRole | null
}) {
  const memberProfileQuery = useMyProfile({
    enabled: open && role === "member",
  })
  const trainerProfileQuery = useMyTrainerProfile({
    enabled: open && role === "pt",
  })

  if (role === "member") {
    const profile = memberProfileQuery.data

    return (
      <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Hồ sơ hội viên
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Dữ liệu hội viên do hồ sơ đầy đủ quản lý, không lặp lại biểu mẫu tại đây.
            </p>
          </div>
          <Button
            asChild
            className="min-h-9 rounded-full active:scale-[0.98]"
            size="sm"
            variant="outline"
          >
            <Link href="/member/profile">Mở hồ sơ đầy đủ</Link>
          </Button>
        </div>

        {memberProfileQuery.isLoading ? (
          <SectionStateLine>Đang tải hồ sơ hội viên...</SectionStateLine>
        ) : memberProfileQuery.isError ? (
          <SectionStateLine>Chưa tải được hồ sơ hội viên.</SectionStateLine>
        ) : (
          <div className="mt-3 divide-y divide-border">
            <ReadOnlyRow icon={Hash} label="Mã hội viên">
              {profile?.memberCode || emptyValue}
            </ReadOnlyRow>
            <ReadOnlyRow icon={CalendarDays} label="Ngày tham gia">
              {formatRoleDate(profile?.joinedAt)}
            </ReadOnlyRow>
          </div>
        )}
      </section>
    )
  }

  if (role === "pt") {
    const profile = trainerProfileQuery.data
    const isNotFound =
      trainerProfileQuery.error instanceof ApiClientError &&
      trainerProfileQuery.error.code === "NOT_FOUND"

    return (
      <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <BriefcaseBusiness aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Hồ sơ chuyên môn
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Thông tin nghề nghiệp được đồng bộ từ hồ sơ PT do quản trị viên quản lý.
            </p>
          </div>
        </div>

        {trainerProfileQuery.isLoading ? (
          <SectionStateLine>Đang tải hồ sơ chuyên môn...</SectionStateLine>
        ) : isNotFound ? (
          <SectionStateLine>
            Chưa có hồ sơ chuyên môn — liên hệ quản trị viên.
          </SectionStateLine>
        ) : trainerProfileQuery.isError ? (
          <SectionStateLine>Chưa tải được hồ sơ chuyên môn.</SectionStateLine>
        ) : (
          <div className="mt-3 divide-y divide-border">
            <RoleDetailRow
              label="Chuyên môn"
              value={displayText(profile?.specialty)}
            />
            <RoleDetailRow
              label="Kinh nghiệm"
              value={formatExperience(profile?.yearsOfExperience)}
            />
            <RoleDetailRow
              label="Ngày sinh"
              value={formatRoleDate(profile?.dateOfBirth)}
            />
            <RoleDetailRow
              label="Giới tính"
              value={formatGender(profile?.gender)}
            />
            <RoleDetailRow
              label="Bio"
              multiline
              value={displayText(profile?.bio)}
            />
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Do quản trị viên quản lý — liên hệ admin để cập nhật.
        </p>
      </section>
    )
  }

  return null
}

function FormErrorSummary({
  errors,
  message,
}: {
  errors: FieldErrors<AccountFormValues>
  message: string | null
}) {
  const hasFieldErrors = Object.keys(errors).length > 0

  if (!message && !hasFieldErrors) {
    return null
  }

  return (
    <div
      className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
      role="alert"
    >
      {message ?? "Vui lòng kiểm tra lại thông tin tài khoản."}
    </div>
  )
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const user = useAuthSessionStore((state) => state.session?.user ?? null)
  const role = useAuthSessionStore((state) => state.session?.role ?? null)
  const updateAccount = useUpdateMyAccount()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
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
  const watchedFullName = useWatch({ control, name: "fullName" })

  useEffect(() => {
    if (open) {
      reset({
        fullName: user?.fullName ?? "",
        phone: user?.phone ?? "",
      })
    }
  }, [open, reset, user?.fullName, user?.phone])

  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFormError(null)
    }

    onOpenChange(nextOpen)
  }

  async function onSubmit(values: AccountFormValues) {
    setFormError(null)

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
        return
      }

      setFormError(
        error instanceof Error && error.message
          ? error.message
          : "Không cập nhật được tài khoản. Vui lòng thử lại.",
      )
    }
  }

  const previewName = watchedFullName || user?.fullName || "GymMaster"
  const isPending = isSubmitting || updateAccount.isPending
  const accountStatus: Status = user?.status === "locked" ? "locked" : "active"

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-[1.5rem] p-0 sm:max-w-[44rem]">
        <DialogHeader className="border-b border-border p-6 pb-5">
          <DialogTitle>Tài khoản của tôi</DialogTitle>
          <DialogDescription>
            Cập nhật ảnh đại diện, họ tên và số điện thoại dùng chung cho tài khoản GymMaster.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 p-6 md:grid-cols-[220px_minmax(0,1fr)]">
          {/* Khối định danh: ảnh + tên + email + vai trò (đồng bộ với trang hồ sơ member) */}
          <section className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-border bg-[var(--surface-panel-muted)] p-5 text-center shadow-sm">
            <AccountAvatarUploader
              avatarUrl={user?.avatarUrl}
              inputId="account-avatar-file"
              inputTestId="account-avatar-input"
              name={previewName}
            />

            <div className="grid w-full justify-items-center gap-1.5 border-t border-border pt-4">
              <p className="max-w-full truncate text-sm font-semibold text-foreground">
                {previewName}
              </p>
              {user?.email ? (
                <p className="max-w-full truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              ) : null}
              {role ? <RoleBadge role={role} /> : null}
            </div>
          </section>

          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <FormErrorSummary errors={errors} message={formError} />

            <div className="grid gap-5 rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Thông tin liên hệ
              </p>

              <div className="grid gap-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  htmlFor="account-full-name"
                >
                  Họ tên
                </label>
                <Input
                  aria-invalid={Boolean(errors.fullName)}
                  className={inputClassName}
                  data-testid="account-full-name"
                  id="account-full-name"
                  {...register("fullName")}
                />
                {errors.fullName ? (
                  <p className="text-sm font-medium text-destructive">
                    {errors.fullName.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  htmlFor="account-phone"
                >
                  Số điện thoại
                </label>
                <Input
                  aria-invalid={Boolean(errors.phone)}
                  className={inputClassName}
                  data-testid="account-phone"
                  id="account-phone"
                  inputMode="tel"
                  placeholder="0900000001"
                  {...register("phone")}
                />
                {errors.phone ? (
                  <p className="text-sm font-medium text-destructive">
                    {errors.phone.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Thông tin tài khoản — chỉ xem, không sửa (email là danh tính đăng nhập) */}
            <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Thông tin tài khoản
              </p>
              <div className="mt-2 divide-y divide-border">
                <ReadOnlyRow icon={Mail} label="Email">
                  {user?.email ?? "—"}
                </ReadOnlyRow>
                <ReadOnlyRow icon={Hash} label="Mã tài khoản">
                  {user?.userId ? `#${user.userId}` : "—"}
                </ReadOnlyRow>
                <ReadOnlyRow icon={BadgeCheck} label="Trạng thái">
                  <StatusPill status={accountStatus} />
                </ReadOnlyRow>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Email và trạng thái do hệ thống quản lý, không thể tự chỉnh sửa.
              </p>
            </div>

            <AccountRoleSection open={open} role={role} />

            {/* Bảo mật: gợi ý Google thu gọn + nút đổi mật khẩu */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border bg-[var(--surface-panel-muted)] px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                </span>
                <p className="min-w-0 text-xs leading-5 text-muted-foreground">
                  Đăng nhập bằng Google? Dùng Quên mật khẩu để tạo mật khẩu trước khi đổi.
                </p>
              </div>
              <Button
                asChild
                className="min-h-9 rounded-full active:scale-[0.98]"
                size="sm"
                variant="outline"
              >
                <Link href="/change-password">
                  <KeyRound aria-hidden="true" className="size-4" />
                  Đổi mật khẩu
                </Link>
              </Button>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                className="min-h-11 rounded-full px-5 active:scale-[0.98]"
                disabled={isPending}
                type="submit"
              >
                <Save aria-hidden="true" className="size-4" />
                {isPending ? "Đang lưu..." : "Lưu tài khoản"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
