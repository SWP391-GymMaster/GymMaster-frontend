"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
      toast.success("Signed in to GymMaster")
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
        <label className="text-sm font-medium text-zinc-900" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            autoComplete="email"
            className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-11 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
            data-testid="login-email-input"
            id="email"
            type="email"
            {...register("email")}
          />
        </div>
        {errors.email ? (
          <p className="text-sm text-red-700">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            autoComplete="current-password"
            className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-11 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
            data-testid="login-password-input"
            id="password"
            type="password"
            {...register("password")}
          />
        </div>
        {errors.password ? (
          <p className="text-sm text-red-700">{errors.password.message}</p>
        ) : null}
      </div>

      {formError ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <Button
        className="min-h-12 w-full rounded-2xl text-base"
        data-testid="login-submit-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
