import type { QueryClient } from "@tanstack/react-query"

// Cung mot du lieu (membership / payment / member) duoc hien o nhieu "kho cache"
// khac nhau: billing (trang Thanh toan/Hop dong), member-360 (the goi cua member),
// member-management (danh sach hoi vien), staff-front-desk (wizard ban/gia han).
// Mot mutation thanh toan/ban/gia han/huy/check-in phai lam moi TAT CA de khong bi
// stale o man khac (truoc day phai F5 moi thay).
const SHARED_ENTITY_ROOTS: ReadonlyArray<ReadonlyArray<string>> = [
  ["billing"],
  ["member-360"],
  ["member-management"],
  ["staff-front-desk"],
]

export function invalidateMembershipEntities(queryClient: QueryClient) {
  return Promise.all(
    SHARED_ENTITY_ROOTS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey: [...queryKey] }),
    ),
  )
}
