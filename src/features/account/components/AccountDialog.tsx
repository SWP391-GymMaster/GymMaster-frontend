"use client"

import Link from "next/link"
import { useEffect, useState, type ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, KeyRound, Save, Upload } from "lucide-react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"

import { UserAvatar } from "@/components/data/UserAvatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  useUpdateMyAccount,
  useUploadMyAvatar,
} from "@/features/account/api/account.queries"
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

const maxAvatarBytes = 5 * 1024 * 1024
const acceptedAvatarTypes = ["image/jpeg", "image/png", "image/webp"]

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
  const updateAccount = useUpdateMyAccount()
  const uploadAvatar = useUploadMyAvatar()
  const [formError, setFormError] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)

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
      setAvatarError(null)
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

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    setAvatarError(null)

    if (!file) {
      return
    }

    if (!acceptedAvatarTypes.includes(file.type)) {
      setAvatarError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.")
      return
    }

    if (file.size > maxAvatarBytes) {
      setAvatarError("Ảnh đại diện tối đa 5 MB.")
      return
    }

    try {
      await uploadAvatar.mutateAsync(file)
    } catch {
      // Hook da hien toast; giu loi inline cho cac loi validate phia client.
    }
  }

  const previewName = watchedFullName || user?.fullName || "GymMaster"
  const isPending = isSubmitting || updateAccount.isPending

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-[42rem]">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle>Tài khoản của tôi</DialogTitle>
          <DialogDescription>
            Cập nhật ảnh đại diện, họ tên và số điện thoại dùng chung cho tài khoản GymMaster.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 p-6 md:grid-cols-[180px_minmax(0,1fr)]">
          <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-[var(--surface-panel-muted)] p-4 text-center">
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              className="border-primary/20"
              name={previewName}
              size="lg"
            />
            <div className="grid gap-2">
              <label
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-primary/10 active:scale-[0.98]"
                htmlFor="account-avatar-file"
              >
                <Upload aria-hidden="true" className="size-4" />
                {uploadAvatar.isPending ? "Đang tải..." : "Chọn ảnh"}
              </label>
              <input
                accept="image/jpeg,image/png,image/webp"
                aria-describedby="account-avatar-help"
                className="sr-only"
                data-testid="account-avatar-input"
                disabled={uploadAvatar.isPending}
                id="account-avatar-file"
                onChange={handleAvatarChange}
                type="file"
              />
              <p className="text-xs leading-5 text-muted-foreground" id="account-avatar-help">
                JPG, PNG hoặc WebP. Tối đa 5 MB.
              </p>
              {avatarError ? (
                <p className="text-xs font-semibold text-destructive">
                  {avatarError}
                </p>
              ) : null}
            </div>
          </section>

          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <FormErrorSummary errors={errors} message={formError} />

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

            <div className="rounded-2xl border border-border bg-[var(--surface-panel-muted)] p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Camera aria-hidden="true" className="size-4" />
                </span>
                <p className="text-sm leading-6 text-muted-foreground">
                  Nếu tài khoản được tạo bằng Google, hãy dùng Quên mật khẩu để tạo mật khẩu trước khi đổi mật khẩu.
                </p>
              </div>
              <Button
                asChild
                className="mt-4 min-h-10 rounded-full"
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
                className="min-h-11 rounded-full px-5"
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
