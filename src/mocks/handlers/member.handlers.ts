import { http } from "msw"

import { members, trainers } from "@/mocks/data/gymmaster.mock-data"
import {
  created,
  fail,
  getPage,
  noContent,
  ok,
  paged,
  requireRole,
} from "@/mocks/utils/api-response"

export const memberHandlers = [
  http.get("/api/members", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const query = url.searchParams.get("query")?.toLowerCase() ?? ""
    const filtered = members.filter((member) =>
      [member.fullName, member.email, member.phone, member.memberCode].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )

    return paged(filtered, getPage(request.url))
  }),
  http.post("/api/members", async ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as Partial<(typeof members)[number]>
    const member = {
      id: Math.max(...members.map((item) => item.id)) + 1,
      memberCode: `GM-${Math.floor(100 + Math.random() * 900)}`,
      fullName: body.fullName ?? "New Member",
      email: body.email ?? "new.member@gymmaster.local",
      phone: body.phone ?? "0900000999",
      status: "pending" as const,
    }
    members.push(member)

    return created(member)
  }),
  http.get("/api/members/:id", ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff", "pt", "member"])
    if (typeof role !== "string") return role

    const member = members.find((item) => item.id === Number(params.id))

    if (!member) {
      return fail("NOT_FOUND", "Member not found", 404)
    }

    if (role === "member" && member.email !== "member@gymmaster.local") {
      return fail("FORBIDDEN", "Forbidden", 403)
    }

    return ok(member)
  }),
  http.put("/api/members/:id", async ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const index = members.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Member not found", 404)
    }

    const body = (await request.json()) as Partial<(typeof members)[number]>
    members[index] = { ...members[index], ...body }

    return ok(members[index])
  }),
  http.delete("/api/members/:id", ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const index = members.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Member not found", 404)
    }

    members.splice(index, 1)
    return noContent()
  }),
  http.post("/api/v1/users", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as { fullName?: string; role?: string }

    return created({
      userId: Math.floor(1000 + Math.random() * 9000),
      fullName: body.fullName ?? "New User",
      role: body.role ?? "staff",
      initialPassword: "Temp123!",
    })
  }),
  http.post("/api/trainers", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as { userId?: number; specialty?: string }
    const trainer = {
      id: Math.max(...trainers.map((item) => item.id)) + 1,
      userId: body.userId ?? 99,
      fullName: "New Trainer",
      specialty: body.specialty ?? "General fitness",
      status: "active" as const,
    }
    trainers.push(trainer)

    return created(trainer)
  }),
]
