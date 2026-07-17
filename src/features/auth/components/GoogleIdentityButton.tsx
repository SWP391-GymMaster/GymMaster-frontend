"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

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

type GoogleIdentityButtonProps = {
  clientId: string;
  onCredential: (token: string) => void;
};

type GoogleIdentityStatus = "loading" | "ready" | "error";

let initializedGoogleClientId: string | null = null;
let activeGoogleCredentialHandler:
  | ((response: GoogleCredentialResponse) => void)
  | null = null;

function getGoogleIdentityApi(clientId: string) {
  const googleIdentity = window.google?.accounts?.id;
  if (!googleIdentity) {
    return null;
  }

  if (initializedGoogleClientId !== clientId) {
    googleIdentity.initialize({
      client_id: clientId,
      callback: (response: GoogleCredentialResponse) => {
        activeGoogleCredentialHandler?.(response);
      },
    });
    initializedGoogleClientId = clientId;
  }

  return googleIdentity;
}

export function resetGoogleIdentityStateForTest() {
  initializedGoogleClientId = null;
  activeGoogleCredentialHandler = null;
}

export function GoogleIdentityButton({
  clientId,
  onCredential,
}: GoogleIdentityButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const [status, setStatus] = useState<GoogleIdentityStatus>("loading");

  const handleCredential = useCallback(
    (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setStatus("error");
        return;
      }

      onCredential(response.credential);
    },
    [onCredential],
  );

  useEffect(() => {
    activeGoogleCredentialHandler = handleCredential;

    return () => {
      if (activeGoogleCredentialHandler === handleCredential) {
        activeGoogleCredentialHandler = null;
      }
    };
  }, [handleCredential]);

  const renderOfficialButton = useCallback(() => {
    if (renderedRef.current) {
      return;
    }

    const container = containerRef.current;
    const googleIdentity = getGoogleIdentityApi(clientId);
    if (!container || !googleIdentity) {
      setStatus("error");
      return;
    }

    try {
      container.replaceChildren();
      googleIdentity.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "center",
        width: Math.floor(
          Math.min(320, container.getBoundingClientRect().width || 320),
        ),
      });
      renderedRef.current = true;
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [clientId]);

  useEffect(() => {
    if (!window.google?.accounts?.id) {
      return;
    }

    const timeoutId = window.setTimeout(renderOfficialButton, 0);
    return () => window.clearTimeout(timeoutId);
  }, [renderOfficialButton]);

  return (
    <>
      <div
        aria-busy={status === "loading"}
        className="relative flex min-h-12 w-full items-center justify-center"
        data-google-status={status}
        data-testid="google-login-region"
      >
        {status === "loading" ? (
          <div
            className="absolute inset-0 flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-muted-foreground"
            role="status"
          >
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Đang tải đăng nhập Google...
          </div>
        ) : null}

        {status === "error" ? (
          <div
            className="absolute inset-0 flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--status-failed-border)] bg-[var(--status-failed-bg)] px-4 text-center text-sm font-semibold text-[var(--status-failed-text)]"
            role="alert"
          >
            <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
            Không thể tải Google. Bạn vẫn có thể đăng nhập bằng email.
          </div>
        ) : null}

        <div
          aria-hidden={status !== "ready"}
          className={
            status === "ready"
              ? "flex min-h-10 w-full items-center justify-center"
              : "pointer-events-none absolute min-h-10 w-full opacity-0"
          }
          data-testid="google-login-button"
          ref={containerRef}
        />
      </div>

      <Script
        id="gymmaster-google-identity-services"
        onError={() => setStatus("error")}
        onLoad={renderOfficialButton}
        onReady={renderOfficialButton}
        src={GSI_SRC}
        strategy="lazyOnload"
      />
    </>
  );
}
