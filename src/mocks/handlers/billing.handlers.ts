import { http } from "msw"

import { members, memberships, packages, payments } from "@/mocks/data/gymmaster.mock-data"
import { created, fail, ok, requireRole } from "@/mocks/utils/api-response"

export const billingHandlers = [
  http.get("/api/memberships", ({ request }) => {
    const role = requireRole(request, ["admin", "staff", "pt", "member"])
    if (typeof role !== "string") return role

    return ok(memberships)
  }),
  http.get("/api/packages", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    return ok(packages)
  }),
  http.post("/api/packages", async ({ request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as Partial<(typeof packages)[number]>
    const gymPackage = {
      id: Math.max(...packages.map((item) => item.id)) + 1,
      name: body.name ?? "New Package",
      durationDays: body.durationDays ?? 30,
      price: body.price ?? 0,
      status: "active" as const,
    }
    packages.push(gymPackage)

    return created(gymPackage)
  }),
  http.put("/api/packages/:id", async ({ params, request }) => {
    const role = requireRole(request, ["admin"])
    if (typeof role !== "string") return role

    const index = packages.findIndex((item) => item.id === Number(params.id))

    if (index < 0) {
      return fail("NOT_FOUND", "Package not found", 404)
    }

    const body = (await request.json()) as Partial<(typeof packages)[number]>
    packages[index] = { ...packages[index], ...body }

    return ok(packages[index])
  }),
  http.post("/api/memberships/sell", async ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const body = (await request.json()) as {
      memberId?: number
      packageId?: number
      startDate?: string
    }
    const membership = {
      id: Math.max(...memberships.map((item) => item.id)) + 1,
      memberId: body.memberId ?? 101,
      packageId: body.packageId ?? 1,
      startDate: body.startDate ?? "2026-06-01",
      endDate: "2026-06-30",
      status: "PendingPayment" as const,
    }
    memberships.push(membership)

    const member = members.find((item) => item.id === membership.memberId)
    if (member) {
      member.status = "pending"
      member.currentPackageId = membership.packageId
    }

    return created({ membership })
  }),
  http.get("/api/payments", ({ request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    return ok(payments)
  }),
  http.get("/api/members/:id/payments", ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff", "member"])
    if (typeof role !== "string") return role

    const memberId = Number(params.id)
    return ok(payments.filter((item) => item.memberId === memberId))
  }),
  http.post("/api/memberships/:id/payment", async ({ params, request }) => {
    const role = requireRole(request, ["admin", "staff"])
    if (typeof role !== "string") return role

    const membership = memberships.find((item) => item.id === Number(params.id))

    if (!membership) {
      return fail("NOT_FOUND", "Membership not found", 404)
    }

    membership.status = "Active"
    const member = members.find((item) => item.id === membership.memberId)
    if (member) {
      member.status = "active"
      member.currentPackageId = membership.packageId
    }
    
    const gymPackage = packages.find((p) => p.id === membership.packageId)
    const paymentBody = (await request.json()) as { amount?: number; paymentMethod?: string }

    const payment = {
      id: Math.floor(10000 + Math.random() * 90000),
      membershipId: membership.id,
      memberId: membership.memberId,
      memberName: member?.fullName ?? "Hội viên",
      packageName: gymPackage?.name ?? `Gói tập #${membership.packageId}`,
      amount: paymentBody.amount ?? gymPackage?.price ?? 0,
      paymentMethod: paymentBody.paymentMethod ?? "Tiền mặt",
      paymentDate: new Date().toISOString(),
      status: "paid" as const,
    }
    payments.unshift(payment)

    return created({
      membership,
      payment,
      status: "Active",
    })
  }),
  http.post("/api/memberships/:id/renew", async ({ params, request }) => {
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
    const startDate = body.startDate ?? current.endDate
    const endDate = new Date(`${startDate}T00:00:00.000Z`)
    endDate.setUTCDate(endDate.getUTCDate() + (gymPackage?.durationDays ?? 30))
    const renewal = {
      ...current,
      id: Math.max(...memberships.map((item) => item.id)) + 1,
      packageId: body.packageId ?? current.packageId,
      startDate,
      endDate: endDate.toISOString().slice(0, 10),
      status: "PendingPayment" as const,
    }
    memberships.push(renewal)

    const member = members.find((item) => item.id === renewal.memberId)
    if (member) {
      member.status = "pending"
      member.currentPackageId = renewal.packageId
    }

    return created(renewal)
  }),
  http.post("/api/memberships/renewal-request", async ({ request }) => {
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
