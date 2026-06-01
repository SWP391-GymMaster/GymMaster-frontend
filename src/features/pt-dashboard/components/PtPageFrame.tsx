import type { ReactNode } from "react"

import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"

type PtPageFrameProps = {
  title: string
  description: string
  children?: ReactNode
}

export function PtPageFrame({
  title,
  description,
  children,
}: PtPageFrameProps) {
  return (
    <PermissionGuard allowedRoles={["pt"]}>
      <WorkspaceShell description={description} role="pt" title={title}>
        {children}
      </WorkspaceShell>
    </PermissionGuard>
  )
}
