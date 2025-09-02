"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/server/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SubmissionOverview } from "@/components/SubmissionOverview";

export default function SubmissionDetailsPage() {
  const { conferenceId, submissionId } = useParams<{
    conferenceId: string;
    submissionId: string;
  }>();
  const router = useRouter();

  // Get the submission data
  const { data: submissions, isLoading } =
    trpc.submission.getSubmissionsByConferenceId.useQuery({
      conferenceId: conferenceId || "",
    });

  // Get the conference data for context
  const { data: conference } =
    trpc.conference.getConference.useQuery(conferenceId);

  // Find the specific submission
  const submission = submissions?.find((sub) => sub.id === submissionId);

  const handleBack = () => {
    router.push(`/dashboard/conference/${conferenceId}/chair-dashboard`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!submission) {
    return (
      <div className="main-content-height bg-background">
        <main className="px-6 py-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chair Dashboard
            </Button>
          </div>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Submission Not Found
            </h2>
            <p className="text-muted-foreground">
              The submission you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="main-content-height bg-background">
      <main className="px-6 py-6">
        {/* Header with back button */}
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chair Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Submission Details
              </h1>
              <p className="text-muted-foreground">
                {conference?.acronym} - {conference?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Submission content */}
        <div className="max-w-4xl">
          <SubmissionOverview
            submission={submission}
            isTitle={true}
            authorsTitle="Authors"
          />
        </div>
      </main>
    </div>
  );
}
