import {
  AuthOSShell,
  BackToLoginLink,
} from "@/features/auth/components/AuthOSShell"
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <AuthOSShell
      description="Enter your email to create a password reset request."
      footer={<BackToLoginLink />}
      title="Reset access"
    >
      <ForgotPasswordForm />
    </AuthOSShell>
  )
}
