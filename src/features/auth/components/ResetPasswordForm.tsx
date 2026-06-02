"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, KeyRound, Lock } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { resetPassword } from "@/features/auth/api/auth.api"
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
  resetToken?: string
}

export function ResetPasswordForm({ resetToken = "" }: ResetPasswordFormProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      resetToken,
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null)
    setMessage(null)

    try {
      await resetPassword(values)
      setMessage("Password reset successfully. You can sign in now.")
      toast.success("Password reset successfully")
    } catch (error) {
      const mappedError = mapAuthError(error)
      setFormError(mappedError.message)
      toast.error(mappedError.message)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="reset-token">
          Reset token
        </label>
        <div className="relative">
          <KeyRound
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
          />
          <input
            autoComplete="one-time-code"
            className={authInputClassName}
            data-testid="reset-token-input"
            id="reset-token"
            type="text"
            {...register("resetToken")}
          />
        </div>
        {errors.resetToken ? (
          <p className={authErrorClassName}>{errors.resetToken.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="new-password">
          New password
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
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

      {formError ? (
        <div className={authInlineErrorClassName} role="alert">
          {formError}
        </div>
      ) : null}

      {message ? (
        <div
          className="rounded-lg border border-[#adc6ff] bg-[#d8e2ff]/60 px-4 py-3 text-sm text-[#001a42]"
          role="status"
        >
          {message}
        </div>
      ) : null}

      <Button
        className={authButtonClassName}
        data-testid="reset-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Resetting password..." : "Reset password"}
        {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </Button>
    </form>
  )
}
