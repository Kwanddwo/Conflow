"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SubmissionOverview } from "@/components/SubmissionOverview";
import { trpc } from "@/server/client";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";
import { AlertCircle, FileText, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

const reviewSchema = z.object({
  recommendation: z.enum(["REVISION", "ACCEPTED", "REJECTED"], {
    required_error: "Please select a recommendation",
  }),
  overallEvaluation: z
    .string()
    .min(
      50,
      "Please provide a more detailed evaluation (at least 50 characters)"
    )
    .trim(),
  overallScore: z
    .number({
      required_error: "Please provide a score between 1 and 10",
    })
    .min(1, "Score must be at least 1")
    .max(10, "Score must be at most 10"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function NewReviewPage() {
  const { conferenceId, assignmentId } = useParams<{
    conferenceId: string;
    assignmentId: string;
  }>();
  const router = useRouter();

  // Fetch all assignments and find the specific one
  const assignmentQuery = trpc.review.getReviewAssignment.useQuery({
    conferenceId,
    assignmentId,
  });
  const { data: assignment, isPending } = useProtectedQuery(assignmentQuery);

  // Initialize react-hook-form
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      recommendation: undefined,
      overallEvaluation: "",
      overallScore: undefined,
    },
  });

  // Review submission mutation
  const submitReviewMutation = trpc.review.submitReview.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/conference/${conferenceId}/your-reviews`);
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      // You can add toast notification here
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    submitReviewMutation.mutate({
      conferenceId,
      assignmentId,
      recommendation: data.recommendation,
      overallEvaluation: data.overallEvaluation,
      overallScore: data.overallScore,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 6) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    if (score >= 4) return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  // Show loading spinner while fetching assignment data
  if (isPending) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error if assignment not found
  if (!assignment) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Assignment Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The review assignment could not be found or you don&apos;t have
              permission to access it.
            </p>
            <Button asChild>
              <Link href={`/dashboard/conference/${conferenceId}/your-reviews`}>
                Back to Reviews
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
          <Link href={`/dashboard/conference/${conferenceId}/your-reviews`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reviews
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

      {/* Review Form */}
      <Card className="w-full border-2 border-border/60 hover:border-border transition-colors duration-300 shadow-sm">
        <CardHeader className="border-b border-border/30">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Review Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Recommendation Section */}
              <FormField
                control={form.control}
                name="recommendation"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-base font-semibold">
                      Recommendation <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormDescription>
                      What is your overall recommendation for this submission?
                    </FormDescription>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Select your recommendation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACCEPTED">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="font-medium">Accept</span>
                              <span className="text-muted-foreground">
                                - Ready for publication
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="REVISION">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span className="font-medium">
                                Minor Revision
                              </span>
                              <span className="text-muted-foreground">
                                - Needs improvements
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="REJECTED">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="font-medium">Reject</span>
                              <span className="text-muted-foreground">
                                - Not suitable for publication
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Overall Score Section */}
              <FormField
                control={form.control}
                name="overallScore"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-base font-semibold">
                      Overall Score <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormDescription>
                      Rate this submission on a scale of 1-10 (1 = Poor, 10 =
                      Excellent)
                    </FormDescription>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <Button
                            key={score}
                            type="button"
                            variant={
                              field.value === score ? "default" : "outline"
                            }
                            className={`h-12 text-base font-medium transition-all duration-200 ${
                              field.value === score
                                ? getScoreColor(score)
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => field.onChange(score)}
                          >
                            {score}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    {field.value && (
                      <div className="text-center">
                        <span className="text-sm text-muted-foreground">
                          Selected score:{" "}
                        </span>
                        <span
                          className={`font-semibold ${getScoreColor(field.value)
                            .replace("bg-", "text-")
                            .replace("-50", "-700")
                            .replace(" border-", " ")
                            .replace("-200", "")}`}
                        >
                          {field.value}/10
                        </span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Overall Evaluation Section */}
              <FormField
                control={form.control}
                name="overallEvaluation"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-base font-semibold">
                      Overall Evaluation{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormDescription>
                      Provide a detailed evaluation of the submission including
                      strengths, weaknesses, and suggestions for improvement.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your detailed evaluation here... (minimum 50 characters)"
                        className="min-h-[200px] resize-vertical"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{field.value?.length || 0} characters</span>
                      <span
                        className={
                          (field.value?.length || 0) >= 50
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Minimum: 50 characters
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitReviewMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  {submitReviewMutation.isPending ? (
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
