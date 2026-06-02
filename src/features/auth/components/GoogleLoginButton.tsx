"use client"

import { LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { mapAuthError } from "@/features/auth/utils/auth-error-map"

function isGoogleLoginEnabled() {
  return (
    process.env.NEXT_PUBLIC_API_MOCKING === "enabled" ||
    process.env.NODE_ENV === "test" ||
    process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true"
  )
}

export function GoogleLoginButton() {
  const router = useRouter()
  const loginWithGoogle = useAuthSessionStore((state) => state.loginWithGoogle)
  const [isPending, setIsPending] = useState(false)
  const enabled = isGoogleLoginEnabled()

  async function handleGoogleLogin() {
    if (!enabled) {
      toast.error("Google sign-in is not configured for this environment.")
      return
    }

    setIsPending(true)

    try {
      const nextPath = await loginWithGoogle({
        idToken: "mock-google-id-token",
      })
      toast.success("Signed in with Google")
      router.push(nextPath)
    } catch (error) {
      const mappedError = mapAuthError(error)
      toast.error(mappedError.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      className="min-h-12 w-full rounded-lg border-[#c2c6d6] bg-white text-base font-semibold text-[#191b23] hover:bg-[#f2f3fd] active:scale-[0.98]"
      data-testid="google-login-button"
      disabled={isPending}
      onClick={handleGoogleLogin}
      type="button"
      variant="outline"
    >
      <LogIn aria-hidden="true" className="size-4 text-[#0058be]" />
      {isPending
        ? "Connecting to Google..."
        : enabled
          ? "Continue with Google"
          : "Google sign-in not configured"}
    </Button>
  )
}
