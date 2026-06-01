import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminDashboardContent } from "@/features/admin-dashboard/components/AdminDashboardContent"

export default function AdminDashboardPage() {
  return (
    <AdminPageFrame
      description="Command center for revenue, membership status, check-in rhythm, and quick access to management areas."
      title="Admin Dashboard"
    >
      <AdminDashboardContent />
    </AdminPageFrame>
  )
}
