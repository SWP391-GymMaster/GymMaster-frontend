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
  it("wraps member search responses and enforces auth", async () => {
    const unauthorized = await fetch("/api/members")
    expect(unauthorized.status).toBe(401)

    const response = await fetch("/api/members?query=nguyen", {
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

  it("creates pending-payment memberships from sell package contract", async () => {
    const response = await fetch("/api/memberships/sell", {
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
    expect(body.data.membership.status).toBe("PendingPayment")
  })

  it("declines check-in when membership is inactive", async () => {
    const response = await fetch("/api/checkins", {
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
    expect(body.error.code).toBe("MEMBERSHIP_INACTIVE")
  })

  it("keeps admin dashboard and audit endpoints admin-only", async () => {
    const denied = await fetch("/api/dashboard/summary", {
      headers: authHeaders.staff,
    })
    expect(denied.status).toBe(403)

    const allowed = await fetch("/api/dashboard/summary", {
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
    const response = await fetch("/api/members/101/calorie-summary?date=2026-06-01", {
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
})
