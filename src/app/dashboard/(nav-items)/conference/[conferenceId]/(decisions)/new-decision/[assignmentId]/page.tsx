"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft} from "lucide-react";
import { trpc } from "@/server/client";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SubmissionOverview } from "@/components/SubmissionOverview";
import React from "react";
import NewDecisionModal from "./NewDecisionModal";

export default function DecisionModal() {
  const { conferenceId, assignmentId } = useParams<{
      conferenceId: string;
      assignmentId: string;
    }>();
 const [open, setOpen] = React.useState(false);
    
  const assignmentQuery = trpc.decision.getDecisionAssignment.useQuery({
      conferenceId,
      assignmentId,
    });
    const { data: assignment, isPending } = useProtectedQuery(assignmentQuery);
  if (isPending) {
        return (
          <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <LoadingSpinner />
          </div>
        );
      }
  if (!assignment) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Assignment Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The decision assignment could not be found or you don&apos;t have
              permission to access it.
            </p>
            <Button asChild>
              <Link href={`/dashboard/conference/${conferenceId}/your-decisions`}>
                Back to Decisions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/conference/${conferenceId}/your-decisions`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Your Decisions
          </Link>
        </Button>
      </div>

      {/* Submission Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Submission to Review
        </h2>
        <SubmissionOverview submission={assignment?.submission as never} />
      </div>

      {/* Make Decision Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="min-w-[200px] cursor-pointer"
        >
          Make Decision
        </Button>
      </div>

      {/* Decision Modal */}
      <NewDecisionModal
        open={open}
        setOpen={setOpen}
        conferenceId={conferenceId}
        assignmentId={assignmentId}
      />
    </div>
  );
}