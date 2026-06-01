import { http } from "msw"

import {
  assignments,
  members,
  trainerNotes,
  workoutPlans,
} from "@/mocks/data/gymmaster.mock-data"
import { created, fail, ok, requireRole } from "@/mocks/utils/api-response"

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

    const body = (await request.json()) as { title?: string; exercises?: unknown[] }
    const plan = {
      id: Math.max(...workoutPlans.map((item) => item.id)) + 1,
      memberId: Number(params.id),
      trainerId: 301,
      title: body.title ?? "New Workout Plan",
      exercises: body.exercises ?? [],
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

    const body = (await request.json()) as { content?: string }
    const note = {
      id: Math.max(...trainerNotes.map((item) => item.id)) + 1,
      memberId: Number(params.id),
      trainerId: 301,
      content: body.content ?? "",
      createdAt: new Date().toISOString(),
    }
    trainerNotes.push(note)

    return created(note)
  }),
  http.get("/api/members/:id/workout-plans", ({ params, request }) => {
    const role = requireRole(request, ["pt", "member", "admin"])
    if (typeof role !== "string") return role

    return ok(workoutPlans.filter((item) => item.memberId === Number(params.id)))
  }),
]
