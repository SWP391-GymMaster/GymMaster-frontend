"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { forgotPassword } from "@/features/auth/api/auth.api"
import {
  authButtonClassName,
  authErrorClassName,
  authInlineErrorClassName,
  authInputClassName,
  authLabelClassName,
} from "@/features/auth/components/auth-form-styles"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/login.schema"
import { mapAuthError } from "@/features/auth/utils/auth-error-map"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null)
    setMessage(null)

    try {
      const result = await forgotPassword(values)
      toast.success("Đã gửi mã OTP, vui lòng kiểm tra email")

      // Sang trang đặt lại mật khẩu, điền sẵn email; OTP người dùng lấy từ email.
      const params = new URLSearchParams({ email: values.email })
      if (result.resetToken) {
        // Dev (chưa cấu hình email): điền sẵn OTP để test nhanh.
        params.set("token", result.resetToken)
      }
      router.push(`/reset-password?${params.toString()}`)
    } catch (error) {
      const mappedError = mapAuthError(error)
      setFormError(mappedError.message)
      toast.error(mappedError.message)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="forgot-email">
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
            data-testid="forgot-email-input"
            id="forgot-email"
            type="email"
            {...register("email")}
          />
        </div>
        {errors.email ? (
          <p className={authErrorClassName}>{errors.email.message}</p>
        ) : null}
      </div>

      {formError ? (
        <div className={authInlineErrorClassName} role="alert">
          {formError}
        </div>
      ) : null}

      {message ? (
        <div
          className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          {message}
        </div>
      ) : null}

      <Button
        className={authButtonClassName}
        data-testid="forgot-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Đang tạo yêu cầu..." : "Gửi yêu cầu đặt lại"}
        {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </Button>
    </form>
  )
}
