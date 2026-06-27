import { http } from "msw"

import {
  auditLogs,
  assignments,
  members,
  trainerNotes,
  trainers,
  workoutPlans,
} from "@/mocks/data/gymmaster.mock-data"
import { created, fail, noContent, ok, requireRole } from "@/mocks/utils/api-response"

function isAssignedMember(memberId: number) {
  return assignments.some(
    (assignment) =>
      assignment.memberId === memberId && assignment.status === "active",
  )
}

function activeAssignmentForMember(memberId: number) {
  return assignments.find(
    (assignment) =>
      assignment.memberId === memberId && assignment.status === "active",
  )
}

function trainerName(trainerId?: number) {
  if (!trainerId) return undefined

  return trainers.find((trainer) => trainer.id === trainerId)?.fullName
}

function assignedCount(trainerId: number) {
  return assignments.filter(
    (assignment) =>
      assignment.trainerId === trainerId && assignment.status === "active",
  ).length
}

function memberGoal(memberId: number) {
  if (memberId === 102) return "Hypertrophy / Strength"
  if (memberId === 103) return "Marathon prep / Cardio"
  return "Weight Loss & Toning"
}

function nextId(items: Array<{ id: number }>) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
}

export const trainingHandlers = [
  http.get("/api/v1/assignments/candidates/members", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const query = url.searchParams.get("query")?.toLowerCase() ?? ""
    const includeAssigned = url.searchParams.get("includeAssigned") !== "false"
    const filtered = members
      .filter((member) => !member.isDeleted)
      .map((member) => {
        const activeAssignment = activeAssignmentForMember(member.id)

        return {
          id: member.id,
          memberCode: member.memberCode,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          membershipStatus: member.status,
          goal: memberGoal(member.id),
          currentTrainerId: activeAssignment?.trainerId,
          currentTrainerName: trainerName(activeAssignment?.trainerId),
          priority: member.id === 102 ? "high" : "normal",
        }
      })
      .filter((member) => includeAssigned || !member.currentTrainerId)
      .filter((member) =>
        [
          member.fullName,
          member.email,
          member.memberCode,
          member.phone,
          member.goal ?? "",
          member.currentTrainerName ?? "",
        ].some((value) => value.toLowerCase().includes(query)),
      )

    return ok({
      items: filtered,
      total: filtered.length,
    })
  }),
  http.get("/api/v1/assignments/candidates/trainers", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const query = url.searchParams.get("query")?.toLowerCase() ?? ""
    const specialty = url.searchParams.get("specialty")?.toLowerCase() ?? ""
    const filtered = trainers
      .filter((trainer) => trainer.status === "active")
      .filter((trainer) =>
        [trainer.fullName, trainer.specialty].some((value) =>
          value.toLowerCase().includes(query),
        ),
      )
      .filter((trainer) =>
        specialty ? trainer.specialty.toLowerCase().includes(specialty) : true,
      )
      .map((trainer, index) => ({
        id: trainer.id,
        userId: trainer.userId,
        fullName: trainer.fullName,
        specialty: trainer.specialty,
        status: trainer.status,
        assignedCount: assignedCount(trainer.id),
        capacity: 15,
        rating: Number((4.9 - index * 0.1).toFixed(1)),
      }))

    return ok({
      items: filtered,
      total: filtered.length,
    })
  }),
  http.post("/api/v1/assignments", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as { memberId?: number; trainerId?: number }
    const member = members.find((item) => item.id === body.memberId && !item.isDeleted)
    const trainer = trainers.find((item) => item.id === body.trainerId)

    if (!body.memberId || !body.trainerId) {
      return fail("VALIDATION_ERROR", "Vui lòng chọn hội viên và PT", 422)
    }

    if (!member || !trainer) {
      return fail("NOT_FOUND", "Không tìm thấy hội viên hoặc PT", 404)
    }

    if (trainer.status !== "active") {
      return fail("VALIDATION_ERROR", "PT không khả dụng", 422)
    }

    const now = new Date().toISOString()
    const previousAssignment = activeAssignmentForMember(body.memberId)

    if (previousAssignment) {
      return fail(
        "ALREADY_ASSIGNED",
        "Hội viên này đang có PT active. Hãy kết thúc assignment cũ trước khi phân công mới.",
        422,
      )
    }

    const auditLogId = nextId(auditLogs)
    const assignment = {
      id: nextId(assignments),
      memberId: body.memberId,
      trainerId: body.trainerId,
      status: "active" as const,
      assignedAt: now,
      auditLogId,
    }
    assignments.push(assignment)
    member.assignedTrainerId = body.trainerId
    auditLogs.unshift({
      id: auditLogId,
      action: "ASSIGN_PT",
      createdAt: now,
      entityId: assignment.id,
      entityType: "TrainerAssignment",
      userDisplayName: "Admin User",
      userId: 1,
    })

    return created({
      assignment,
      previousAssignment,
      auditLogId,
      message: "Đã phân công PT",
    })
  }),
  http.get("/api/v1/pt/members", ({ request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const assignedMemberIds = new Set(
      assignments
        .filter((assignment) => assignment.status === "active")
        .map((assignment) => assignment.memberId),
    )

    return ok(members.filter((member) => assignedMemberIds.has(member.id)))
  }),
  http.post("/api/v1/members/:id/workout-plans", async ({ params, request }) => {
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
  http.put("/api/v1/workout-plans/:id", async ({ params, request }) => {
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
  http.delete("/api/v1/workout-plans/:id", ({ params, request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const index = workoutPlans.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Workout plan not found", 404)
    }

    workoutPlans.splice(index, 1)

    return noContent()
  }),
  http.post("/api/v1/members/:id/notes", async ({ params, request }) => {
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
  http.put("/api/v1/trainer-notes/:id", async ({ params, request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const index = trainerNotes.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Trainer note not found", 404)
    }

    const body = (await request.json()) as { content?: string }
    const content = body.content?.trim() ?? ""

    if (!content) {
      return fail("VALIDATION_ERROR", "Trainer note content is required", 422)
    }

    trainerNotes[index] = { ...trainerNotes[index], content }

    return ok(trainerNotes[index])
  }),
  http.delete("/api/v1/trainer-notes/:id", ({ params, request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const index = trainerNotes.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Trainer note not found", 404)
    }

    trainerNotes.splice(index, 1)

    return noContent()
  }),
  http.get("/api/v1/members/:id/notes", ({ params, request }) => {
    const role = requireRole(request, ["pt", "member", "admin"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)

    if (role === "pt" && !isAssignedMember(memberId)) {
      return fail("FORBIDDEN", "PT can only view assigned members", 403)
    }

    return ok(trainerNotes.filter((item) => item.memberId === memberId))
  }),
  http.get("/api/v1/members/:id/workout-plans", ({ params, request }) => {
    const role = requireRole(request, ["pt", "member", "admin"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)

    if (role === "pt" && !isAssignedMember(memberId)) {
      return fail("FORBIDDEN", "PT can only view assigned members", 403)
    }

    return ok(workoutPlans.filter((item) => item.memberId === memberId))
  }),
]
