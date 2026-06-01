import { HttpResponse } from "msw"
import type { DefaultBodyType } from "msw"

import type { ApiResponse, UserRole } from "@/types/auth"

type ApiResponseInit = {
  status?: number
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export function ok<T>(data: T, init?: ApiResponseInit) {
  return HttpResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      error: null,
      meta: null,
    },
    { status: init?.status ?? 200 },
  )
}

export function created<T>(data: T) {
  return ok(data, { status: 201 })
}

export function noContent() {
  return new HttpResponse(null, { status: 204 })
}

export function fail(
  code: string,
  message: string,
  status = 400,
// MSW infers each resolver's response body from all branches. These helpers
// intentionally return a loose body type so success/error branches can share
// one resolver while still preserving the actual JSON wrapper shape.
): HttpResponse<DefaultBodyType> {
  return HttpResponse.json<ApiResponse<null>>(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
        requestId: "mock-request",
      },
      meta: null,
    },
    { status },
  )
}

export function paged<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize

  return ok<PagedResult<T>>({
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
  })
}

export function getRoleFromRequest(request: Request): UserRole | null {
  const header = request.headers.get("Authorization")
  const tokenRole = header?.match(/^Bearer access-(admin|staff|pt|member)$/)?.[1]

  return (tokenRole as UserRole | undefined) ?? null
}

export function requireAuth(request: Request): UserRole | HttpResponse<DefaultBodyType> {
  const role = getRoleFromRequest(request)

  return role ?? fail("UNAUTHORIZED", "Unauthorized", 401)
}

export function requireRole(
  request: Request,
  allowedRoles: UserRole[],
): UserRole | HttpResponse<DefaultBodyType> {
  const role = getRoleFromRequest(request)

  if (!role) {
    return fail("UNAUTHORIZED", "Unauthorized", 401)
  }

  if (!allowedRoles.includes(role)) {
    return fail("FORBIDDEN", "Forbidden", 403)
  }

  return role
}

export function getPage(url: string) {
  const page = Number(new URL(url).searchParams.get("page") ?? "1")

  return Number.isFinite(page) && page > 0 ? page : 1
}
