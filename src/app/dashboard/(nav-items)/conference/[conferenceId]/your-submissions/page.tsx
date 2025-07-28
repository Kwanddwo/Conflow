"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import SubmissionsTable from "@/components/SubmissionsTable";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";
import { trpc } from "@/server/client";
import { useParams } from "next/navigation";

export default function YourSubmissionsPage() {
  const params = useParams<{ conferenceId: string }>();
  const query=
    trpc.submission.getConferenceSubmissionsByAuthor.useQuery({
      conferenceId: params.conferenceId,
    });
  const { data: submissions, isLoading } = useProtectedQuery(query);
  return isLoading ? (
    <LoadingSpinner />
  ) : (
    <div className="main-content-height flex items-center justify-center p-4 bg-muted/50">
      <SubmissionsTable
        submissions={submissions}
        conferenceId={params.conferenceId}
      />
    </div>
  );
}
