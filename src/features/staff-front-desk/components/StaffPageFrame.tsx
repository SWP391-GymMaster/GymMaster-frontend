import type { ReactNode } from "react"

import {
  WorkspaceShell,
  type WorkspaceShellMetric,
} from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"

type StaffPageFrameProps = {
  title: string
  description: string
  metrics?: WorkspaceShellMetric[]
  children: ReactNode
}

export function StaffPageFrame({
  title,
  description,
  metrics,
  children,
}: StaffPageFrameProps) {
  return (
    <PermissionGuard allowedRoles={["staff"]}>
      <WorkspaceShell
        description={description}
        metrics={metrics}
        role="staff"
        title={title}
      >
        {children}
      </WorkspaceShell>
    </PermissionGuard>
  )
}
