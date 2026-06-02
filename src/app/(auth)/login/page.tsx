import {
  AuthOSShell,
  AuthSecurityBadge,
  AuthTextLink,
} from "@/features/auth/components/AuthOSShell"
import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <AuthOSShell
      description="Use your GymMaster account. Your workspace opens from your authenticated backend role."
      footer={
        <>
          New member? <AuthTextLink href="/signup">Create an account</AuthTextLink>
          <AuthSecurityBadge />
        </>
      }
      title="Welcome back, Elite."
    >
      <LoginForm />
    </AuthOSShell>
  )
}
