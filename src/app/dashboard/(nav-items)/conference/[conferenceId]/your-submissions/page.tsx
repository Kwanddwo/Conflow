"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import SubmissionsTable from "@/components/SubmissionsTable";
import { trpc } from "@/server/client";
import { useParams } from "next/navigation";

export default function YourSubmissionsPage() {
  const params = useParams<{ conferenceId: string }>();
  const { data: submissions, isLoading } =
    trpc.submission.getConferenceSubmissionsByAuthor.useQuery({
      conferenceId: params.conferenceId,
    });

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
