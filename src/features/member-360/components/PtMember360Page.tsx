"use client"

import { useParams } from "next/navigation"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { Member360Content } from "@/features/member-360/components/Member360Content"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"

export function PtMember360Page() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)
  const isValid = Number.isFinite(memberId) && memberId > 0

  const { data, error, isLoading, refetch } = useMember360Data(
    isValid ? memberId : null,
  )

  return (
    <PermissionGuard allowedRoles={["pt"]}>
      <WorkspaceShell
        description="Xem hồ sơ, gói tập, check-in và tiến độ của hội viên được phân công."
        role="pt"
        title={data?.member.fullName ?? "Hội viên 360"}
      >
        <Member360Content
          data={data ?? undefined}
          error={error instanceof Error ? error : null}
          isLoading={isLoading}
          onRetry={() => refetch()}
          viewContext="pt"
        />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
