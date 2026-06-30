import { AdminPageFrame } from "@/features/admin-dashboard/components/AdminPageFrame"
import { AdminUsersTemplateWorkspace } from "@/features/member-management/components/AdminUsersTemplateWorkspace"

export default function AdminUsersPage() {
  return (
    <AdminPageFrame
      description="Tạo tài khoản theo vai trò và kiểm tra quyền truy cập."
      title="Quản lý tài khoản"
    >
      <AdminUsersTemplateWorkspace />
    </AdminPageFrame>
  )
}
