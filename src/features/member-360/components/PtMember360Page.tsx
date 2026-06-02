"use client"

import { useParams } from "next/navigation"

import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"
import { Member360Content } from "@/features/member-360/components/Member360Content"

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
        description="Hồ sơ tập luyện, gói hội viên, check-in và ghi chú dành cho PT phụ trách."
        role="pt"
        title={data?.member.fullName ?? "Member 360°"}
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
