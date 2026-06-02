"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Mail } from "lucide-react"
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
  const [message, setMessage] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
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
    setResetToken(null)

    try {
      const result = await forgotPassword(values)
      setMessage("If the email exists, a reset request has been created.")
      setResetToken(result.resetToken ?? null)
      toast.success("Password reset request created")
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
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#727785]"
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
          className="rounded-lg border border-[#adc6ff] bg-[#d8e2ff]/60 px-4 py-3 text-sm text-[#001a42]"
          role="status"
        >
          {message}
          {resetToken ? (
            <span className="mt-2 block font-mono text-xs">
              Dev reset token: {resetToken}
            </span>
          ) : null}
        </div>
      ) : null}

      <Button
        className={authButtonClassName}
        data-testid="forgot-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating request..." : "Send reset request"}
        {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </Button>
    </form>
  )
}
