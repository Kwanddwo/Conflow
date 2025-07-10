"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import ConferenceList from "@/components/ConferenceList";

export default function AllConferences() {
  const {
    data: conferences,
    isLoading,
    error,
  } = trpc.conference.getAllPendingConferences.useQuery();

  if (isLoading || !conferences) {
    return <LoadingSpinner />;
  }

  if (error) {
    toast.error("An unexpected error occured: " + error.message);
  }

  return (
    <div className="main-content-height bg-gradient-to-br from-background via-muted/20 to-muted/40 p-8">
      <ConferenceList
        conferences={conferences}
        route={"/admin/conference-requests"}
      />
    </div>
  );
}
