"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import React from "react";
import NewParticipant from "./NewParticipantDialog";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/server/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getName } from "country-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";
import { Button } from "@/components/ui/button";

// New Review Assignment Form Component
function NewReviewAssignmentForm({
  conferenceId,
  submissions,
  onCreateAssignment,
  isCreating,
}: {
  conferenceId: string;
  submissions: {
    id: string;
    title: string;
  }[];
  onCreateAssignment: (data: {
    submissionId: string;
    reviewerId: string;
    dueDate: Date;
    conferenceId: string;
  }) => void;
  isCreating: boolean;
}) {
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState("");
  // Set default due date to 30 days from now
  const [dueDate, setDueDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split("T")[0];
  });

  const { data: invitees } = trpc.conference.getConferenceInvitees.useQuery({
    conferenceId,
  });

  // Get reviewers (people with reviewer role)
  const reviewers =
    invitees?.filter((invite) => invite.role === "REVIEWER") || [];

  const handleSubmit = () => {
    if (!selectedReviewer || !selectedSubmission || !dueDate) {
      toast.error("Please select a reviewer, submission, and due date");
      return;
    }

    onCreateAssignment({
      submissionId: selectedSubmission,
      reviewerId: selectedReviewer,
      dueDate: new Date(dueDate),
      conferenceId,
    });

    // Reset form
    setSelectedReviewer("");
    setSelectedSubmission("");
    // Reset to default date (30 days from now)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setDueDate(defaultDate.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Select Reviewer
        </label>
        <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a reviewer..." />
          </SelectTrigger>
          <SelectContent>
            {reviewers.map((reviewer) => (
              <SelectItem key={reviewer.user.id} value={reviewer.user.id}>
                {reviewer.user.firstName} {reviewer.user.lastName} (
                {reviewer.user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Select Submission
        </label>
        <Select
          value={selectedSubmission}
          onValueChange={setSelectedSubmission}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a submission..." />
          </SelectTrigger>
          <SelectContent>
            {submissions.map((submission) => (
              <SelectItem key={submission.id} value={submission.id}>
                <span className="text-muted-foreground">{submission.id}</span> -{" "}
                {submission.title.length > 50
                  ? `${submission.title.substring(0, 50)}...`
                  : submission.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="dueDate"
          className="text-sm font-medium text-foreground mb-2 block"
        >
          Due Date
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          className="w-sm"
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={handleSubmit}
          disabled={
            isCreating || !selectedReviewer || !selectedSubmission || !dueDate
          }
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Creating..." : "Create Assignment"}
        </button>
      </div>
    </div>
  );
}
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

interface Participant {
  role: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  affiliation: string;
  isCorresponding?: boolean;
}
export default function ConferenceDashboard() {
  const { conferenceId } = useParams<{ conferenceId: string }>();

  const { data: conference } =
    trpc.conference.getConference.useQuery(conferenceId);

  const query =
    trpc.submission.getSubmissionsByConferenceId.useQuery({
      conferenceId: conferenceId || "",
    });
  const { data: invitees, isLoading: isLoadingInvitees } =
    trpc.conference.getConferenceInvitees.useQuery({
      conferenceId: conferenceId || "",
    });

  const { data: reviewAssignmentsData, refetch: refetchReviewAssignments } =
    trpc.submission.getReviewAssignments.useQuery({
      conferenceId: conferenceId || "",
    });
  const { data: submissions, isLoading }= useProtectedQuery(query);
  const createReviewAssignmentMutation =
    trpc.submission.createReviewAssignment.useMutation({
      onSuccess: () => {
        toast.success("Review assignment created successfully");
        refetchReviewAssignments();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create review assignment");
      },
    });

  const deleteReviewAssignmentMutation =
    trpc.submission.deleteReviewAssignment.useMutation({
      onSuccess: () => {
        toast.success("Review assignment deleted successfully");
        refetchReviewAssignments();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete review assignment");
      },
    });

  const [allParticipants, setAllParticipants] = useState<Participant[]>();
  const [chairAssignments, setChairAssignments] = useState<Assignment[]>([
    {
      reviewer: "Mohammed Su",
      submissions: [
        {
          id: "95",
          title:
            "Neuro-Symbolic Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
          paper: "MyPaper.pdf",
          area: "Artificial Intelligence and Cognitive Systems",
          keywords:
            "Neuro-symbolic AI, zero-shot learning, commonsense reasoning, multi-agent systems, cognitive architectures",
          abstract:
            "This paper introduces a novel neuro-symbolic framework for enabling zero-shot commonsense reasoning in multi-agent environments. While existing systems either rely on statistical learning or symbolic reasoning, our approach combines both by integrating a large language model with a structured knowledge base to facilitate efficient inference and generalization in unfamiliar scenarios. We evaluate the framework on a custom benchmark involving collaborative planning and navigation tasks across heterogeneous agents. Results show a significant improvement in both task completion rate and reasoning accuracy compared to baseline methods. The proposed method highlights the potential of hybrid cognitive architectures in achieving robust and adaptive behavior in complex, real-world domains.",
          submitted: "Sep 17, 13:42",
          status: "Reviewed",
        },
      ],
    },
    {
      reviewer: "Mohammed Alami",
      submissions: [
        {
          id: "95",
          title:
            "Neuro-Symbolic Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
          paper: "MyPaper.pdf",
          area: "Artificial Intelligence and Cognitive Systems",
          keywords:
            "Neuro-symbolic AI, zero-shot learning, commonsense reasoning, multi-agent systems, cognitive architectures",
          abstract:
            "This paper introduces a novel neuro-symbolic framework for enabling zero-shot commonsense reasoning in multi-agent environments. While existing systems either rely on statistical learning or symbolic reasoning, our approach combines both by integrating a large language model with a structured knowledge base to facilitate efficient inference and generalization in unfamiliar scenarios. We evaluate the framework on a custom benchmark involving collaborative planning and navigation tasks across heterogeneous agents. Results show a significant improvement in both task completion rate and reasoning accuracy compared to baseline methods. The proposed method highlights the potential of hybrid cognitive architectures in achieving robust and adaptive behavior in complex, real-world domains.",
          submitted: "Sep 17, 13:42",
          status: null,
        },
      ],
    },
  ]);

  // Transform review assignments data to match the existing UI structure
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

  useEffect(() => {
    if (submissions && invitees) {
      const authorParticipants = submissions.flatMap((submission) =>
        submission.submissionAuthors.map((author) => ({
          ...author,
          role: "AUTHOR",
        }))
      );

      const inviteeParticipants: Participant[] = invitees.map((entry) => ({
        id: entry.user.id,
        firstName: entry.user.firstName,
        lastName: entry.user.lastName,
        email: entry.user.email,
        country: entry.user.country,
        affiliation: entry.user.affiliation,
        role: entry.role,
      }));
      const mergedParticipants: Participant[] = [
        ...authorParticipants,
        ...inviteeParticipants.filter(
          (invitee) =>
            !authorParticipants.some((author) => author.email === invitee.email)
        ),
      ];

      setAllParticipants(mergedParticipants);
    }
  }, [submissions, invitees]);

  if (isLoading || !submissions || isLoadingInvitees) {
    return <LoadingSpinner />;
  }
  const removeChairSubmission = (
    reviewerName: string,
    submissionId: string
  ) => {
    setChairAssignments((prev) =>
      prev.map((assignment) =>
        assignment.reviewer === reviewerName
          ? {
              ...assignment,
              submissions: assignment.submissions.filter(
                (sub) => sub.id !== submissionId
              ),
            }
          : assignment
      )
    );
  };

  const removeReviewerSubmission = (
    reviewerName: string,
    submissionId: string,
    assignmentId?: string
  ) => {
    if (assignmentId) {
      // Use API to delete the review assignment
      deleteReviewAssignmentMutation.mutate({
        assignmentId,
        conferenceId: conferenceId || "",
      });
    }
  };

  const availableSubmissions = submissions.map((sub) => ({
    id: sub.id,
    title: sub.title,
  }));
  console.log("Available Submissions:", submissions);
  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 py-6">
        {/* Conference Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {conference?.acronym} - {conference?.title}
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
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Conference Participants
            </CardTitle>
            <NewParticipant />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">
                    First Name
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Last Name
                  </TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">
                    Country
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Affiliation
                  </TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allParticipants?.map((participant, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-foreground">
                      {participant.firstName}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {participant.lastName}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {participant.email}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {getName(participant.country)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {participant.affiliation}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <Badge variant="outline">
                        {participant.role === "MAIN_CHAIR"
                          ? "Main Chair"
                          : participant.role === "CHAIR"
                          ? "Chair"
                          : participant.role === "AUTHOR"
                          ? "Author"
                          : "Reviewer"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Chair-Submissions Assignments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Chair-Submissions Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">
                    Reviewer
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Assigned Submissions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chairAssignments.map((assignment, index) => (
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
                                removeChairSubmission(
                                  assignment.reviewer,
                                  submission.id
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Reviewer-Submissions Assignments */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Reviewer-Submissions Assignments
            </CardTitle>
            {/* Add New Assignment Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  New Assignment
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Review Assignment</DialogTitle>
                </DialogHeader>
                <NewReviewAssignmentForm
                  conferenceId={conferenceId || ""}
                  submissions={availableSubmissions}
                  onCreateAssignment={createReviewAssignmentMutation.mutate}
                  isCreating={createReviewAssignmentMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">
                    Reviewer
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
                {reviewerAssignments.map((assignment, index) => (
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
                                removeReviewerSubmission(
                                  assignment.reviewer,
                                  submission.id,
                                  submission.assignmentId
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
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
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

        {/* Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Submissions
            </CardTitle>
          </CardHeader>
          {submissions.map((submission, index) => (
            <CardContent key={index}>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Submission{" "}
                  <span className="text-muted-foreground">{submission.id}</span>
                </h3>
                <div className="grid grid-cols-1 gap-0 border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 min-h-[60px]">
                    <div className="bg-muted p-4 border-r border-border flex items-center">
                      <span className="font-medium text-foreground">Title</span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-foreground">
                        {submission.title}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-border">
                    <div className="bg-muted p-4 border-r border-border flex items-center">
                      <span className="font-medium text-foreground">Paper</span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <Link
                        href={submission.paperFilePath}
                        className="text-primary hover:text-primary/80 no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {submission.paperFileName}
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-border">
                    <div className="bg-muted p-4 border-r border-border flex items-center">
                      <span className="font-medium text-foreground">
                        Area/Track
                      </span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-foreground">
                        {submission.secondaryArea}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-border">
                    <div className="bg-muted p-4 border-r border-border flex items-center">
                      <span className="font-medium text-foreground">
                        Keywords
                      </span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-foreground">
                        {submission.keywords}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 border-t border-border">
                    <div className="bg-muted p-4 border-r border-border flex items-start pt-4">
                      <span className="font-medium text-foreground">
                        Abstract
                      </span>
                    </div>
                    <div className="col-span-3 p-4">
                      <p className="text-foreground leading-relaxed">
                        {submission.abstract}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-border">
                    <div className="bg-muted p-4 border-r border-border flex items-center">
                      <span className="font-medium text-foreground">
                        Submitted
                      </span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-foreground">
                        {new Date(submission.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          ))}
        </Card>
      </main>
    </div>
  );
}
