import { http } from "msw"

import { checkins, members, memberships } from "@/mocks/data/gymmaster.mock-data"
import { created, fail, ok, requireRole } from "@/mocks/utils/api-response"

export const checkinHandlers = [
  http.post("/api/v1/checkins", async ({ request }) => {
    const role = requireRole(request, ["staff", "member"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as {
      memberId?: number
      memberCode?: string
    }
    const member =
      members.find((item) => item.id === body.memberId) ??
      members.find((item) => item.memberCode === body.memberCode)

    if (!member) {
      return fail("NOT_FOUND", "Member not found", 404)
    }

    const currentMembership = memberships.find(
      (item) => item.memberId === member.id && item.status !== "expired",
    )

    if (currentMembership?.status === "pending_payment") {
      return fail(
        "PAYMENT_PENDING",
        "Membership payment is still pending",
        422,
      )
    }

    if (currentMembership?.status !== "active" || member.status !== "active") {
      return fail(
        "NO_ACTIVE_MEMBERSHIP",
        "Member does not have an active membership",
        422,
      )
    }

    const checkin = {
      id: Math.max(...checkins.map((item) => item.id)) + 1,
      memberId: member.id,
      checkInAt: new Date().toISOString(),
      source: role === "staff" ? "front-desk" : "member",
    }
    checkins.push(checkin)

    return created(checkin)
  }),
  http.get("/api/v1/checkins", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    // Loc theo ngay lich VN (?date=YYYY-MM-DD) -> khung UTC, khop ListAsync cua BE.
    const dateParam = new URL(request.url).searchParams.get("date")
    let result = checkins
    if (dateParam) {
      const startUtc = new Date(`${dateParam}T00:00:00+07:00`).getTime()
      const endUtc = startUtc + 24 * 60 * 60 * 1000
      result = result.filter((item) => {
        const at = new Date(item.checkInAt).getTime()
        return at >= startUtc && at < endUtc
      })
    }

    // Dien ten hoi vien o endpoint LIST (BE that lam tuong tu) cho "check-in gan day".
    // Khong sap xep lai de giu thu tu tang dan (searchStaffMembers dung .at(-1) lay luot gan nhat).
    return ok(
      result.map((item) => ({
        ...item,
        memberName: members.find((member) => member.id === item.memberId)?.fullName,
      })),
    )
  }),
  http.get("/api/v1/members/:id/checkins", ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff", "pt", "member"])
    if (typeof role !== "string") return role

    return ok(checkins.filter((item) => item.memberId === Number(params.id)))
  }),
]
