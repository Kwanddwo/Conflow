"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SubmissionOverview } from "@/components/SubmissionOverview";
import { ReviewDetails } from "@/components/ReviewDetails";
import { trpc } from "@/server/client";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";
import { useState } from "react";
import { toast } from "sonner";
import React from "react";
import Link from "next/link";

export default function ConflowReview() {
  const { conferenceId, reviewId } = useParams<{
    conferenceId: string;
    reviewId: string;
  }>();
  const [isEditing, setIsEditing] = useState(false);
  const [recommendation, setRecommendation] = useState<
    "ACCEPTED" | "REVISION" | "REJECTED"
  >("REVISION");
  const [overallEvaluation, setOverallEvaluation] = useState("");
  const [overallScore, setOverallScore] = useState([5]);

  const query = trpc.review.getReviewerReview.useQuery({
    reviewId,
    conferenceId,
  });
  const { data: review, isPending } = useProtectedQuery(query);

  const updateReviewMutation = trpc.review.updateReview.useMutation({
    onSuccess: () => {
      toast.success("Review updated successfully!");
      setIsEditing(false);
      query.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update review");
    },
  });

  // Initialize form with current review data
  React.useEffect(() => {
    if (review) {
      setRecommendation(
        review.recommendation as "ACCEPTED" | "REVISION" | "REJECTED"
      );
      setOverallEvaluation(review.overallEvaluation);
      setOverallScore([review.overallScore]);
    }
  }, [review]);

  const handleSave = () => {
    if (!review) return;

    updateReviewMutation.mutate({
      conferenceId,
      reviewId: review.id,
      recommendation,
      overallEvaluation,
      overallScore: overallScore[0],
    });
  };

  const handleCancel = () => {
    if (review) {
      setRecommendation(
        review.recommendation as "ACCEPTED" | "REVISION" | "REJECTED"
      );
      setOverallEvaluation(review.overallEvaluation);
      setOverallScore([review.overallScore]);
    }
    setIsEditing(false);
  };

  if (isPending || !review) {
    return <LoadingSpinner />;
  }

  return (
    <div className="main-content-height bg-background">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Your Review for Submission{" "}
            <span className="text-muted-foreground">
              {review.submission.id}
            </span>{" "}
            of {review.submission.conference.acronym}
          </h1>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href={`/dashboard/conference/${conferenceId}`}>
              Go to Conference
            </Link>
          </Button>
        </div>

        {/* Paper Details and Authors */}
        <SubmissionOverview
          submission={review.submission as never}
          className="mb-8"
        />

        {/* Review Details or Edit Form */}
        {isEditing ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Edit Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recommendation */}
              <div className="space-y-2">
                <Label htmlFor="recommendation">Recommendation</Label>
                <Select
                  value={recommendation}
                  onValueChange={(value) =>
                    setRecommendation(
                      value as "ACCEPTED" | "REVISION" | "REJECTED"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCEPTED">
                      <span className="text-green-600 font-medium">
                        ✓ Accepted
                      </span>
                    </SelectItem>
                    <SelectItem value="REVISION">
                      <span className="text-yellow-600 font-medium">
                        ⚠ Revision Required
                      </span>
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <span className="text-red-600 font-medium">
                        ✗ Rejected
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Overall Score */}
              <div className="space-y-3">
                <Label htmlFor="score">
                  Overall Score: {overallScore[0]}/10
                </Label>
                <Slider
                  value={overallScore}
                  onValueChange={setOverallScore}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Poor)</span>
                  <span>5 (Average)</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>

              {/* Overall Evaluation */}
              <div className="space-y-2">
                <Label htmlFor="evaluation">Overall Evaluation</Label>
                <Textarea
                  id="evaluation"
                  value={overallEvaluation}
                  onChange={(e) => setOverallEvaluation(e.target.value)}
                  placeholder="Provide detailed feedback on the submission..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum 50 characters required. Current:{" "}
                  {overallEvaluation.length}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateReviewMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    updateReviewMutation.isPending ||
                    overallEvaluation.length < 50
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {updateReviewMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Review Details */}
            <ReviewDetails review={review} className="mb-8" />

            {/* Edit Review Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                Edit Review
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
