import {
  AuthOSShell,
  AuthTextLink,
} from "@/features/auth/components/AuthOSShell"
import { SignupForm } from "@/features/auth/components/SignupForm"

export default function SignupPage() {
  return (
    <AuthOSShell
      description="Create a member account. Staff, trainer, and admin accounts are assigned by the backend system, not selected here."
      footer={
        <>
          Already have an account?{" "}
          <AuthTextLink href="/login">Sign in</AuthTextLink>
        </>
      }
      title="Create your member account"
    >
      <SignupForm />
    </AuthOSShell>
  )
}
