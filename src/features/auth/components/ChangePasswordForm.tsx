"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Lock } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { changePassword } from "@/features/auth/api/auth.api"
import {
  authButtonClassName,
  authErrorClassName,
  authInlineErrorClassName,
  authInputClassName,
  authLabelClassName,
} from "@/features/auth/components/auth-form-styles"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas/login.schema"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { mapAuthError } from "@/features/auth/utils/auth-error-map"

export function ChangePasswordForm() {
  const session = useAuthSessionStore((state) => state.session)
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setFormError(null)
    setMessage(null)

    if (!session?.accessToken) {
      setFormError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      return
    }

    try {
      await changePassword(values, session.accessToken)
      reset()
      setMessage("Đã đổi mật khẩu.")
      toast.success("Đã đổi mật khẩu")
    } catch (error) {
      const mappedError = mapAuthError(error)
      setFormError(mappedError.message)
      toast.error(mappedError.message)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="current-password">
          Mật khẩu hiện tại
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            autoComplete="current-password"
            className={authInputClassName}
            data-testid="change-current-password-input"
            id="current-password"
            type="password"
            {...register("currentPassword")}
          />
        </div>
        {errors.currentPassword ? (
          <p className={authErrorClassName}>{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="change-new-password">
          Mật khẩu mới
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            autoComplete="new-password"
            className={authInputClassName}
            data-testid="change-new-password-input"
            id="change-new-password"
            type="password"
            {...register("newPassword")}
          />
        </div>
        {errors.newPassword ? (
          <p className={authErrorClassName}>{errors.newPassword.message}</p>
        ) : null}
      </div>

      {formError ? (
        <div className={authInlineErrorClassName} role="alert">
          {formError}
        </div>
      ) : null}

      {message ? (
        <div
          className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          {message}
        </div>
      ) : null}

      <Button
        className={authButtonClassName}
        data-testid="change-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </Button>
    </form>
  )
}
