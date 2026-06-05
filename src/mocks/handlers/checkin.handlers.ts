import { http } from "msw"

import { checkins, members } from "@/mocks/data/gymmaster.mock-data"
import { created, fail, ok, requireRole } from "@/mocks/utils/api-response"
import { addNotification } from "@/mocks/handlers/notifications.handlers"

export const checkinHandlers = [
  http.post("/api/checkins", async ({ request }) => {
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

    if (member.status !== "active") {
      return fail("MEMBERSHIP_INACTIVE", "Membership is not active", 422)
    }

    const checkin = {
      id: Math.max(...checkins.map((item) => item.id)) + 1,
      memberId: member.id,
      checkInAt: new Date().toISOString(),
      source: role === "staff" ? "front-desk" : "member",
    }
    checkins.push(checkin)

    // Trigger dynamic notifications for the demo
    addNotification({
      title: "Hội viên Check-in thành công",
      description: `${member.fullName} vừa check-in tại quầy chính.`,
      type: "checkin",
      role: "staff",
      link: `/staff/members/${member.id}`,
    })

    addNotification({
      title: "Hội viên Check-in thành công",
      description: `Hội viên ${member.fullName} vừa check-in tại quầy.`,
      type: "checkin",
      role: "admin",
      link: `/admin/members/${member.id}`,
    })

    addNotification({
      title: "Bạn đã Check-in thành công",
      description: `Đã check-in thành công tại phòng tập lúc ${new Date().toLocaleTimeString("vi-VN")}.`,
      type: "checkin",
      role: "member",
      link: "/member/membership",
    })

    return created(checkin)
  }),
  http.get("/api/checkins", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    return ok(checkins)
  }),
  http.get("/api/members/:id/checkins", ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff", "pt", "member"])
    if (typeof role !== "string") return role

    return ok(checkins.filter((item) => item.memberId === Number(params.id)))
  }),
]
