"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/server/client";
import { FileText, ThumbsDown, ThumbsUp } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import RecommendationBadge from "./RecommendationBadge";

interface ReviewListForChairProps {
  conferenceId: string;
  submissionId: string;
}

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReviewListForChair({
  conferenceId,
  submissionId,
}: ReviewListForChairProps) {
  const {
    data: reviews,
    isLoading,
    error,
  } = trpc.submission.getSubmissionReviews.useQuery({
    conferenceId,
    submissionId,
  });

  return (
    <>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Reviews{reviews && reviews.length ? ` (${reviews.length})` : ""}
      </h2>
      <Card className="border-border">
        <CardContent className="px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          )}
          {/* Error State */}
          {error && (
            <p className="text-muted-foreground text-center py-4">
              Failed to load reviews: {error.message}
            </p>
          )}
          {/* Empty State */}
          {!isLoading && !error && (!reviews || reviews.length === 0) && (
            <p className="text-muted-foreground text-center py-4">
              No reviews available for this submission yet.
            </p>
          )}
          {/* Main Table */}
          {!isLoading && !error && reviews && reviews.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground font-medium">
                      Reviewer
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Score
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Recommendation
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Comments
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id} className="border-border">
                      <TableCell className="text-foreground">
                        <div>
                          <div className="font-medium">
                            {review.reviewerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {review.reviewerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground ml-1">
                            {review.overallScore} / 10
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RecommendationBadge
                          recommendation={review.recommendation}
                        />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-foreground">
                          {review.overallEvaluation ? (
                            <div className="whitespace-pre-wrap break-words max-w-prose-3">
                              {review.overallEvaluation}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              No detailed comments provided
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(review.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
