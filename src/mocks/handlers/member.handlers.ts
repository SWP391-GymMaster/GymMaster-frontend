import { http } from "msw"

import { members, trainers, userAccounts } from "@/mocks/data/gymmaster.mock-data"
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
    const filtered = members
      .filter((member) => !member.isDeleted)
      .filter((member) =>
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
    const normalizedEmail = body.email?.toLowerCase()
    const normalizedPhone = body.phone?.toLowerCase()

    const duplicate = members.some(
      (member) =>
        !member.isDeleted &&
        (member.email.toLowerCase() === normalizedEmail ||
          member.phone.toLowerCase() === normalizedPhone),
    )

    if (duplicate) {
      return fail("DUPLICATE", "Email or phone already exists", 409)
    }

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

    const member = members.find(
      (item) => item.id === Number(params.id) && !item.isDeleted,
    )

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
    const normalizedEmail = body.email?.toLowerCase()
    const normalizedPhone = body.phone?.toLowerCase()
    const duplicate = members.some(
      (member) =>
        member.id !== members[index].id &&
        !member.isDeleted &&
        ((normalizedEmail && member.email.toLowerCase() === normalizedEmail) ||
          (normalizedPhone && member.phone.toLowerCase() === normalizedPhone)),
    )

    if (duplicate) {
      return fail("DUPLICATE", "Email or phone already exists", 409)
    }

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

    members[index] = { ...members[index], isDeleted: true }
    return noContent()
  }),
  http.get("/api/v1/users", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const query = url.searchParams.get("query")?.toLowerCase() ?? ""
    const roleFilter = url.searchParams.get("role")
    const filtered = userAccounts.filter((user) => {
      const matchesRole = roleFilter ? user.role === roleFilter : true
      const matchesQuery = [user.fullName, user.email, user.phone ?? "", user.role].some(
        (value) => value.toLowerCase().includes(query),
      )

      return matchesRole && matchesQuery
    })

    return paged(filtered, getPage(request.url))
  }),
  http.post("/api/v1/users", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as {
      email?: string
      fullName?: string
      phone?: string
      role?: "staff" | "pt" | "member"
      password?: string
    }
    const normalizedEmail = body.email?.toLowerCase()
    const duplicate = userAccounts.some(
      (user) =>
        user.email.toLowerCase() === normalizedEmail ||
        (body.phone && user.phone === body.phone),
    )

    if (duplicate) {
      return fail("DUPLICATE", "Email or phone already exists", 409)
    }

    const passwordAutoGenerated = !body.password
    const user = {
      userId: Math.max(...userAccounts.map((item) => item.userId)) + 1,
      fullName: body.fullName ?? "New User",
      email: body.email ?? "new.user@gymmaster.local",
      phone: body.phone,
      role: body.role ?? "staff",
      status: "active" as const,
      initialPassword: passwordAutoGenerated ? "Temp123!" : undefined,
      passwordAutoGenerated,
    }
    userAccounts.push(user)

    return created(user)
  }),
  http.get("/api/trainers", ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const url = new URL(request.url)
    const query = url.searchParams.get("query")?.toLowerCase() ?? ""
    const filtered = trainers.filter((trainer) =>
      [trainer.fullName, trainer.specialty, trainer.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )

    return paged(filtered, getPage(request.url))
  }),
  http.post("/api/trainers", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as {
      fullName?: string
      specialty?: string
      userId?: number
    }
    const trainer = {
      id: Math.max(...trainers.map((item) => item.id)) + 1,
      userId: body.userId ?? 99,
      fullName: body.fullName ?? "New Trainer",
      specialty: body.specialty ?? "General fitness",
      status: "active" as const,
    }
    trainers.push(trainer)

    return created(trainer)
  }),
]
