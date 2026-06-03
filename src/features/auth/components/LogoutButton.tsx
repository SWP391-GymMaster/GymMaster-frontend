"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export function LogoutButton({ isCollapsed = false }: { isCollapsed?: boolean }) {
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
      aria-label="Đăng xuất"
      disabled={isPending}
      onClick={handleLogout}
      size={isCollapsed ? "icon" : "sm"}
      type="button"
      variant="destructive"
      className={isCollapsed ? "size-10 rounded-xl mx-auto flex items-center justify-center" : "w-full rounded-xl justify-start gap-3 px-3 py-2"}
      title={isCollapsed ? "Đăng xuất" : undefined}
    >
      <LogOut aria-hidden="true" className="size-4 shrink-0" />
      {!isCollapsed && <span>{isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>}
    </Button>
  )
}
