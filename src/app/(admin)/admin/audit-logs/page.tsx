import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AuditLogsContent } from "@/features/admin-dashboard/components/AuditLogsContent"

export default function AuditLogsPage() {
  return (
    <AdminPageFrame
      description="View and filter system audit logs for all mutating actions across GymMaster."
      title="Audit Logs"
    >
      <AuditLogsContent />
    </AdminPageFrame>
  )
}
