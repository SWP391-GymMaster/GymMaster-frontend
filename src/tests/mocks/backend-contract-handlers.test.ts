import { describe, expect, it } from "vitest"

async function readJson<T>(response: Response) {
  return (await response.json()) as T
}

const authHeaders = {
  admin: { Authorization: "Bearer access-admin" },
  staff: { Authorization: "Bearer access-staff" },
  pt: { Authorization: "Bearer access-pt" },
  member: { Authorization: "Bearer access-member" },
}

describe("backend contract MSW handlers", () => {
  it("returns auth contract errors for locked and rate-limited accounts", async () => {
    const locked = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "locked@gymmaster.local",
        password: "Password123!",
      }),
    })
    const lockedBody = await readJson<{
      success: boolean
      error: { code: string; requestId?: string }
    }>(locked)

    expect(locked.status).toBe(423)
    expect(lockedBody.success).toBe(false)
    expect(lockedBody.error.code).toBe("ACCOUNT_LOCKED")
    expect(lockedBody.error.requestId).toBe("mock-request")

    const rateLimited = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "too-many@gymmaster.local",
        password: "Password123!",
      }),
    })
    const rateLimitedBody = await readJson<{
      success: boolean
      error: { code: string }
    }>(rateLimited)

    expect(rateLimited.status).toBe(429)
    expect(rateLimitedBody.error.code).toBe("TOO_MANY_ATTEMPTS")
  })

  it("rotates refresh tokens and rejects refresh token reuse", async () => {
    const firstRefresh = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "refresh-member" }),
    })
    const firstRefreshBody = await readJson<{
      success: boolean
      data: { refreshToken: string }
    }>(firstRefresh)

    expect(firstRefresh.status).toBe(200)
    expect(firstRefreshBody.success).toBe(true)
    expect(firstRefreshBody.data.refreshToken).not.toBe("refresh-member")

    const reusedRefresh = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "refresh-member" }),
    })
    const reusedRefreshBody = await readJson<{
      success: boolean
      error: { code: string }
    }>(reusedRefresh)

    expect(reusedRefresh.status).toBe(401)
    expect(reusedRefreshBody.error.code).toBe("INVALID_REFRESH_TOKEN")
  })

  it("revokes active refresh tokens on logout", async () => {
    const refresh = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "refresh-member" }),
    })
    const refreshBody = await readJson<{ data: { refreshToken: string } }>(
      refresh,
    )

    const logout = await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers: authHeaders.member,
    })

    expect(logout.status).toBe(204)

    const afterLogout = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshBody.data.refreshToken }),
    })
    const afterLogoutBody = await readJson<{ error: { code: string } }>(
      afterLogout,
    )

    expect(afterLogout.status).toBe(401)
    expect(afterLogoutBody.error.code).toBe("INVALID_REFRESH_TOKEN")
  })

  it("returns Google login contract errors", async () => {
    const notConfigured = await fetch("/api/v1/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "google-not-configured" }),
    })
    const notConfiguredBody = await readJson<{ error: { code: string } }>(
      notConfigured,
    )

    expect(notConfigured.status).toBe(500)
    expect(notConfiguredBody.error.code).toBe("GOOGLE_NOT_CONFIGURED")

    const invalidToken = await fetch("/api/v1/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "invalid-google-token" }),
    })
    const invalidTokenBody = await readJson<{ error: { code: string } }>(
      invalidToken,
    )

    expect(invalidToken.status).toBe(400)
    expect(invalidTokenBody.error.code).toBe("INVALID_GOOGLE_TOKEN")
  })

  it("wraps member search responses and enforces auth", async () => {
    const unauthorized = await fetch("/api/v1/members")
    expect(unauthorized.status).toBe(401)

    const response = await fetch("/api/v1/members?query=nguyen", {
      headers: authHeaders.staff,
    })
    const body = await readJson<{
      success: boolean
      data: { items: Array<{ fullName: string }>; total: number }
    }>(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.items[0]?.fullName).toContain("Nguyen")
  })

  it("rejects duplicate member creation with backend duplicate contract", async () => {
    const response = await fetch("/api/v1/members", {
      method: "POST",
      headers: {
        ...authHeaders.staff,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Nguyen Minh Anh",
        email: "member@gymmaster.local",
        phone: "0900000101",
      }),
    })
    const body = await readJson<{
      success: boolean
      error: { code: string }
    }>(response)

    expect(response.status).toBe(409)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("DUPLICATE")
  })

  it("creates pending-payment memberships from sell package contract", async () => {
    const response = await fetch("/api/v1/memberships/sell", {
      method: "POST",
      headers: {
        ...authHeaders.staff,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId: 101,
        packageId: 1,
        startDate: "2026-06-01",
      }),
    })
    const body = await readJson<{
      success: boolean
      data: { membership: { status: string } }
    }>(response)

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.membership.status).toBe("pending_payment")
  })

  it("records membership payment with backend method field", async () => {
    const sale = await fetch("/api/v1/memberships/sell", {
      method: "POST",
      headers: {
        ...authHeaders.staff,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId: 101,
        packageId: 1,
        startDate: "2026-06-01",
      }),
    })
    const saleBody = await readJson<{
      data: { membership: { id: number; status: string } }
    }>(sale)

    const payment = await fetch(
      `/api/v1/memberships/${saleBody.data.membership.id}/payment`,
      {
        method: "POST",
        headers: {
          ...authHeaders.staff,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 900000,
          method: "transfer",
        }),
      },
    )
    const paymentBody = await readJson<{
      success: boolean
      data: {
        membership: { status: string }
        payment: { paymentMethod: string; status: string }
      }
    }>(payment)

    expect(payment.status).toBe(201)
    expect(paymentBody.success).toBe(true)
    expect(paymentBody.data.membership.status).toBe("active")
    expect(paymentBody.data.payment.paymentMethod).toBe("transfer")
    expect(paymentBody.data.payment.status).toBe("paid")
  })

  it("declines check-in when payment is pending", async () => {
    const response = await fetch("/api/v1/checkins", {
      method: "POST",
      headers: {
        ...authHeaders.staff,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberId: 102 }),
    })
    const body = await readJson<{
      success: boolean
      error: { code: string }
    }>(response)

    expect(response.status).toBe(422)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("PAYMENT_PENDING")
  })

  it("declines check-in when no active membership exists", async () => {
    const response = await fetch("/api/v1/checkins", {
      method: "POST",
      headers: {
        ...authHeaders.staff,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberId: 103 }),
    })
    const body = await readJson<{
      success: boolean
      error: { code: string }
    }>(response)

    expect(response.status).toBe(422)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("NO_ACTIVE_MEMBERSHIP")
  })

  it("enforces PT assignment and ownership contracts", async () => {
    const duplicate = await fetch("/api/v1/assignments", {
      method: "POST",
      headers: {
        ...authHeaders.admin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId: 101,
        trainerId: 302,
      }),
    })
    const duplicateBody = await readJson<{
      error: { code: string }
    }>(duplicate)

    expect(duplicate.status).toBe(422)
    expect(duplicateBody.error.code).toBe("ALREADY_ASSIGNED")

    const deniedPlan = await fetch("/api/v1/members/103/workout-plans", {
      method: "POST",
      headers: {
        ...authHeaders.pt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Unauthorized plan",
        exercises: [{ name: "Squat", sets: 3, reps: "8", orderIndex: 0 }],
      }),
    })
    const deniedPlanBody = await readJson<{
      error: { code: string }
    }>(deniedPlan)

    expect(deniedPlan.status).toBe(403)
    expect(deniedPlanBody.error.code).toBe("FORBIDDEN")
  })

  it("serves canonical member profile-360 and progress validation contracts", async () => {
    const profile = await fetch("/api/v1/members/101/profile-360", {
      headers: authHeaders.admin,
    })
    const profileBody = await readJson<{
      success: boolean
      data: { member: { id: number }; currentMembership: { status: string } }
    }>(profile)

    expect(profile.status).toBe(200)
    expect(profileBody.success).toBe(true)
    expect(profileBody.data.member.id).toBe(101)
    expect(profileBody.data.currentMembership.status).toBe("active")

    const invalidProgress = await fetch("/api/v1/members/101/progress", {
      method: "POST",
      headers: {
        ...authHeaders.member,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        measuredAt: "2099-01-01",
        weightKg: -1,
      }),
    })
    const invalidProgressBody = await readJson<{
      error: { code: string }
    }>(invalidProgress)

    expect(invalidProgress.status).toBe(422)
    expect(invalidProgressBody.error.code).toBe("INVALID_MEASUREMENT")
  })

  it("keeps admin dashboard and audit endpoints admin-only", async () => {
    const denied = await fetch("/api/v1/dashboard/summary", {
      headers: authHeaders.staff,
    })
    expect(denied.status).toBe(403)

    const allowed = await fetch("/api/v1/dashboard/summary", {
      headers: authHeaders.admin,
    })
    const body = await readJson<{
      success: boolean
      data: { revenue: number; checkinsByDay: Array<{ count: number }> }
    }>(allowed)

    expect(allowed.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.revenue).toBeGreaterThan(0)
  })

  it("returns nutrition summary from meal log data", async () => {
    const response = await fetch("/api/v1/members/101/calorie-summary?date=2026-06-01", {
      headers: authHeaders.member,
    })
    const body = await readJson<{
      success: boolean
      data: { consumed: number; target: number; remaining: number }
    }>(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.consumed).toBeGreaterThan(0)
    expect(body.data.remaining).toBe(body.data.target - body.data.consumed)
  })

  it("serves nutrition online search and barcode through internal proxy contracts", async () => {
    const online = await fetch(
      "/api/v1/food-items/online-search?query=s%E1%BB%AFa&page=1&pageSize=10",
      {
        headers: authHeaders.member,
      },
    )
    const onlineBody = await readJson<{
      success: boolean
      data: Array<{ name: string; caloriesPerUnit: number }>
    }>(online)

    expect(online.status).toBe(200)
    expect(onlineBody.success).toBe(true)
    expect(onlineBody.data[0]?.name).toContain("TH True Milk")

    const barcode = await fetch("/api/v1/food-items/barcode/8936079015707", {
      headers: authHeaders.member,
    })
    const barcodeBody = await readJson<{
      data: { name: string; unit: string }
    }>(barcode)

    expect(barcode.status).toBe(200)
    expect(barcodeBody.data.name).toContain("TH True Milk")
    expect(barcodeBody.data.unit).toBe("180ml")
  })

  it("validates dashboard and audit date ranges", async () => {
    const invalidDashboard = await fetch(
      "/api/v1/dashboard/summary?from=2026-06-10&to=2026-06-01",
      {
        headers: authHeaders.admin,
      },
    )
    const invalidDashboardBody = await readJson<{
      error: { code: string }
    }>(invalidDashboard)

    expect(invalidDashboard.status).toBe(422)
    expect(invalidDashboardBody.error.code).toBe("INVALID_RANGE")

    const emptyDashboard = await fetch(
      "/api/v1/dashboard/summary?from=2100-01-01&to=2100-01-02",
      {
        headers: authHeaders.admin,
      },
    )
    const emptyDashboardBody = await readJson<{
      data: { revenue: number; activeCount: number; checkinsByDay: unknown[] }
    }>(emptyDashboard)

    expect(emptyDashboard.status).toBe(200)
    expect(emptyDashboardBody.data.revenue).toBe(0)
    expect(emptyDashboardBody.data.activeCount).toBe(0)
    expect(emptyDashboardBody.data.checkinsByDay).toHaveLength(0)

    const invalidAudit = await fetch(
      "/api/v1/audit-logs?from=2026-06-10&to=2026-06-01",
      {
        headers: authHeaders.admin,
      },
    )
    const invalidAuditBody = await readJson<{
      error: { code: string }
    }>(invalidAudit)

    expect(invalidAudit.status).toBe(422)
    expect(invalidAuditBody.error.code).toBe("INVALID_RANGE")
  })
})
