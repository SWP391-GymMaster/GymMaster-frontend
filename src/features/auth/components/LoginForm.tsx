"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowRight, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton"
import {
  authButtonClassName,
  authErrorClassName,
  authInlineErrorClassName,
  authInputClassName,
  authLabelClassName,
  authTextLinkClassName,
} from "@/features/auth/components/auth-form-styles"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema"
import { mapAuthError } from "@/features/auth/utils/auth-error-map"

export function LoginForm() {
  const router = useRouter()
  const login = useAuthSessionStore((state) => state.login)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)

    try {
      const nextPath = await login(values)
      toast.success("Đã đăng nhập GymMaster")
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
        <label className={authLabelClassName} htmlFor="email">
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
            data-testid="login-email-input"
            id="email"
            type="email"
            {...register("email")}
          />
        </div>
        {errors.email ? (
          <p className={authErrorClassName}>{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className={authLabelClassName} htmlFor="password">
            Mật khẩu
          </label>
          <Link
            className={`text-sm ${authTextLinkClassName}`}
            href="/forgot-password"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="current-password"
            className={authInputClassName}
            data-testid="login-password-input"
            id="password"
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
        data-testid="login-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Đang xác thực..." : "Đăng nhập"}
        {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Hoặc
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleLoginButton onError={setFormError} />
    </form>
  )
}
