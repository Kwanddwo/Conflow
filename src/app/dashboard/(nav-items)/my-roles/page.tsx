"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import RoleList from "@/components/RoleList";
import { trpc } from "@/server/client";

export default function MyRoles() {
  const { data: conferenceRoles } =
    trpc.conference.getConferenceRoles.useQuery();

  const conferences = conferenceRoles?.map((role) => ({
    id: role.conferenceId,
    title: role.conferenceTitle,
    acronym: role.conferenceAcronym,
    role: role.role,
  }));
  if(!conferences) {
    return <LoadingSpinner />;
  }
  return <RoleList conferences={conferences || []} title={undefined} />;
}
