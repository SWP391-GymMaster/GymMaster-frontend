"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  authButtonClassName,
  authErrorClassName,
  authInlineErrorClassName,
  authInputClassName,
  authLabelClassName,
} from "@/features/auth/components/auth-form-styles"
import {
  signupSchema,
  type SignupFormValues,
} from "@/features/auth/schemas/login.schema"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { mapAuthError } from "@/features/auth/utils/auth-error-map"

export function SignupForm() {
  const router = useRouter()
  const signup = useAuthSessionStore((state) => state.signup)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      phone: "",
    },
  })

  async function onSubmit(values: SignupFormValues) {
    setFormError(null)

    try {
      const nextPath = await signup({
        ...values,
        phone: values.phone?.trim() || undefined,
      })
      toast.success("Đã tạo tài khoản hội viên")
      router.push(nextPath)
    } catch (error) {
      const mappedError = mapAuthError(error)
      setFormError(mappedError.message)
      toast.error(mappedError.message)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="fullName">
          Họ tên
        </label>
        <div className="relative">
          <User
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="name"
            className={authInputClassName}
            data-testid="signup-full-name-input"
            id="fullName"
            type="text"
            {...register("fullName")}
          />
        </div>
        {errors.fullName ? (
          <p className={authErrorClassName}>{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="signup-email">
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
            data-testid="signup-email-input"
            id="signup-email"
            type="email"
            {...register("email")}
          />
        </div>
        {errors.email ? (
          <p className={authErrorClassName}>{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="phone">
          Số điện thoại <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
        </label>
        <div className="relative">
          <Phone
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="tel"
            className={authInputClassName}
            data-testid="signup-phone-input"
            id="phone"
            type="tel"
            {...register("phone")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={authLabelClassName} htmlFor="signup-password">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="new-password"
            className={authInputClassName}
            data-testid="signup-password-input"
            id="signup-password"
            type="password"
            {...register("password")}
          />
        </div>
        {errors.password ? (
          <p className={authErrorClassName}>{errors.password.message}</p>
        ) : null}
      </div>

      {formError ? (
        <div className={authInlineErrorClassName} role="alert">
          {formError}
        </div>
      ) : null}

      <Button
        className={authButtonClassName}
        data-testid="signup-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản hội viên"}
        {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </Button>
    </form>
  )
}
