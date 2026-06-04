"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"

export function LogoutButton({
  isCollapsed = false,
  variant = "default",
}: {
  isCollapsed?: boolean
  variant?: "default" | "menuItem"
}) {
  const router = useRouter()
  const logout = useAuthSessionStore((state) => state.logout)
  const [isPending, setIsPending] = useState(false)

  async function handleLogout() {
    setIsPending(true)
    await logout()
    router.push("/login")
    setIsPending(false)
  }

  if (variant === "menuItem") {
    return (
      <button
        aria-label="Đăng xuất"
        disabled={isPending}
        onClick={handleLogout}
        type="button"
        className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-destructive transition hover:bg-destructive/5 active:scale-[0.98]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-sm">
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
        </span>
        <span>{isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
      </button>
    )
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
