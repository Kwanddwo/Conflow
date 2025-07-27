"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AlertCircle, FileText, Star, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ReviewFormData {
  recommendation: "REVISION" | "ACCEPTED" | "REJECTED" | "";
  overallEvaluation: string;
  overallScore: number | "";
}

interface FormErrors {
  recommendation?: string;
  overallEvaluation?: string;
  overallScore?: string;
}

export default function NewReviewPage() {
  const { conferenceId } = useParams<{ conferenceId: string }>();
  const router = useRouter();

  const [formData, setFormData] = useState<ReviewFormData>({
    recommendation: "",
    overallEvaluation: "",
    overallScore: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.recommendation) {
      newErrors.recommendation = "Please select a recommendation";
    }

    if (!formData.overallEvaluation.trim()) {
      newErrors.overallEvaluation = "Overall evaluation is required";
    } else if (formData.overallEvaluation.trim().length < 50) {
      newErrors.overallEvaluation =
        "Please provide a more detailed evaluation (at least 50 characters)";
    }

    if (
      formData.overallScore === "" ||
      formData.overallScore < 1 ||
      formData.overallScore > 10
    ) {
      newErrors.overallScore = "Please provide a score between 1 and 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement the review submission tRPC mutation
      // await submitReview.mutateAsync({
      //   assignmentId,
      //   recommendation: formData.recommendation as "REVISION" | "ACCEPTED" | "REJECTED",
      //   overallEvaluation: formData.overallEvaluation,
      //   overallScore: formData.overallScore as number,
      // });

      // Redirect to reviews list after successful submission
      router.push(`/dashboard/conference/${conferenceId}/your-reviews`);
    } catch (error) {
      console.error("Error submitting review:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 6) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    if (score >= 4) return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/conference/${conferenceId}/your-reviews`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reviews
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground text-center">
            Submit Review
          </h1>
        </div>
      </div>

      {/* Review Form */}
      <Card className="w-full border-2 border-border/60 hover:border-border transition-colors duration-300 shadow-sm">
        <CardHeader className="border-b border-border/30">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Review Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Recommendation Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="recommendation"
                  className="text-base font-semibold"
                >
                  Recommendation <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  What is your overall recommendation for this submission?
                </p>
              </div>

              <Select
                value={formData.recommendation}
                onValueChange={(value: "REVISION" | "ACCEPTED" | "REJECTED") =>
                  setFormData({ ...formData, recommendation: value })
                }
              >
                <SelectTrigger
                  className={`w-full h-12 ${
                    errors.recommendation ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select your recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPTED">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-green-500`}
                      ></div>
                      <span className="font-medium">Accept</span>
                      <span className="text-muted-foreground">
                        - Ready for publication
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="REVISION">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-yellow-500`}
                      ></div>
                      <span className="font-medium">Minor Revision</span>
                      <span className="text-muted-foreground">
                        - Needs improvements
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-red-500`}></div>
                      <span className="font-medium">Reject</span>
                      <span className="text-muted-foreground">
                        - Not suitable for publication
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.recommendation && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.recommendation}
                </p>
              )}
            </div>

            <Separator />

            {/* Overall Score Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="overallScore"
                  className="text-base font-semibold"
                >
                  Overall Score <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Rate this submission on a scale of 1-10 (1 = Poor, 10 =
                  Excellent)
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <Button
                    key={score}
                    type="button"
                    variant={
                      formData.overallScore === score ? "default" : "outline"
                    }
                    className={`h-12 text-base font-medium transition-all duration-200 ${
                      formData.overallScore === score
                        ? getScoreColor(score)
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, overallScore: score })
                    }
                  >
                    {score}
                  </Button>
                ))}
              </div>

              {formData.overallScore && (
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Selected score:{" "}
                  </span>
                  <span
                    className={`font-semibold ${
                      typeof formData.overallScore === "number"
                        ? getScoreColor(formData.overallScore)
                            .replace("bg-", "text-")
                            .replace("-50", "-700")
                            .replace(" border-", " ")
                            .replace("-200", "")
                        : ""
                    }`}
                  >
                    {formData.overallScore}/10
                  </span>
                </div>
              )}

              {errors.overallScore && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.overallScore}
                </p>
              )}
            </div>

            <Separator />

            {/* Overall Evaluation Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="overallEvaluation"
                  className="text-base font-semibold"
                >
                  Overall Evaluation <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Provide a detailed evaluation of the submission including
                  strengths, weaknesses, and suggestions for improvement.
                </p>
              </div>

              <Textarea
                id="overallEvaluation"
                placeholder="Enter your detailed evaluation here... (minimum 50 characters)"
                value={formData.overallEvaluation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overallEvaluation: e.target.value,
                  })
                }
                className={`min-h-[200px] resize-vertical ${
                  errors.overallEvaluation ? "border-destructive" : ""
                }`}
              />

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{formData.overallEvaluation.length} characters</span>
                <span
                  className={
                    formData.overallEvaluation.length >= 50
                      ? "text-green-600"
                      : ""
                  }
                >
                  Minimum: 50 characters
                </span>
              </div>

              {errors.overallEvaluation && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.overallEvaluation}
                </p>
              )}
            </div>

            <Separator />

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
