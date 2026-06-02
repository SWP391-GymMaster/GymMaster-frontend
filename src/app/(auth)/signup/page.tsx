import {
  AuthOSShell,
  AuthTextLink,
} from "@/features/auth/components/AuthOSShell"
import { SignupForm } from "@/features/auth/components/SignupForm"

export default function SignupPage() {
  return (
    <AuthOSShell
      description="Tạo tài khoản hội viên. Tài khoản lễ tân, PT và quản trị do hệ thống backend phân quyền, không chọn tại màn hình này."
      footer={
        <>
          Đã có tài khoản?{" "}
          <AuthTextLink href="/login">Đăng nhập</AuthTextLink>
        </>
      }
      title="Tạo tài khoản hội viên"
    >
      <SignupForm />
    </AuthOSShell>
  )
}
