import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import { NewReviewAssignmentForm } from "./NewReviewAssignmentForm";
import { NewDecisionAssignmentForm } from "./NewDecisionAssignment";

interface Submission {
  id: string;
  title: string;
  paper: string;
  area: string;
  keywords: string;
  abstract: string;
  submitted: string;
  status?: "Reviewed" | null;
  assignmentId?: string; // For reviewer assignments
  dueDate?: string; // Add due date field
}

interface Assignment {
  reviewer: string;
  submissions: Submission[];
}
interface SubmissionAssignmentProps {
  isReviewAssignment: boolean;
  conferenceId: string;
  availableSubmissions: {
    id: string;
    title: string;
  }[];
}
function SubmissionAssignment({ isReviewAssignment,conferenceId, availableSubmissions }: SubmissionAssignmentProps) {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const { data: reviewAssignmentsData, refetch: refetchReviewAssignments } =
    trpc.review.getReviewAssignments.useQuery({
      conferenceId: conferenceId || "",
    });
  const { data: decisionAssignmentsData, refetch: refetchDecisionAssignments } =
    trpc.decision.getDecisionAssignments.useQuery({
      conferenceId: conferenceId || "",
    });
  const createReviewAssignmentMutation =
    trpc.review.createReviewAssignment.useMutation({
      onSuccess: () => {
        toast.success("Review assignment created successfully");
        refetchReviewAssignments();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create review assignment");
      },
    });
  const createDecisionAssignmentMutation =
    trpc.decision.createDecisionAssignment.useMutation({
      onSuccess: () => {
        toast.success("Decision assignment created successfully");
        refetchDecisionAssignments();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create decision assignment");
      },
    });
  const deleteDecisionAssignmentMutation =
    trpc.decision.deleteDecisionAssignment.useMutation({
      onSuccess: () => {
        toast.success("Decision assignment deleted successfully");
        refetchDecisionAssignments();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete decision assignment");
      },
    });
  const deleteReviewAssignmentMutation =
    trpc.review.deleteReviewAssignment.useMutation({
      onSuccess: () => {
        toast.success("Review assignment deleted successfully");
        refetchReviewAssignments();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete review assignment");
      },
    });
    const reviewerAssignments = React.useMemo(() => {
        if (!reviewAssignmentsData) return [];
    
        const grouped = reviewAssignmentsData.reduce((acc, assignment) => {
          const reviewerName = assignment.reviewerName;
          if (!acc[reviewerName]) {
            acc[reviewerName] = {
              reviewer: reviewerName,
              submissions: [],
            };
          }
    
          // Convert assignment to submission format expected by UI
          acc[reviewerName].submissions.push({
            id: assignment.submissionId,
            title: assignment.submissionTitle,
            paper: "", // This will be handled differently
            area: `${assignment.submissionPrimaryArea} → ${assignment.submissionSecondaryArea}`,
            keywords: "", // This will be handled differently
            abstract: "", // This will be handled differently
            submitted: new Date(assignment.createdAt).toLocaleDateString(),
            status: null, // This will be handled differently
            assignmentId: assignment.id, // Add this for deletion
            dueDate: new Date(assignment.dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          });
    
          return acc;
        }, {} as Record<string, Assignment>);
    
        return Object.values(grouped);
      }, [reviewAssignmentsData]);
    
      const decisionAssignments = React.useMemo(() => {
        if (!decisionAssignmentsData) return [];
    
        const grouped = decisionAssignmentsData.reduce((acc, assignment) => {
          const reviewerName = assignment.chairName;
          if (!acc[reviewerName]) {
            acc[reviewerName] = {
              reviewer: reviewerName,
              submissions: [],
            };
          }
    
          acc[reviewerName].submissions.push({
            id: assignment.submissionId,
            title: assignment.submissionTitle,
            paper: "", // This will be handled differently
            area: `${assignment.submissionPrimaryArea} → ${assignment.submissionSecondaryArea}`,
            keywords: "", // This will be handled differently
            abstract: "", // This will be handled differently
            submitted: new Date(assignment.createdAt).toLocaleDateString(),
            status: null, // This will be handled differently
            assignmentId: assignment.id, // Add this for deletion
            dueDate: new Date(assignment.dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          });
    
          return acc;
        }, {} as Record<string, Assignment>);
    
        return Object.values(grouped);
      }, [decisionAssignmentsData]);
    const removeChairSubmission = (assignmentId: string) => {
      if (assignmentId) {
        deleteDecisionAssignmentMutation.mutate({
          assignmentId,
          conferenceId: conferenceId || "",
        });
      }
    };

    const removeReviewerSubmission = (
      reviewerName: string,
      submissionId: string,
      assignmentId?: string
    ) => {
      if (assignmentId) {
        deleteReviewAssignmentMutation.mutate({
          assignmentId,
          conferenceId: conferenceId || "",
        });
      }
    };
    useEffect(() => {
      if (isReviewAssignment) {
        setAssignments(reviewerAssignments);
      } else {
        setAssignments(decisionAssignments);
      }
    }
    , [decisionAssignments, isReviewAssignment, reviewerAssignments]);

  return (
    <>
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {isReviewAssignment ? "Reviewer" : "Decision"} - Submissions Assignments
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New Assignment
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isReviewAssignment ? "New Review Assignment" : "New Decision Assignment"}</DialogTitle>
              </DialogHeader>
              {isReviewAssignment ? (
                <NewReviewAssignmentForm
                  conferenceId={conferenceId || ""}
                  submissions={availableSubmissions}
                  onCreateAssignment={createReviewAssignmentMutation.mutate}
                  isCreating={createReviewAssignmentMutation.isPending}
                />
              ) : (
                <NewDecisionAssignmentForm
                  conferenceId={conferenceId || ""}
                  submissions={availableSubmissions}
                  onCreateAssignment={createDecisionAssignmentMutation.mutate}
                  isCreating={createDecisionAssignmentMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">
                  {isReviewAssignment ? "Reviewer" : "Chair"}
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Assigned Submissions
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Due Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell className="text-foreground align-top">
                    {assignment.reviewer}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {assignment.submissions.map((submission, subIndex) => (
                        <div
                          key={subIndex}
                          className="flex items-center space-x-2"
                        >
                          <span className="text-foreground text-sm">
                            {submission.title} (
                            <span className="text-muted-foreground">
                              {submission.id}
                            </span>
                            )
                          </span>
                          <X
                            className="h-4 w-4 text-destructive cursor-pointer hover:text-destructive/80"
                            onClick={() =>
                                isReviewAssignment
                                    ? removeReviewerSubmission(
                                        assignment.reviewer,
                                        submission.id,
                                        submission.assignmentId
                                    )
                                    : removeChairSubmission(
                                        submission.assignmentId ? submission.assignmentId : ""
                                    )
                            }   
                          />
                          {submission.status && (
                            <Badge className="bg-status-success text-status-success-foreground hover:bg-status-success/80">
                              {submission.status}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {assignment.submissions.map((submission, subIndex) => {
                        const dueDate = submission.dueDate;
                        const isOverdue =
                          dueDate && new Date(dueDate) < new Date();
                        const isUrgent =
                          dueDate &&
                          new Date(dueDate) <=
                            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                        return (
                          <div
                            key={subIndex}
                            className="flex items-center space-x-2"
                          >
                            <span
                              className={`text-sm ${
                                isOverdue
                                  ? "text-destructive font-medium"
                                  : isUrgent
                                  ? "text-orange-500 font-medium"
                                  : "text-foreground"
                              }`}
                            >
                              {dueDate || "No due date set"}
                            </span>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                            {isUrgent && !isOverdue && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-orange-100 text-orange-800"
                              >
                                Due Soon
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default SubmissionAssignment;
