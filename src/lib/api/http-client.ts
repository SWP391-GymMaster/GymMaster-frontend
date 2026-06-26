import type { ApiError, ApiResponse } from "@/types/auth"

export class ApiClientError extends Error {
  code: string
  requestId?: string
  status?: number

  constructor(error: ApiError, status?: number) {
    super(error.message)
    this.name = "ApiClientError"
    this.code = error.code
    this.requestId = error.requestId
    this.status = status
  }
}

const fallbackError: ApiError = {
  code: "NETWORK_ERROR",
  message: "Không thể kết nối dịch vụ GymMaster. Vui lòng thử lại.",
}

const emptyProtectedResponseErrors: Partial<Record<number, ApiError>> = {
  401: {
    code: "UNAUTHORIZED",
    message: "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.",
  },
  403: {
    code: "FORBIDDEN",
    message: "Bạn không có quyền truy cập khu vực này.",
  },
}

// --- Auto-refresh access token on 401 -------------------------------------
// Access token song 15 phut; neu het han giua chung, request se 401.
// Dang ky 1 ham refresh (tu auth-session, tranh circular import) de thu lam moi
// token va retry 1 lan truoc khi bao loi cho nguoi dung.
type TokenRefresher = () => Promise<string | null>

let tokenRefresher: TokenRefresher | null = null
let refreshInFlight: Promise<string | null> | null = null

export function registerTokenRefresher(refresher: TokenRefresher | null) {
  tokenRefresher = refresher
}

// Gom nhieu request 401 cung luc vao 1 lan refresh (tranh thundering herd).
function refreshAccessToken(): Promise<string | null> {
  if (!tokenRefresher) {
    return Promise.resolve(null)
  }

  if (!refreshInFlight) {
    refreshInFlight = tokenRefresher().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}

function readAuthHeader(headers: HeadersInit | undefined): string | null {
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) {
    return null
  }

  const record = headers as Record<string, string>
  return record.Authorization ?? record.authorization ?? null
}

// Endpoint auth (login/refresh) khong duoc retry-refresh de tranh vong lap.
function isAuthFlowPath(path: string) {
  return path.includes("/auth/refresh") || path.includes("/auth/login")
}

export function normalizeApiPath(path: string) {
  if (!path.startsWith("/api") || path.startsWith("/api/v1")) {
    return path
  }

  const nextChar = path.at(4)
  if (nextChar === undefined || nextChar === "/" || nextChar === "?") {
    return `/api/v1${path.slice(4)}`
  }

  return path
}

function getApiUrl(path: string) {
  if (
    process.env.NEXT_PUBLIC_API_MOCKING === "enabled" ||
    process.env.NODE_ENV === "test"
  ) {
    return path
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5042"

  return `${baseUrl}${normalizeApiPath(path)}`
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  let payload: ApiResponse<T>

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    const protectedError = emptyProtectedResponseErrors[response.status]

    if (protectedError) {
      throw new ApiClientError(protectedError, response.status)
    }

    throw new ApiClientError(
      {
        code: "INVALID_RESPONSE",
        message: "GymMaster trả về phản hồi không hợp lệ.",
      },
      response.status,
    )
  }

  if (!response.ok || !payload.success || payload.error) {
    throw new ApiClientError(
      payload.error ?? {
        code: "REQUEST_FAILED",
        message: "GymMaster không thể hoàn tất yêu cầu này.",
      },
      response.status,
    )
  }

  if (payload.data === null) {
    throw new ApiClientError(
      {
        code: "EMPTY_RESPONSE",
        message: "GymMaster trả về phản hồi rỗng.",
      },
      response.status,
    )
  }

  return payload.data
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  options?: { retried?: boolean },
): Promise<T> {
  try {
    // FormData (vd upload anh scan) phai de trinh duyet tu set
    // "multipart/form-data; boundary=...". Neu ep "application/json" o day,
    // server tra 415 Unsupported Media Type.
    const isFormData =
      typeof FormData !== "undefined" && init?.body instanceof FormData
    const response = await fetch(getApiUrl(path), {
      ...init,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...init?.headers,
      },
    })

    // Token het han giua chung -> thu lam moi 1 lan roi retry (chi cho request da
    // xac thuc, khong ap dung cho chinh endpoint login/refresh).
    const authHeader = readAuthHeader(init?.headers)
    if (
      response.status === 401 &&
      !options?.retried &&
      authHeader &&
      tokenRefresher &&
      !isAuthFlowPath(path)
    ) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        return apiRequest<T>(
          path,
          {
            ...init,
            headers: {
              ...init?.headers,
              Authorization: `Bearer ${newToken}`,
            },
          },
          { retried: true },
        )
      }
    }

    return parseApiResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    throw new ApiClientError(fallbackError)
  }
}
