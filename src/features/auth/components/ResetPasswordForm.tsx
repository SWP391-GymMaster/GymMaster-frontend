"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, KeyRound, Lock, Mail, RotateCw } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { forgotPassword, resetPassword } from "@/features/auth/api/auth.api"
import {
  authButtonClassName,
  authErrorClassName,
  authInlineErrorClassName,
  authInputClassName,
  authLabelClassName,
} from "@/features/auth/components/auth-form-styles"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/login.schema"
import { mapAuthError } from "@/features/auth/utils/auth-error-map"

type ResetPasswordFormProps = {
  email?: string
  resetToken?: string
}

// Khop voi ResetResendCooldownSeconds ben backend (AuthService.cs).
// Gui lai som hon 60s thi backend im lang bo qua, khong co mail nao duoc gui.
const RESEND_COOLDOWN_SECONDS = 60

export function ResetPasswordForm({ email = "", resetToken = "" }: ResetPasswordFormProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  // Vao trang nay tuc la vua xin OTP xong -> bat dem nguoc ngay tu dau.
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)
  const [isResending, setIsResending] = useState(false)
  const {
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setValue,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      newPassword: "",
      confirmPassword: "",
      resetToken,
    },
  })

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  async function onResend() {
    const currentEmail = getValues("email").trim()

    if (!currentEmail) {
      setFormError("Vui lòng nhập email để nhận lại mã.")
      return
    }

    setFormError(null)
    setMessage(null)
    setIsResending(true)

    try {
      const result = await forgotPassword({ email: currentEmail })
      setSecondsLeft(RESEND_COOLDOWN_SECONDS)

      if (result.resetToken) {
        // Dev (chưa cấu hình email): điền sẵn OTP để test nhanh.
        setValue("resetToken", result.resetToken)
      }

      toast.success("Đã gửi lại mã OTP, vui lòng kiểm tra email")
    } catch (error) {
      const mappedError = mapAuthError(error)
      setFormError(mappedError.message)
      toast.error(mappedError.message)
    } finally {
      setIsResending(false)
    }
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null)
    setMessage(null)

    try {
      await resetPassword(values)
      setMessage("Đã đặt lại mật khẩu. Bạn có thể đăng nhập ngay.")
      toast.success("Đã đặt lại mật khẩu")
    } catch (error) {
      const mappedError = mapAuthError(error)
      setFormError(mappedError.message)
      toast.error(mappedError.message)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="reset-email">
          Email
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="email"
            className={authInputClassName}
            data-testid="reset-email-input"
            id="reset-email"
            type="email"
            {...register("email")}
          />
        </div>
        {errors.email ? (
          <p className={authErrorClassName}>{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="reset-token">
          Mã OTP (6 số)
        </label>
        <div className="relative">
          <KeyRound
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="one-time-code"
            className={authInputClassName}
            data-testid="reset-token-input"
            id="reset-token"
            inputMode="numeric"
            maxLength={6}
            placeholder="Nhập mã 6 số trong email"
            type="text"
            {...register("resetToken")}
          />
        </div>
        {errors.resetToken ? (
          <p className={authErrorClassName}>{errors.resetToken.message}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-xs text-muted-foreground">
            Không nhận được mã? Kiểm tra cả mục Spam.
          </p>
          <button
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition hover:bg-primary/10 active:scale-[0.98] disabled:pointer-events-none disabled:text-muted-foreground"
            data-testid="reset-resend-button"
            disabled={secondsLeft > 0 || isResending}
            onClick={onResend}
            type="button"
          >
            <RotateCw
              aria-hidden="true"
              className={`size-4${isResending ? " animate-spin" : ""}`}
            />
            <span aria-live="polite">
              {isResending
                ? "Đang gửi..."
                : secondsLeft > 0
                  ? `Gửi lại mã sau ${secondsLeft}s`
                  : "Gửi lại mã"}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="new-password">
          Mật khẩu mới
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="new-password"
            className={authInputClassName}
            data-testid="reset-password-input"
            id="new-password"
            type="password"
            {...register("newPassword")}
          />
        </div>
        {errors.newPassword ? (
          <p className={authErrorClassName}>{errors.newPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="reset-confirm-password">
          Nhập lại mật khẩu mới
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="new-password"
            className={authInputClassName}
            data-testid="reset-confirm-password-input"
            id="reset-confirm-password"
            type="password"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword ? (
          <p className={authErrorClassName}>{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {formError ? (
        <div className={authInlineErrorClassName} role="alert">
          {formError}
        </div>
      ) : null}

      {message ? (
        <div className="space-y-3" role="status">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground">
            {message}
          </div>
          <Link
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 active:scale-[0.98]"
            href="/login"
          >
            Đến trang đăng nhập
          </Link>
        </div>
      ) : null}

      <Button
        className={authButtonClassName}
        data-testid="reset-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </Button>
    </form>
  )
}
