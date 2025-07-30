"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/server/client";
import { FileText, ThumbsDown, ThumbsUp, User } from "lucide-react";

interface ReviewListForChairProps {
  conferenceId: string;
  submissionId: string;
}

const getRecommendationBadge = (recommendation: string) => {
  switch (recommendation) {
    case "ACCEPT":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <ThumbsUp className="w-3 h-3 mr-1" />
          Accept
        </Badge>
      );
    case "REJECT":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <ThumbsDown className="w-3 h-3 mr-1" />
          Reject
        </Badge>
      );
    case "MAJOR_REVISION":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <FileText className="w-3 h-3 mr-1" />
          Major Revision
        </Badge>
      );
    case "MINOR_REVISION":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <FileText className="w-3 h-3 mr-1" />
          Minor Revision
        </Badge>
      );
    default:
      return <Badge variant="outline">{recommendation}</Badge>;
  }
};

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

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Failed to load reviews: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No reviews available for this submission yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <User className="w-5 h-5 text-primary" />
          Reviews ({reviews.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Reviews from other reviewers for this submission. This information
          helps you make informed decisions.
        </p>
      </CardHeader>
      <CardContent className="px-4">
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
                      <div className="font-medium">{review.reviewerName}</div>
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
                    {getRecommendationBadge(review.recommendation)}
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
      </CardContent>
    </Card>
  );
}
