import { http } from "msw"

import { members, memberships, packages, payments } from "@/mocks/data/gymmaster.mock-data"
import { created, fail, ok, requireRole } from "@/mocks/utils/api-response"

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00.000Z`)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)

  return nextDate.toISOString().slice(0, 10)
}

export const billingHandlers = [
  http.get("/api/v1/memberships", ({ request }) => {
    const role = requireRole(request, ["admin", "staff", "pt", "member"])
    if (typeof role !== "string") return role

    return ok(memberships)
  }),
  http.get("/api/v1/packages", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    return ok(packages)
  }),
  http.post("/api/v1/packages", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as Partial<(typeof packages)[number]>

    if (!body.name || !body.durationDays || body.durationDays <= 0 || (body.price ?? 0) < 0) {
      return fail("VALIDATION_ERROR", "Package data is invalid", 400)
    }

    const gymPackage = {
      id: Math.max(...packages.map((item) => item.id)) + 1,
      name: body.name,
      durationDays: body.durationDays,
      price: body.price ?? 0,
      status: body.status ?? ("active" as const),
    }
    packages.push(gymPackage)

    return created(gymPackage)
  }),
  http.put("/api/v1/packages/:id", async ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const index = packages.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Package not found", 404)
    }

    const body = (await request.json()) as Partial<(typeof packages)[number]>

    if (
      body.durationDays !== undefined &&
      body.durationDays <= 0
    ) {
      return fail("VALIDATION_ERROR", "Package duration must be positive", 400)
    }

    if (body.price !== undefined && body.price < 0) {
      return fail("VALIDATION_ERROR", "Package price cannot be negative", 400)
    }

    packages[index] = { ...packages[index], ...body }

    return ok(packages[index])
  }),
  http.post("/api/v1/memberships/sell", async ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as {
      memberId?: number
      packageId?: number
      startDate?: string
    }
    const member = members.find((item) => item.id === body.memberId && !item.isDeleted)
    const gymPackage = packages.find((item) => item.id === body.packageId)

    if (!member || !gymPackage) {
      return fail("NOT_FOUND", "Member or package not found", 404)
    }

    if (gymPackage.status !== "active") {
      return fail("PACKAGE_INACTIVE", "Package is inactive", 422)
    }

    const startDate = body.startDate ?? new Date().toISOString().slice(0, 10)
    const membership = {
      id: Math.max(...memberships.map((item) => item.id)) + 1,
      memberId: member.id,
      packageId: gymPackage.id,
      startDate,
      endDate: addDays(startDate, gymPackage.durationDays),
      status: "pending_payment" as const,
    }
    memberships.push(membership)

    member.status = "pending"
    member.currentPackageId = membership.packageId

    return created({ membership })
  }),
  http.get("/api/v1/payments", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    return ok(payments)
  }),
  http.get("/api/v1/payments/summary", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const paid = payments.filter((p) => p.status === "paid")
    const pending = payments.filter((p) => p.status === "pending")
    const revenue = paid.reduce((sum, p) => sum + p.amount, 0)

    const byMethodMap = new Map<string, { count: number; amount: number }>()
    for (const p of paid) {
      const entry = byMethodMap.get(p.paymentMethod) ?? { count: 0, amount: 0 }
      entry.count += 1
      entry.amount += p.amount
      byMethodMap.set(p.paymentMethod, entry)
    }
    const byMethod = Array.from(byMethodMap.entries()).map(
      ([paymentMethod, v]) => ({
        paymentMethod,
        count: v.count,
        amount: v.amount,
      }),
    )

    return ok({
      from: null,
      to: null,
      totalPayments: payments.length,
      paidPayments: paid.length,
      pendingPayments: pending.length,
      revenue,
      byMethod,
      byDay: [],
    })
  }),
  http.get("/api/v1/members/:id/payments", ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff", "member"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)
    return ok(payments.filter((item) => item.memberId === memberId))
  }),
  http.post("/api/v1/memberships/:id/payment", async ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const membership = memberships.find((item) => item.id === Number(params.id))

    if (!membership) {
      return fail("NOT_FOUND", "Membership not found", 404)
    }

    if (
      payments.some(
        (item) => item.membershipId === membership.id && item.status === "paid",
      )
    ) {
      return fail("DUPLICATE_PAYMENT", "Payment already exists", 409)
    }

    const member = members.find((item) => item.id === membership.memberId)
    const gymPackage = packages.find((p) => p.id === membership.packageId)
    const paymentBody = (await request.json()) as {
      amount?: number
      method?: "cash" | "transfer" | "card"
      paymentMethod?: "cash" | "transfer" | "card"
    }
    const amount = paymentBody.amount ?? gymPackage?.price ?? 0

    if (amount < (gymPackage?.price ?? 0)) {
      return fail("INSUFFICIENT_AMOUNT", "Payment amount is insufficient", 422)
    }

    membership.status = "active"

    if (member) {
      member.status = "active"
      member.currentPackageId = membership.packageId
    }

    const payment = {
      id: Math.floor(10000 + Math.random() * 90000),
      membershipId: membership.id,
      memberId: membership.memberId,
      memberName: member?.fullName ?? "Hội viên",
      packageName: gymPackage?.name ?? `Gói tập #${membership.packageId}`,
      amount,
      paymentMethod: paymentBody.method ?? paymentBody.paymentMethod ?? "cash",
      paymentDate: new Date().toISOString(),
      status: "paid" as const,
    }
    payments.unshift(payment)

    return created({
      membership,
      payment,
      status: "active",
    })
  }),
  http.post("/api/v1/memberships/:id/renew", async ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const current = memberships.find((item) => item.id === Number(params.id))

    if (!current) {
      return fail("NOT_FOUND", "Membership not found", 404)
    }

    const body = (await request.json()) as { packageId?: number; startDate?: string }
    const gymPackage = packages.find(
      (item) => item.id === (body.packageId ?? current.packageId),
    )

    if (!gymPackage) {
      return fail("NOT_FOUND", "Package not found", 404)
    }

    if (gymPackage.status !== "active") {
      return fail("PACKAGE_INACTIVE", "Package is inactive", 422)
    }

    const startDate = body.startDate ?? current.endDate
    const renewal = {
      ...current,
      id: Math.max(...memberships.map((item) => item.id)) + 1,
      packageId: body.packageId ?? current.packageId,
      startDate,
      endDate: addDays(startDate, gymPackage.durationDays),
      status: "pending_payment" as const,
    }
    memberships.push(renewal)

    const member = members.find((item) => item.id === renewal.memberId)
    if (member) {
      member.status = "pending"
      member.currentPackageId = renewal.packageId
    }

    return created(renewal)
  }),
  http.post("/api/v1/memberships/renewal-request", async ({ request }) => {
    const role = requireRole(request, ["member"])
    if (typeof role !== "string") return role
    const body = (await request.json()) as Record<string, unknown>

    return created({
      id: Math.floor(1000 + Math.random() * 9000),
      ...body,
      status: "pending",
    })
  }),
]
