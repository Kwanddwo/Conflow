"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/server/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, Star, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Helper function to get recommendation badge styling
const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "ACCEPTED":
      return "bg-green-100 text-green-800 border-green-300";
    case "REVISION":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

// Helper function to get score color
const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-700 bg-green-50";
  if (score >= 6) return "text-yellow-700 bg-yellow-50";
  if (score >= 4) return "text-orange-700 bg-orange-50";
  return "text-red-700 bg-red-50";
};

export default function ReviewDetailsPage() {
  const { conferenceId, assignmentId } = useParams<{
    conferenceId: string;
    assignmentId: string;
  }>();
  const router = useRouter();

  // Get the review assignment data
  const { data: assignment, isLoading } =
    trpc.review.getReviewAssignmentForChair.useQuery({
      conferenceId: conferenceId || "",
      assignmentId: assignmentId || "",
    });

  // Get the conference data for context
  const { data: conference } =
    trpc.conference.getConference.useQuery(conferenceId);

  // Get all reviews for this submission to get the specific review
  const { data: reviews } = trpc.submission.getSubmissionReviews.useQuery({
    conferenceId: conferenceId || "",
    submissionId: assignment?.submission?.id || "",
  });

  const handleBack = () => {
    router.push(`/dashboard/conference/${conferenceId}/chair-dashboard`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!assignment) {
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
              Review Assignment Not Found
            </h2>
            <p className="text-muted-foreground">
              The review assignment you&apos;re looking for doesn&apos;t exist
              or you don&apos;t have access to it.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Find the review by this reviewer for this submission
  const review = reviews?.find(
    (r) => r.reviewerEmail === assignment.reviewer.email
  );

  if (!review) {
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
              Review Not Found
            </h2>
            <p className="text-muted-foreground">
              No review has been submitted for this assignment yet.
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
                Review Details
              </h1>
              <p className="text-muted-foreground">
                {conference?.acronym} - {conference?.title}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Submission Link */}
          <Card className="border border-2 hover:border-primary transition-colors">
            <CardContent className="pt-0">
              <Link
                href={`/dashboard/conference/${conferenceId}/submissions/${assignment.submission.id}`}
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
              >
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    View Submission Details
                  </p>
                  <p className="font-medium leading-tight">
                    {assignment.submission.title}
                  </p>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </CardContent>
          </Card>

          {/* Reviewer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Reviewer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {assignment.reviewer.name}
                </p>
                <p>
                  <strong>Email:</strong> {assignment.reviewer.email}
                </p>
                <p>
                  <strong>Assigned by:</strong> {assignment.assignedBy.name}
                </p>
                <p>
                  <strong>Due Date:</strong>{" "}
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Review Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Review Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recommendation and Score */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Recommendation
                  </label>
                  <Badge
                    className={`ml-2 ${getRecommendationColor(
                      review.recommendation
                    )}`}
                  >
                    {review.recommendation === "ACCEPTED" && "✓ Accepted"}
                    {review.recommendation === "REVISION" && "⚠ Needs Revision"}
                    {review.recommendation === "REJECTED" && "✗ Rejected"}
                  </Badge>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Overall Score
                  </label>
                  <Badge
                    className={`ml-2 ${getScoreColor(
                      review.overallScore
                    )} font-mono`}
                  >
                    {review.overallScore}/10
                  </Badge>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Submitted
                  </label>
                  <div className="flex items-center gap-1 ml-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Detailed Evaluation */}
              <div>
                <label className="text-base font-semibold mb-3 block">
                  Detailed Evaluation
                </label>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {review.overallEvaluation}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
