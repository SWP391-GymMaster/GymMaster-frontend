export const member360Routes = {
  ptMemberDetail: (id: number | string) => `/pt/members/${id}`,
  adminMemberDetail: (id: number | string) => `/admin/members/${id}`,
  staffMemberDetail: (id: number | string) => `/staff/members/${id}`,
  memberDashboard: "/member/dashboard",
} as const
