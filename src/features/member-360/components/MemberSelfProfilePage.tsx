"use client"

import { PermissionGuard } from "@/features/auth/components/PermissionGuard"
import { useAuthSessionStore } from "@/features/auth/session/auth-session"
import { WorkspaceShell } from "@/components/layout/WorkspaceShell"
import { useMember360Data } from "@/features/member-360/api/member-360.queries"
import { MemberSocialProfile } from "@/features/member-360/components/MemberSocialProfile"

export function MemberSelfProfilePage() {
  const memberProfileId = useAuthSessionStore(
    (state) => state.session?.user?.memberProfileId ?? null,
  )
  const { data, error, isLoading, refetch } = useMember360Data(memberProfileId)

  return (
    <PermissionGuard allowedRoles={["member"]}>
      <WorkspaceShell
        description="Hành trình tập luyện, check-in, gói tập và phản hồi từ PT trong một hồ sơ riêng tư."
        role="member"
        title="Hồ sơ của tôi"
      >
        <MemberSocialProfile
          data={data ?? undefined}
          error={error instanceof Error ? error : null}
          isLoading={Boolean(memberProfileId) && isLoading}
          onRetry={() => refetch()}
          unavailable={
            memberProfileId
              ? undefined
              : {
                  title: "Chưa có hồ sơ hội viên",
                  description:
                    "Tài khoản hiện tại chưa liên kết với hồ sơ hội viên. Vui lòng đăng ký gói tập hoặc liên hệ quầy lễ tân để kích hoạt hồ sơ.",
                }
          }
        />
      </WorkspaceShell>
    </PermissionGuard>
  )
}
