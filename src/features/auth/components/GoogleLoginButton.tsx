"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthSessionStore } from "@/features/auth/session/auth-session";
import { mapAuthError } from "@/features/auth/utils/auth-error-map";
import { IconBrandGoogle } from "@tabler/icons-react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type GoogleLoginButtonProps = {
  onError?: (message: string) => void;
  // Token gia, chi dung cho mock/test.
  idToken?: string;
};

// Mock/test (MSW) -> dung token gia. Khac di -> Google that neu co Client ID.
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Google Identity Services thật: nạp script, render nút Google, nhận ID token thật.
  useEffect(() => {
    if (!realMode) {
      return;
    }

    function init() {
      const google = window.google;
      if (!google?.accounts?.id || !containerRef.current) {
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID as string,
        callback: (response: GoogleCredentialResponse) => {
          if (response.credential) {
            void submitToken(response.credential);
          }
        },
      });

      containerRef.current.replaceChildren();
      google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "center",
        width: 320,
      });
    }

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const created = !script;
    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);

    return () => {
      script?.removeEventListener("load", init);
      if (created) {
        // giu script lai cho lan sau; khong xoa de tranh nap lai nhieu lan
      }
    };
  }, [realMode, submitToken]);

  // Google THẬT — render nút chính chủ của Google.
  if (realMode) {
    return (
      <div className="flex w-full justify-center">
        <div ref={containerRef} data-testid="google-login-button" />
      </div>
    );
  }

  // Mock/test — nút giả, gửi token mock (giữ nguyên cho Playwright/Vitest + MSW).
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

  // Chưa cấu hình Client ID (chạy backend thật mà thiếu env).
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
