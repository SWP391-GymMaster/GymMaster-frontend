"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthSessionStore } from "@/features/auth/session/auth-session";
import { mapAuthError } from "@/features/auth/utils/auth-error-map";
import { IconBrandGoogle } from "@tabler/icons-react";
function isGoogleLoginEnabled() {
  return (
    process.env.NEXT_PUBLIC_API_MOCKING === "enabled" ||
    process.env.NODE_ENV === "test" ||
    process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true"
  );
}

export function GoogleLoginButton() {
  const router = useRouter();
  const loginWithGoogle = useAuthSessionStore((state) => state.loginWithGoogle);
  const [isPending, setIsPending] = useState(false);
  const enabled = isGoogleLoginEnabled();

  async function handleGoogleLogin() {
    if (!enabled) {
      toast.error("Đăng nhập Google chưa được cấu hình cho môi trường này.");
      return;
    }

    setIsPending(true);

    try {
      const nextPath = await loginWithGoogle({
        idToken: "mock-google-id-token",
      });
      toast.success("Đã đăng nhập bằng Google");
      router.push(nextPath);
    } catch (error) {
      const mappedError = mapAuthError(error);
      toast.error(mappedError.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      className="min-h-12 w-full rounded-lg border-border bg-background text-base font-semibold text-foreground hover:bg-primary/10 active:scale-[0.98]"
      data-testid="google-login-button"
      disabled={isPending}
      onClick={handleGoogleLogin}
      type="button"
      variant="outline"
    >
      <IconBrandGoogle aria-hidden="true" className="size-4 text-primary" />
      {isPending
        ? "Đang kết nối Google..."
        : enabled
          ? "Tiếp tục với Google"
          : "Chưa cấu hình Google"}
    </Button>
  );
}
