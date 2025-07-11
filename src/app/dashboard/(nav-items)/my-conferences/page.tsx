"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import ConferenceList from "@/components/ConferenceList";
import { useSession } from "next-auth/react";

export default function AllConferences() {
  const { data: session } = useSession();

  const {
    data: conferences,
    isLoading,
    error,
  } = trpc.conference.getConferencesByMainChairId.useQuery(
    session?.user.id || ""
  );

  if (isLoading || !conferences) {
    return <LoadingSpinner />;
  }

  if (error) {
    toast.error("An unexpected error occured: " + error.message);
  }

  return (
    <div className="main-content-height bg-gradient-to-br from-background via-muted/20 to-muted/40 p-8">
      <ConferenceList
        title={"Your Conferences"}
        conferences={conferences}
        route={"/dashboard/conference"}
      />
    </div>
  );
}
