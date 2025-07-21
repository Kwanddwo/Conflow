"use client";
import RoleList from "@/components/RoleList";
import { trpc } from "@/server/client";

export default function MyRecentRoles() {
  // Get data for conferenceRoles
  const { data: conferenceRoles } =
    trpc.conference.getRecentConferenceRoles.useQuery();

  const conferences = conferenceRoles?.map((role) => ({
    id: role.conferenceId,
    acronym: role.conferenceAcronym,
    title: role.conferenceTitle,
    role: role.role,
  }));

  return <RoleList title="Your Recent Roles" conferences={conferences || []} />;
}
