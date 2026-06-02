"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export function LogoutButton() {
  const router = useRouter()
  const logout = useAuthSessionStore((state) => state.logout)
  const [isPending, setIsPending] = useState(false)

  async function handleLogout() {
    setIsPending(true)
    await logout()
    router.push("/login")
    setIsPending(false)
  }

  return (
    <Button
      aria-label="Log out"
      disabled={isPending}
      onClick={handleLogout}
      size="sm"
      type="button"
      variant="destructive"
    >
      <LogOut aria-hidden="true" />
      {isPending ? "Signing out" : "Logout"}
    </Button>
  )
}
