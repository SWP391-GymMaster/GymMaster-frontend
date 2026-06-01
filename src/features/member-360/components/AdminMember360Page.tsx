"use client"

import { useParams } from "next/navigation"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { Member360Content } from "@/features/member-360/components/Member360Content"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"

export function AdminMember360Page() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const isValid = Number.isFinite(memberId) && memberId > 0

  const { data, error, isLoading, refetch } = useMember360Data(
    isValid ? memberId : null,
  )

  return (
    <PermissionGuard allowedRoles={["admin"]}>
      <WorkspaceShell
        description="Member full profile with membership, assigned PT, and check-in history."
        role="admin"
        title={data?.member.fullName ?? "Member 360"}
      >
        <Member360Content
          data={data ?? undefined}
          error={error instanceof Error ? error : null}
          isLoading={isLoading}
          onRetry={() => refetch()}
          viewContext="admin"
        />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
