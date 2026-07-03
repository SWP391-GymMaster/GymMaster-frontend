"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Save, ShieldCheck } from "lucide-react"
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
import { useUpdateMyAccount } from "@/features/account/api/account.queries"
import { AccountAvatarUploader } from "@/features/account/components/AccountAvatarUploader"
import {
  accountSchema,
  type AccountFormValues,
} from "@/features/account/schemas/account.schema"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { ApiClientError } from "@/lib/api/http-client"

type AccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const inputClassName =
  "min-h-11 rounded-2xl border-border bg-background px-3 text-sm text-foreground"

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
