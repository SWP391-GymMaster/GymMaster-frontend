// Giờ Hà Nội (GMT+7, Indochina Time) — nguồn sự thật DUY NHẤT cho mọi tính toán
// "ngày/hôm nay" và hiển thị ngày giờ ở frontend. Gym 1 chi nhánh tại Việt Nam nên
// KHÔNG phụ thuộc múi giờ trình duyệt (tránh lệch 1 ngày vào rạng sáng khi UTC vẫn là
// hôm trước). Khớp với AppClock của backend (UtcNow + 7h).
//
// Lưu ý: IANA không có id "Asia/Hanoi"; cả Việt Nam dùng chung GMT+7. Ở đây ta dùng
// trực tiếp offset +7 (dịch thời điểm rồi format theo UTC) nên không cần tên thành phố.
const HANOI_OFFSET_MS = 7 * 60 * 60 * 1000

function toMs(input?: Date | string | number | null): number {
  if (input === undefined || input === null) return Date.now()
  return new Date(input).getTime()
}

// Ngày lịch (YYYY-MM-DD) theo giờ Hà Nội của một thời điểm (mặc định: bây giờ).
export function vnDateIso(input?: Date | string | number | null): string {
  const ms = toMs(input)
  if (Number.isNaN(ms)) return ""
  // Dịch +7h rồi đọc theo UTC -> ra đúng ngày lịch Hà Nội bất kể múi giờ máy.
  const shifted = new Date(ms + HANOI_OFFSET_MS)
  const year = shifted.getUTCFullYear()
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0")
  const day = String(shifted.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Hôm nay (YYYY-MM-DD) theo giờ Hà Nội.
export function vnTodayIso(): string {
  return vnDateIso()
}

// Format theo giờ Hà Nội: dịch thời điểm +7h rồi format theo UTC (không lệ thuộc
// múi giờ trình duyệt, không cần id thành phố).
function formatHanoi(
  input: Date | string | number | null | undefined,
  kind: "date" | "time" | "datetime",
  options?: Intl.DateTimeFormatOptions,
): string {
  const ms = toMs(input)
  if (Number.isNaN(ms)) return ""
  const shifted = new Date(ms + HANOI_OFFSET_MS)
  const opts: Intl.DateTimeFormatOptions = { timeZone: "UTC", ...options }
  if (kind === "date") return shifted.toLocaleDateString("vi-VN", opts)
  if (kind === "time") return shifted.toLocaleTimeString("vi-VN", opts)
  return shifted.toLocaleString("vi-VN", opts)
}

// Hiển thị NGÀY theo giờ Hà Nội.
export function formatVnDate(
  input: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatHanoi(input, "date", options)
}

// Hiển thị GIỜ theo giờ Hà Nội.
export function formatVnTime(
  input: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatHanoi(input, "time", options)
}

// Hiển thị NGÀY + GIỜ theo giờ Hà Nội.
export function formatVnDateTime(
  input: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatHanoi(input, "datetime", options)
}
