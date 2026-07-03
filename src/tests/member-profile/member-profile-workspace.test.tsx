import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { http } from "msw"
import { afterEach, describe, expect, it } from "vitest"

import { AppProviders } from "@/app/providers"
import { MemberProfileWorkspace } from "@/features/member-profile/components/MemberProfileWorkspace"
import {
  resetAuthSessionForTest,
  useAuthSessionStore,
} from "@/features/auth/session/auth-session"
import { server } from "@/mocks/server"
import { fail, ok } from "@/mocks/utils/api-response"
import type { AuthSession } from "@/types/auth"

const authSession: AuthSession = {
  accessToken: "access-member",
  refreshToken: "refresh-member",
  expiresAt: "2026-07-02T12:00:00.000Z",
  role: "member",
  user: {
    userId: 4,
    email: "member@gymmaster.local",
    fullName: "Gym Member",
    phone: "0900000101",
    avatarUrl: null,
    role: "member",
    status: "active",
    memberProfileId: null,
  },
}

function pascalProfile(overrides: Record<string, unknown> = {}) {
  return {
    Id: 101,
    UserId: 4,
    MemberCode: "GM-101",
    Email: "member@gymmaster.local",
    FullName: "Nguyen Minh Anh",
    AvatarUrl: null,
    Phone: "0900000101",
    DateOfBirth: "1998-04-12T00:00:00.000Z",
    Gender: "male",
    Address: "Quan 1",
    EmergencyContact: "Me - 0900000000",
    JoinedAt: "2026-06-01T00:00:00.000Z",
    Status: "active",
    CreatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  }
}

function renderWorkspace() {
  resetAuthSessionForTest()
  useAuthSessionStore.getState().setSession(authSession)

  return render(
    <AppProviders>
      <MemberProfileWorkspace />
    </AppProviders>,
  )
}

afterEach(() => {
  resetAuthSessionForTest()
})

describe("MemberProfileWorkspace", () => {
  it("renders profile data and syncs lazy-created member profile id", async () => {
    renderWorkspace()

    expect(await screen.findByDisplayValue("Nguyen Minh Anh")).toBeInTheDocument()
    expect(screen.getByText("member@gymmaster.local")).toBeInTheDocument()
    expect(screen.getByText("GM-101")).toBeInTheDocument()

    await waitFor(() => {
      expect(
        useAuthSessionStore.getState().session?.user.memberProfileId,
      ).toBe(101)
    })
  })

  it("validates future date of birth and Vietnamese phone format", async () => {
    renderWorkspace()

    fireEvent.change(await screen.findByTestId("member-profile-phone"), {
      target: { value: "12345" },
    })
    fireEvent.change(screen.getByTestId("member-profile-date-of-birth"), {
      target: { value: "2999-01-01" },
    })
    fireEvent.click(screen.getByRole("button", { name: /lưu thay đổi/i }))

    expect(
      await screen.findByText("Số điện thoại Việt Nam không hợp lệ."),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Ngày sinh không được ở tương lai."),
    ).toBeInTheDocument()
  })

  it("submits only dirty fields", async () => {
    let submittedBody: unknown = null

    server.use(
      http.put("/api/v1/members/me", async ({ request }) => {
        submittedBody = await request.json()
        return ok(pascalProfile({ Phone: "0900000999" }))
      }),
    )

    renderWorkspace()

    fireEvent.change(await screen.findByTestId("member-profile-phone"), {
      target: { value: "0900000999" },
    })
    fireEvent.click(screen.getByRole("button", { name: /lưu thay đổi/i }))

    await waitFor(() => {
      expect(submittedBody).toEqual({ Phone: "0900000999" })
    })
  })

  it("maps duplicate phone response to the phone field", async () => {
    server.use(
      http.put("/api/v1/members/me", () =>
        fail("DUPLICATE", "Phone already exists", 409),
      ),
    )

    renderWorkspace()

    fireEvent.change(await screen.findByTestId("member-profile-phone"), {
      target: { value: "0900000102" },
    })
    fireEvent.click(screen.getByRole("button", { name: /lưu thay đổi/i }))

    expect(
      await screen.findByText("Số điện thoại này đã được sử dụng."),
    ).toBeInTheDocument()
  })

  it("uploads avatar directly from the member profile edit page", async () => {
    renderWorkspace()

    const fileInput = await screen.findByTestId("member-profile-avatar-input")

    fireEvent.change(fileInput, {
      target: {
        files: [new File(["not-image"], "avatar.txt", { type: "text/plain" })],
      },
    })

    expect(
      await screen.findByText("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP."),
    ).toBeInTheDocument()

    fireEvent.change(fileInput, {
      target: {
        files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
      },
    })

    await waitFor(() => {
      expect(useAuthSessionStore.getState().session?.user.avatarUrl).toBe(
        "https://cdn.gymmaster.local/avatars/user_4.webp",
      )
    })
  })
})
