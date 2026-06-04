"use client";

import { useEffect, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useMember360Data } from "@/features/member-360/api/member-360.queries";
import { usePtActiveMemberStore } from "@/stores/usePtActiveMemberStore";

type MemberSubRouteLayoutProps = {
  children: ReactNode;
};

export default function MemberSubRouteLayout({ children }: MemberSubRouteLayoutProps) {
  const params = useParams<{ id: string }>();
  const memberId = Number(params.id);
  const isValid = Number.isFinite(memberId) && memberId > 0;

  const { data } = useMember360Data(isValid ? memberId : null);
  const { activeMember, setActiveMember } = usePtActiveMemberStore();

  useEffect(() => {
    if (data?.member) {
      if (!activeMember || activeMember.id !== data.member.id) {
        setActiveMember({
          id: data.member.id,
          memberCode: data.member.memberCode,
          fullName: data.member.fullName,
        });
      }
    }
  }, [data, activeMember, setActiveMember]);

  return <>{children}</>;
}
