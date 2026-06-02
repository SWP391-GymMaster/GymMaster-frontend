import {
  AuthOSShell,
  BackToLoginLink,
} from "@/features/auth/components/AuthOSShell"
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm"

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string
  }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams

  return (
    <AuthOSShell
      description="Dùng mã reset từ yêu cầu đặt lại mật khẩu."
      footer={<BackToLoginLink />}
      title="Đặt mật khẩu mới"
    >
      <ResetPasswordForm resetToken={params?.token ?? ""} />
    </AuthOSShell>
  )
}
