import { http } from "msw"

import {
  members,
  memberships,
  trainers,
  assignments,
  checkins,
} from "@/mocks/data/gymmaster.mock-data"
import { fail, ok, requireRole } from "@/mocks/utils/api-response"

function buildMember360Response(memberId: number) {
  const member = members.find((item) => item.id === memberId && !item.isDeleted)

  if (!member) {
    return null
  }

  const currentMembership = memberships.find(
    (item) => item.memberId === memberId && item.status !== "expired",
  )
  const memberMemberships = memberships.filter((item) => item.memberId === memberId)
  const activeAssignment = assignments.find(
    (item) => item.memberId === memberId && item.status === "active",
  )
  const assignedPT = activeAssignment
    ? trainers.find((trainer) => trainer.id === activeAssignment.trainerId)
    : null
  const memberCheckIns = checkins
    .filter((item) => item.memberId === memberId)
    .sort(
      (a, b) =>
        new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime(),
    )
    .slice(0, 5)

  return {
    member: {
      id: member.id,
      memberCode: member.memberCode,
      fullName: member.fullName,
      avatarUrl: member.avatarUrl ?? null,
      email: member.email,
      phone: member.phone,
      status: member.status,
    },
    currentMembership: currentMembership
      ? {
          id: currentMembership.id,
          memberId: currentMembership.memberId,
          packageId: currentMembership.packageId,
          packageName: `Package #${currentMembership.packageId}`,
          supportsPT: false,
          startDate: currentMembership.startDate,
          endDate: currentMembership.endDate,
          status: currentMembership.status,
          paymentStatus:
            currentMembership.status === "active" ? "paid" : "pending",
        }
      : null,
    membershipHistory: memberMemberships.map((membership) => ({
      id: membership.id,
      memberId: membership.memberId,
      packageId: membership.packageId,
      packageName: `Package #${membership.packageId}`,
      supportsPT: false,
      startDate: membership.startDate,
      endDate: membership.endDate,
      status: membership.status,
      paymentStatus: membership.status === "active" ? "paid" : "pending",
    })),
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
  }
}

export const member360Handlers = [
  http.get("/api/v1/members/:id/profile-360", ({ params, request }) => {
    const role = requireRole(request, ["admin", "pt", "member"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)
    const data = buildMember360Response(memberId)

    if (!data) {
      return fail("NOT_FOUND", "Member not found", 404)
    }

    return ok(data)
  }),
  http.get("/api/v1/members/:id/360", ({ params, request }) => {
    const role = requireRole(request, ["admin", "pt", "member"])
    if (typeof role !== "string") return role

    const data = buildMember360Response(Number(params.id))

    if (!data) {
      return fail("NOT_FOUND", "Member not found", 404)
    }

    return ok(data)
  }),
]
