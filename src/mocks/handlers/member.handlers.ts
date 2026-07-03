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
  http.get("/api/v1/members", ({ request }) => {
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
  http.post("/api/v1/members", async ({ request }) => {
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
  http.get("/api/v1/members/me", ({ request }) => {
    const role = requireRole(request, ["member"])
    if (typeof role !== "string") return role

    const member = getOrCreateMockSelfProfile()

    return ok(toPascalMemberResponse(member))
  }),
  http.put("/api/v1/members/me", async ({ request }) => {
    const role = requireRole(request, ["member"])
    if (typeof role !== "string") return role

    const member = getOrCreateMockSelfProfile()
    const index = members.findIndex((item) => item.id === member.id)
    const body = (await request.json()) as {
      FullName?: string | null
      Phone?: string | null
      DateOfBirth?: string | null
      Gender?: string | null
      Address?: string | null
      EmergencyContact?: string | null
    }

    const normalizedPhone = body.Phone?.toLowerCase()
    const duplicate = normalizedPhone
      ? members.some(
          (item) =>
            item.id !== member.id &&
            !item.isDeleted &&
            item.phone.toLowerCase() === normalizedPhone,
        )
      : false

    if (duplicate) {
      return fail("DUPLICATE", "Phone already exists", 409)
    }

    members[index] = {
      ...member,
      fullName: body.FullName ?? member.fullName,
      phone: body.Phone ?? member.phone,
      dateOfBirth:
        "DateOfBirth" in body ? body.DateOfBirth ?? undefined : member.dateOfBirth,
      gender: "Gender" in body ? body.Gender ?? undefined : member.gender,
      address: "Address" in body ? body.Address ?? undefined : member.address,
      emergencyContact:
        "EmergencyContact" in body
          ? body.EmergencyContact ?? undefined
          : member.emergencyContact,
    }

    return ok(toPascalMemberResponse(members[index]))
  }),
  http.get("/api/v1/members/:id", ({ params, request }) => {
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
  http.put("/api/v1/members/:id", async ({ params, request }) => {
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
  http.delete("/api/v1/members/:id", ({ params, request }) => {
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
      if (user.isDeleted) return false

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
      role?: "staff" | "admin"
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

    if (body.role && !isOperationalRole(body.role)) {
      return fail("INVALID_ROLE", "Invalid role for admin user creation", 422)
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
  http.put("/api/v1/users/:id", async ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const index = userAccounts.findIndex(
      (user) => user.userId === Number(params.id) && !user.isDeleted,
    )

    if (index < 0) {
      return fail("NOT_FOUND", "User not found", 404)
    }

    const body = (await request.json()) as Partial<(typeof userAccounts)[number]>
    const requestedRole = body.role
    const currentRole = userAccounts[index].role
    const normalizedEmail = body.email?.toLowerCase()
    const duplicate = userAccounts.some(
      (user) =>
        user.userId !== userAccounts[index].userId &&
        !user.isDeleted &&
        ((normalizedEmail && user.email.toLowerCase() === normalizedEmail) ||
          (body.phone && user.phone === body.phone)),
    )

    if (duplicate) {
      return fail("DUPLICATE", "Email or phone already exists", 409)
    }

    if (requestedRole && requestedRole !== currentRole) {
      return fail(
        "ROLE_TRANSITION_NOT_ALLOWED",
        "Role cannot be changed after creation",
        422,
      )
    }

    const hasPersonalFields =
      "dateOfBirth" in body ||
      "gender" in body ||
      "address" in body ||
      "emergencyContact" in body

    if (hasPersonalFields && !isOperationalRole(currentRole)) {
      return fail(
        "VALIDATION_ERROR",
        "Personal profile for members/PT is managed in its own door",
        422,
      )
    }

    userAccounts[index] = {
      ...userAccounts[index],
      email: body.email ?? userAccounts[index].email,
      fullName: body.fullName ?? userAccounts[index].fullName,
      phone: "phone" in body ? body.phone : userAccounts[index].phone,
      dateOfBirth: "dateOfBirth" in body ? body.dateOfBirth : userAccounts[index].dateOfBirth,
      gender: "gender" in body ? body.gender : userAccounts[index].gender,
      address: "address" in body ? body.address : userAccounts[index].address,
      emergencyContact: "emergencyContact" in body ? body.emergencyContact : userAccounts[index].emergencyContact,
    }

    return ok(userAccounts[index])
  }),
  http.patch("/api/v1/users/:id/status", async ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const index = userAccounts.findIndex(
      (user) => user.userId === Number(params.id) && !user.isDeleted,
    )

    if (index < 0) {
      return fail("NOT_FOUND", "User not found", 404)
    }

    const body = (await request.json()) as { status?: "active" | "locked" }
    if (body.status !== "active" && body.status !== "locked") {
      return fail("VALIDATION_ERROR", "Invalid status", 422)
    }

    userAccounts[index] = {
      ...userAccounts[index],
      status: body.status,
    }

    if (userAccounts[index].role === "pt") {
      const trainerIndex = trainers.findIndex(
        (trainer) => trainer.userId === userAccounts[index].userId,
      )
      if (trainerIndex >= 0) {
        trainers[trainerIndex] = {
          ...trainers[trainerIndex],
          status: body.status,
        }
      }
    }

    return ok(userAccounts[index])
  }),
  http.post("/api/v1/users/:id/reset-password", ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const user = userAccounts.find(
      (item) => item.userId === Number(params.id) && !item.isDeleted,
    )

    if (!user) {
      return fail("NOT_FOUND", "User not found", 404)
    }

    user.initialPassword = `Temp${user.userId}123!`
    user.passwordAutoGenerated = true

    return ok({
      userId: user.userId,
      temporaryPassword: user.initialPassword,
    })
  }),
  http.delete("/api/v1/users/:id", ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const index = userAccounts.findIndex(
      (user) => user.userId === Number(params.id) && !user.isDeleted,
    )

    if (index < 0) {
      return fail("NOT_FOUND", "User not found", 404)
    }

    userAccounts[index] = {
      ...userAccounts[index],
      isDeleted: true,
      status: "locked",
    }

    return noContent()
  }),
  http.get("/api/v1/trainers/me", ({ request }) => {
    const role = requireRole(request, ["pt"])
    if (typeof role !== "string") return role

    const account = userAccounts.find((item) => item.role === "pt")
    const trainer = trainers.find(
      (item) => item.userId === account?.userId && item.status !== "locked",
    )

    if (!trainer) {
      return fail(
        "NOT_FOUND",
        "Khong tim thay ho so huan luyen vien.",
        404,
      )
    }

    return ok(toPascalTrainerResponse(trainer))
  }),
  http.get("/api/v1/trainers", ({ request }) => {
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
  http.post("/api/v1/trainers", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as {
      bio?: string
      dateOfBirth?: string
      email?: string
      fullName?: string
      gender?: string
      password?: string
      phone?: string
      specialty?: string
      userId?: number
      yearsOfExperience?: number
      address?: string
      emergencyContact?: string
    }

    if (body.userId) {
      const account = userAccounts.find(
        (user) => user.userId === body.userId && !user.isDeleted,
      )

      if (!account) {
        return fail("NOT_FOUND", "User not found", 404)
      }

      if (account.role !== "pt") {
        return fail("INVALID_ROLE", "Linked user must have PT role", 422)
      }

      if (trainers.some((trainer) => trainer.userId === account.userId)) {
        return fail("DUPLICATE", "Trainer profile already exists", 409)
      }

      const trainer = {
        id: Math.max(...trainers.map((item) => item.id)) + 1,
        userId: account.userId,
        fullName: account.fullName,
        email: account.email,
        specialty: body.specialty ?? "General fitness",
        bio: body.bio ?? null,
        gender: body.gender ?? null,
        dateOfBirth: body.dateOfBirth ?? null,
        address: body.address ?? null,
        emergencyContact: body.emergencyContact ?? null,
        yearsOfExperience: body.yearsOfExperience ?? null,
        createdAt: new Date().toISOString(),
        status: "active" as const,
      }
      trainers.push(trainer)

      return created({
        trainer,
        initialPassword: null,
        passwordAutoGenerated: false,
        linkedToExistingAccount: true,
      })
    }

    if (!body.email) {
      return fail("VALIDATION_ERROR", "Email is required", 422)
    }

    if (
      userAccounts.some(
        (user) =>
          !user.isDeleted &&
          (user.email.toLowerCase() === body.email?.toLowerCase() ||
            (body.phone && user.phone === body.phone)),
      )
    ) {
      return fail("DUPLICATE", "Email or phone already exists", 409)
    }

    const passwordAutoGenerated = !body.password
    const account = {
      userId: Math.max(...userAccounts.map((item) => item.userId)) + 1,
      fullName: body.fullName ?? "New Trainer",
      email: body.email,
      phone: body.phone,
      role: "pt" as const,
      status: "active" as const,
      initialPassword: passwordAutoGenerated ? "TempPt123!" : body.password,
      passwordAutoGenerated,
    }
    userAccounts.push(account)

    const trainer = {
      id: Math.max(...trainers.map((item) => item.id)) + 1,
      userId: account.userId,
      fullName: account.fullName,
      email: account.email,
      specialty: body.specialty ?? "General fitness",
      bio: body.bio ?? null,
      gender: body.gender ?? null,
      dateOfBirth: body.dateOfBirth ?? null,
      address: body.address ?? null,
      emergencyContact: body.emergencyContact ?? null,
      yearsOfExperience: body.yearsOfExperience ?? null,
      createdAt: new Date().toISOString(),
      status: "active" as const,
    }
    trainers.push(trainer)

    return created({
      trainer,
      initialPassword: account.initialPassword ?? null,
      passwordAutoGenerated,
      linkedToExistingAccount: false,
    })
  }),
  http.put("/api/v1/trainers/:id", async ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const index = trainers.findIndex((trainer) => trainer.id === Number(params.id))
    if (index < 0) {
      return fail("NOT_FOUND", "Trainer not found", 404)
    }

    const body = (await request.json()) as Partial<(typeof trainers)[number]>
    if (body.yearsOfExperience != null && body.yearsOfExperience < 0) {
      return fail("VALIDATION_ERROR", "Invalid years of experience", 400)
    }

    trainers[index] = {
      ...trainers[index],
      specialty: "specialty" in body ? body.specialty ?? "" : trainers[index].specialty,
      bio: "bio" in body ? body.bio ?? null : trainers[index].bio,
      gender: "gender" in body ? body.gender ?? null : trainers[index].gender,
      dateOfBirth: "dateOfBirth" in body ? body.dateOfBirth ?? null : trainers[index].dateOfBirth,
      yearsOfExperience:
        "yearsOfExperience" in body ? body.yearsOfExperience ?? null : trainers[index].yearsOfExperience,
      address: "address" in body ? body.address ?? null : trainers[index].address,
      emergencyContact:
        "emergencyContact" in body ? body.emergencyContact ?? null : trainers[index].emergencyContact,
    }

    return ok(trainers[index])
  }),
]

function isOperationalRole(role: unknown): role is "staff" | "admin" {
  return role === "staff" || role === "admin"
}

function getOrCreateMockSelfProfile() {
  const account = userAccounts.find((item) => item.role === "member")
  let member = members.find(
    (item) => item.email === "member@gymmaster.local" && !item.isDeleted,
  )

  if (!member) {
    member = {
      id: Math.max(...members.map((item) => item.id)) + 1,
      memberCode: `GM-${Math.floor(100 + Math.random() * 900)}`,
      fullName: account?.fullName ?? "Gym Member",
      email: account?.email ?? "member@gymmaster.local",
      avatarUrl: account?.avatarUrl ?? null,
      phone: account?.phone ?? "",
      status: "active",
    }
    members.push(member)
  }

  return member
}

function toPascalMemberResponse(member: (typeof members)[number]) {
  return {
    Id: member.id,
    UserId: 4,
    MemberCode: member.memberCode,
    Email: member.email,
    FullName: member.fullName,
    AvatarUrl: member.avatarUrl ?? null,
    Phone: member.phone || null,
    DateOfBirth: member.dateOfBirth ?? null,
    Gender: member.gender ?? null,
    Address: member.address ?? null,
    EmergencyContact: member.emergencyContact ?? null,
    JoinedAt: "2026-06-01T00:00:00.000Z",
    Status: "active",
    CreatedAt: "2026-06-01T00:00:00.000Z",
  }
}

function toPascalTrainerResponse(trainer: (typeof trainers)[number]) {
  const account = userAccounts.find((item) => item.userId === trainer.userId)

  return {
    Id: trainer.id,
    UserId: trainer.userId,
    Email: trainer.email ?? account?.email ?? "",
    FullName: trainer.fullName,
    Status: trainer.status,
    Specialty: trainer.specialty ?? null,
    Bio: trainer.bio ?? null,
    Gender: trainer.gender ?? null,
    DateOfBirth: trainer.dateOfBirth ?? null,
    Address: trainer.address ?? null,
    EmergencyContact: trainer.emergencyContact ?? null,
    YearsOfExperience: trainer.yearsOfExperience ?? null,
    CreatedAt: trainer.createdAt ?? "2026-05-01T00:00:00.000Z",
  }
}
