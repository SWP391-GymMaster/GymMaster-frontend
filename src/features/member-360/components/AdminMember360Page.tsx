"use client"

import { useParams } from "next/navigation"

import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"
import { Member360Content } from "@/features/member-360/components/Member360Content"

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
        description="Theo dõi gói hội viên, PT phụ trách, lịch sử check-in và thao tác nhanh."
        role="admin"
        title={data?.member.fullName ?? "Member 360°"}
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
