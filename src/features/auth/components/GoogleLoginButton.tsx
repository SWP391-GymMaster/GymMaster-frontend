"use client";

import { IconBrandGoogle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GoogleIdentityButton } from "@/features/auth/components/GoogleIdentityButton";
import { useAuthSessionStore } from "@/features/auth/session/auth-session";
import { mapAuthError } from "@/features/auth/utils/auth-error-map";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleLoginButtonProps = {
  onError?: (message: string) => void;
  // Token giả, chỉ dùng cho mock/test.
  idToken?: string;
};

function isMockMode() {
  return (
    process.env.NEXT_PUBLIC_API_MOCKING?.toLowerCase() === "enabled" ||
    process.env.NODE_ENV === "test"
  );
}

export function GoogleLoginButton({
  onError,
  idToken = "mock-google-id-token",
}: GoogleLoginButtonProps = {}) {
  const router = useRouter();
  const loginWithGoogle = useAuthSessionStore((state) => state.loginWithGoogle);
  const [isPending, setIsPending] = useState(false);

  const mockMode = isMockMode();
  const realMode = Boolean(GOOGLE_CLIENT_ID) && !mockMode;

  const submitToken = useCallback(
    async (token: string) => {
      onError?.("");
      setIsPending(true);
      try {
        const nextPath = await loginWithGoogle({ idToken: token });
        toast.success("Đã đăng nhập bằng Google");
        router.push(nextPath);
      } catch (error) {
        const mappedError = mapAuthError(error);
        onError?.(mappedError.message);
        toast.error(mappedError.message);
      } finally {
        setIsPending(false);
      }
    },
    [loginWithGoogle, onError, router],
  );

  const handleGoogleCredential = useCallback(
    (token: string) => {
      void submitToken(token);
    },
    [submitToken],
  );

  if (realMode) {
    return (
      <GoogleIdentityButton
        clientId={GOOGLE_CLIENT_ID as string}
        onCredential={handleGoogleCredential}
      />
    );
  }

  // Mock/test: gửi token giả qua đúng auth-session flow hiện có.
  if (mockMode) {
    return (
      <Button
        className="min-h-12 w-full rounded-full border-border bg-background text-base font-semibold text-foreground hover:bg-primary/10 active:scale-[0.98]"
        data-testid="google-login-button"
        disabled={isPending}
        onClick={() => void submitToken(idToken)}
        type="button"
        variant="outline"
      >
        <IconBrandGoogle aria-hidden="true" className="size-4 text-primary" />
        {isPending ? "Đang kết nối Google..." : "Tiếp tục với Google"}
      </Button>
    );
  }

  // Backend thật nhưng môi trường chưa có Google Client ID.
  return (
    <Button
      className="min-h-12 w-full rounded-full border-border bg-background text-base font-semibold text-muted-foreground"
      data-testid="google-login-button"
      disabled
      type="button"
      variant="outline"
    >
      <IconBrandGoogle aria-hidden="true" className="size-4" />
      Chưa cấu hình Google
    </Button>
  );
}
