import { http } from "msw"

import {
  assignments,
  members,
  trainerNotes,
  workoutPlans,
} from "@/mocks/data/gymmaster.mock-data"
import { created, fail, ok, requireRole } from "@/mocks/utils/api-response"

function isAssignedMember(memberId: number) {
  return assignments.some(
    (assignment) =>
      assignment.memberId === memberId && assignment.status === "active",
  )
}

export const trainingHandlers = [
  http.post("/api/assignments", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as { memberId?: number; trainerId?: number }
    const duplicate = assignments.find(
      (item) => item.memberId === body.memberId && item.status === "active",
    )

    if (duplicate) {
      return fail("ACTIVE_ASSIGNMENT_EXISTS", "Member already has an active PT", 422)
    }

    const assignment = {
      id: Math.max(...assignments.map((item) => item.id)) + 1,
      memberId: body.memberId ?? 101,
      trainerId: body.trainerId ?? 301,
      status: "active",
      assignedAt: new Date().toISOString(),
    }
    assignments.push(assignment)

    return created(assignment)
  }),
  http.get("/api/pt/members", ({ request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const assignedMemberIds = new Set(
      assignments.map((assignment) => assignment.memberId),
    )

    return ok(members.filter((member) => assignedMemberIds.has(member.id)))
  }),
  http.post("/api/members/:id/workout-plans", async ({ params, request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)
    const body = (await request.json()) as {
      title?: string
      exercises?: Array<{
        name?: string
        sets?: number
        reps?: string
        note?: string
        orderIndex?: number
      }>
    }

    if (!isAssignedMember(memberId)) {
      return fail("FORBIDDEN", "PT can only manage assigned members", 403)
    }

    if (!body.title?.trim()) {
      return fail("VALIDATION_ERROR", "Workout plan title is required", 422)
    }

    if (!body.exercises?.length) {
      return fail("EMPTY_PLAN", "Workout plan requires at least one exercise", 422)
    }

    const now = new Date().toISOString()
    const nextId =
      workoutPlans.length > 0 ? Math.max(...workoutPlans.map((item) => item.id)) + 1 : 1
    const plan = {
      id: nextId,
      memberId,
      trainerId: 301,
      title: body.title,
      status: "active" as const,
      startDate: new Date().toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
      exercises: body.exercises.map((exercise, index) => ({
        id: index + 1,
        workoutPlanId: nextId,
        name: exercise.name ?? "Exercise",
        sets: exercise.sets ?? 1,
        reps: exercise.reps ?? "8",
        note: exercise.note,
        orderIndex: exercise.orderIndex ?? index,
      })),
    }
    workoutPlans.push(plan)

    return created(plan)
  }),
  http.put("/api/workout-plans/:id", async ({ params, request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const index = workoutPlans.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Workout plan not found", 404)
    }

    workoutPlans[index] = {
      ...workoutPlans[index],
      ...((await request.json()) as Partial<(typeof workoutPlans)[number]>),
    }

    return ok(workoutPlans[index])
  }),
  http.post("/api/members/:id/notes", async ({ params, request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)
    const body = (await request.json()) as { content?: string }
    const content = body.content?.trim() ?? ""

    if (!isAssignedMember(memberId)) {
      return fail("FORBIDDEN", "PT can only manage assigned members", 403)
    }

    if (!content) {
      return fail("VALIDATION_ERROR", "Trainer note content is required", 422)
    }

    const note = {
      id: Math.max(...trainerNotes.map((item) => item.id)) + 1,
      memberId,
      trainerId: 301,
      content,
      createdAt: new Date().toISOString(),
    }
    trainerNotes.push(note)

    return created(note)
  }),
  http.get("/api/members/:id/notes", ({ params, request }) => {
    const role = requireRole(request, ["pt", "member", "admin"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)

    if (role === "pt" && !isAssignedMember(memberId)) {
      return fail("FORBIDDEN", "PT can only view assigned members", 403)
    }

    return ok(trainerNotes.filter((item) => item.memberId === memberId))
  }),
  http.get("/api/members/:id/workout-plans", ({ params, request }) => {
    const role = requireRole(request, ["pt", "member", "admin"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)

    if (role === "pt" && !isAssignedMember(memberId)) {
      return fail("FORBIDDEN", "PT can only view assigned members", 403)
    }

    return ok(workoutPlans.filter((item) => item.memberId === memberId))
  }),
]
