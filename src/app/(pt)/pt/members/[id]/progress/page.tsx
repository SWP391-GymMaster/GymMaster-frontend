"use client"

import { useParams } from "next/navigation"

import { PtMemberProgressWorkspace } from "@/features/member-progress-tracking/components/PtMemberProgressWorkspace"

export default function Page() {
  const params = useParams<{ id: string }>()
  const memberId = Number(params.id)

  return <PtMemberProgressWorkspace memberId={memberId} />
}
