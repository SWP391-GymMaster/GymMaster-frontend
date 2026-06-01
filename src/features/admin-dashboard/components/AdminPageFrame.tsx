import type { ReactNode } from "react"

import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"

type AdminPageFrameProps = {
  title: string
  description: string
  children?: ReactNode
}

export function AdminPageFrame({
  title,
  description,
  children,
}: AdminPageFrameProps) {
  return (
    <PermissionGuard allowedRoles={["admin"]}>
      <WorkspaceShell description={description} role="admin" title={title}>
        {children}
      </WorkspaceShell>
    </PermissionGuard>
  )
}
