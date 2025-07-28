"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/server/client";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";

export default function ConflowReview() {
  const { conferenceId, reviewId } = useParams<{
    conferenceId: string;
    reviewId: string;
  }>();
  const query = trpc.review.getReviewerReview.useQuery({
    conferenceId,
    reviewId,
  });
  const { data: review, isPending } = useProtectedQuery(query);
  if (isPending || !review) {
    return <LoadingSpinner />;
  }
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Your Review for Submission{" "}
            <span className="text-muted-foreground">
              {review.submission.id}
            </span>{" "}
            of CONF2024
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

        {/* Paper Details */}
        <Card className="mb-8 border-2 border-border/60">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-foreground">Title</span>
                <span className="text-foreground">
                  {review.submission.title}
                </span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-foreground">Paper</span>
                <div>
                  <Link
                    href={review.submission.paperFilePath || ""}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {review.submission.paperFileName}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-foreground">Area/Track</span>
                <span className="text-foreground">
                  {review.submission.primaryArea} /{" "}
                  {review.submission.secondaryArea}
                </span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-foreground">Keywords</span>
                <span className="text-foreground">
                  {Array.isArray(review.submission.keywords)
                    ? review.submission.keywords.join(", ")
                    : typeof review.submission.keywords === "string"
                    ? review.submission.keywords
                    : ""}
                </span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-foreground">Abstract</span>
                <p className="text-foreground leading-relaxed">
                  {review.submission.abstract}
                </p>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-foreground">Submitted</span>
                <span className="text-foreground">
                  {new Date(review.submission.createdAt)
                    .toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    .replace(",", ",")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authors Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Authors
          </h2>
          <Card className="py-0 border-2 border-border/60">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-medium text-foreground">
                        First Name
                      </th>
                      <th className="text-left p-4 font-medium text-foreground">
                        Last Name
                      </th>
                      <th className="text-left p-4 font-medium text-foreground">
                        Email
                      </th>
                      <th className="text-left p-4 font-medium text-foreground">
                        Country
                      </th>
                      <th className="text-left p-4 font-medium text-foreground">
                        Affiliation
                      </th>
                      <th className="text-left p-4 font-medium text-foreground">
                        Corresponding?
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {review.submission.submissionAuthors.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No authors found
                        </td>
                      </tr>
                    ) : (
                      review.submission.submissionAuthors.map(
                        (author, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4 text-foreground">
                              {author.firstName}
                            </td>
                            <td className="p-4 text-foreground">
                              {author.lastName}
                            </td>
                            <td className="p-4 text-foreground">
                              {author.email}
                            </td>
                            <td className="p-4 text-foreground">
                              {author.country}
                            </td>
                            <td className="p-4 text-foreground">
                              {author.affiliation}
                            </td>
                            <td className="p-4 text-foreground">
                              {author.isCorresponding ? "Yes" : "No"}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Your Review
          </h2>
          <Card className="py-2 border-2 border-border/60">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <span className="font-medium text-foreground">
                    Recommendation
                  </span>
                  <Badge
                    variant="outline"
                    className={`w-fit ${
                      review.recommendation === "ACCEPTED"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : review.recommendation === "REJECTED"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }`}
                  >
                    {review.recommendation}
                  </Badge>
                </div>

                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <span className="font-medium text-foreground">
                    Overall Score
                  </span>
                  <Badge
                    variant="outline"
                    className={`w-fit ${
                      review.overallScore >= 8
                        ? "bg-green-100 text-green-800 border-green-300"
                        : review.overallScore >= 6
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : review.overallScore >= 4
                        ? "bg-orange-100 text-orange-800 border-orange-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    }`}
                  >
                    {review.overallScore}/10
                  </Badge>
                </div>

                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <span className="font-medium text-foreground">
                    Overall Evaluation
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {review.overallEvaluation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Review Button */}
        <div className="flex justify-end">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
            Edit Review
          </Button>
        </div>
      </main>
    </div>
  );
}
