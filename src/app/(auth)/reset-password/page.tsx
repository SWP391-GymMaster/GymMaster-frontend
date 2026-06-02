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
      description="Use the reset token from your password reset request."
      footer={<BackToLoginLink />}
      title="Set a new password"
    >
      <ResetPasswordForm resetToken={params?.token ?? ""} />
    </AuthOSShell>
  )
}
