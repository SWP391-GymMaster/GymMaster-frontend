import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GoogleLoginButton,
} from "@/features/auth/components/GoogleLoginButton";
import {
  GoogleIdentityButton,
  resetGoogleIdentityStateForTest,
} from "@/features/auth/components/GoogleIdentityButton";

type ScriptMockProps = {
  id?: string;
  onError?: () => void;
  onLoad?: () => void;
  onReady?: () => void;
  src?: string;
  strategy?: string;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/script", () => ({
  default: ({ id, onError, onLoad, onReady, src, strategy }: ScriptMockProps) => (
    <div
      data-script-id={id}
      data-script-src={src}
      data-script-strategy={strategy}
      data-testid="google-script-boundary"
    >
      <button
        data-testid="google-script-load"
        onClick={() => {
          onLoad?.();
          onReady?.();
        }}
        type="button"
      >
        load
      </button>
      <button data-testid="google-script-error" onClick={onError} type="button">
        error
      </button>
    </div>
  ),
}));

let credentialCallback:
  | ((response: { credential?: string }) => void)
  | undefined;
const initialize = vi.fn(
  (config: { callback: (response: { credential?: string }) => void }) => {
    credentialCallback = config.callback;
  },
);
const renderButton = vi.fn((parent: HTMLElement) => {
  const providerButton = document.createElement("button");
  providerButton.textContent = "Google provider";
  parent.appendChild(providerButton);
});

function installGoogleIdentityApi() {
  Object.defineProperty(window, "google", {
    configurable: true,
    value: {
      accounts: {
        id: {
          initialize,
          renderButton,
        },
      },
    },
    writable: true,
  });
}

beforeEach(() => {
  credentialCallback = undefined;
  initialize.mockClear();
  renderButton.mockClear();
  resetGoogleIdentityStateForTest();
  installGoogleIdentityApi();
});

afterEach(() => {
  cleanup();
  resetGoogleIdentityStateForTest();
  Reflect.deleteProperty(window, "google");
});

describe("GoogleIdentityButton", () => {
  it("defers the provider script, reserves the control region, and initializes once", async () => {
    const onCredential = vi.fn();
    Reflect.deleteProperty(window, "google");
    const { rerender, unmount } = render(
      <GoogleIdentityButton clientId="client-id" onCredential={onCredential} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Đang tải đăng nhập Google...",
    );
    expect(screen.getByTestId("google-login-region")).toHaveAttribute(
      "data-google-status",
      "loading",
    );
    expect(screen.getByTestId("google-script-boundary")).toHaveAttribute(
      "data-script-strategy",
      "lazyOnload",
    );

    installGoogleIdentityApi();
    fireEvent.click(screen.getByTestId("google-script-load"));

    await waitFor(() => {
      expect(screen.getByTestId("google-login-region")).toHaveAttribute(
        "data-google-status",
        "ready",
      );
    });
    expect(screen.getByText("Google provider")).toBeInTheDocument();
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(renderButton).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("google-script-load"));
    rerender(
      <GoogleIdentityButton clientId="client-id" onCredential={onCredential} />,
    );
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(renderButton).toHaveBeenCalledTimes(1);

    act(() => {
      credentialCallback?.({ credential: "real-google-token" });
    });
    expect(onCredential).toHaveBeenCalledWith("real-google-token");

    unmount();
    render(<GoogleIdentityButton clientId="client-id" onCredential={onCredential} />);
    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(2));
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it("shows a safe local error when the provider cannot load", async () => {
    Reflect.deleteProperty(window, "google");
    render(<GoogleIdentityButton clientId="client-id" onCredential={vi.fn()} />);

    fireEvent.click(screen.getByTestId("google-script-error"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Không thể tải Google. Bạn vẫn có thể đăng nhập bằng email.",
    );
    expect(initialize).not.toHaveBeenCalled();
    expect(renderButton).not.toHaveBeenCalled();
  });

  it("does not render the real provider script in mock/test mode", () => {
    render(<GoogleLoginButton />);

    expect(screen.getByTestId("google-login-button")).toBeEnabled();
    expect(screen.queryByTestId("google-script-boundary")).not.toBeInTheDocument();
  });
});
