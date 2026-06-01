import { http } from "msw"

import {
  members,
  memberships,
  trainers,
  assignments,
  checkins,
} from "@/mocks/data/gymmaster.mock-data"
import { ok, requireRole } from "@/mocks/utils/api-response"

export const member360Handlers = [
  http.get("/api/members/:id/360", ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff", "pt", "member"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)
    const member = members.find((item) => item.id === memberId)

    if (!member) {
      return ok(null)
    }

    // Find current membership
    const currentMembership = memberships.find(
      (item) => item.memberId === memberId && item.status !== "Expired",
    )

    // Find active assignment
    const activeAssignment = assignments.find(
      (item) => item.memberId === memberId && item.status === "active",
    )
    const assignedPT = activeAssignment
      ? trainers.find((t) => t.id === activeAssignment.trainerId)
      : null

    // Find recent check-ins
    const memberCheckIns = checkins
      .filter((item) => item.memberId === memberId)
      .sort(
        (a, b) =>
          new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime(),
      )
      .slice(0, 5)

    return ok({
      member: {
        id: member.id,
        memberCode: member.memberCode,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        status: member.status,
      },
      currentMembership: currentMembership
        ? {
            id: currentMembership.id,
            packageName: `Package #${currentMembership.packageId}`,
            startDate: currentMembership.startDate,
            endDate: currentMembership.endDate,
            status: currentMembership.status,
            paymentStatus:
              currentMembership.status === "Active" ? "paid" : "pending",
          }
        : null,
      assignedPT: assignedPT
        ? {
            id: assignedPT.id,
            fullName: assignedPT.fullName,
            specialty: assignedPT.specialty,
            assignedAt: activeAssignment!.assignedAt,
          }
        : null,
      recentCheckIns: memberCheckIns.map((item) => ({
        id: item.id,
        checkInAt: item.checkInAt,
      })),
    })
  }),
]
