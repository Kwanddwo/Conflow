"use client";
import RoleList from "@/components/RoleList";
import { trpc } from "@/server/client";

export default function MyRoles() {
  // Get data for conferenceRoles
  const { data: conferenceRoles } =
    trpc.conference.getConferenceRoles.useQuery();

  const conferences = conferenceRoles?.map((role) => ({
    id: role.conferenceId,
    title: role.conferenceTitle,
    acronym: role.conferenceAcronym,
    role: role.role,
  }));

  return <RoleList conferences={conferences || []} title={undefined} />;
}
