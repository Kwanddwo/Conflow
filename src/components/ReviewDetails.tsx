"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReviewDetailsProps {
  review: {
    recommendation: "ACCEPTED" | "REJECTED" | "REVISION";
    overallScore: number;
    overallEvaluation: string;
  };
  title?: string;
  className?: string;
}

export function ReviewDetails({
  review,
  title = "Your Review",
  className = "",
}: ReviewDetailsProps) {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "REVISION":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (score >= 6) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else if (score >= 4) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    } else {
      return "bg-red-100 text-red-800 border-red-300";
    }
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <Card className="py-2 border-2 border-border/60">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-4">
              <span className="font-medium text-foreground">
                Recommendation
              </span>
              <Badge
                variant="outline"
                className={`w-fit ${getRecommendationColor(
                  review.recommendation
                )}`}
              >
                {review.recommendation}
              </Badge>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-4">
              <span className="font-medium text-foreground">Overall Score</span>
              <Badge
                variant="outline"
                className={`w-fit ${getScoreColor(review.overallScore)}`}
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
  );
}
