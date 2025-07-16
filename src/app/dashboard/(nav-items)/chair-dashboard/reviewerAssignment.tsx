"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { X, Plus } from "lucide-react";

interface Submission {
  id: string;
  title: string;
  status?: "Reviewed" | null;
}

interface ReviewerAssignment {
  reviewer: string;
  submissions: Submission[];
}

export default function ReviewerAssignments() {
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([
    {
      reviewer: "Mohammed Su",
      submissions: [
        {
          id: "95",
          title:
            "Neuro-Symbolic Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
          status: "Reviewed",
        },
        {
          id: "100",
          title:
            "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
          status: null,
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
          status: null,
        },
        {
          id: "100",
          title:
            "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
          status: "Reviewed",
        },
      ],
    },
  ]);

  // Available submissions that can be assigned
  const availableSubmissions = [
    {
      id: "54",
      title:
        "Neuro-Symbolic Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
    },
    {
      id: "95",
      title:
        "Neuro-Symbolic Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
    },
    {
      id: "100",
      title:
        "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
    },
    {
      id: "101",
      title:
        "Advanced Machine Learning Techniques for Natural Language Processing",
    },
    { id: "102", title: "Distributed Computing in Cloud Environments" },
  ];

  const removeSubmission = (reviewerName: string, submissionId: string) => {
    setAssignments((prev) =>
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

  const addSubmission = (reviewerName: string, submissionId: string) => {
    const selectedSubmission = availableSubmissions.find(
      (sub) => sub.id === submissionId
    );
    if (!selectedSubmission) return;

    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.reviewer === reviewerName
          ? {
              ...assignment,
              submissions: [
                ...assignment.submissions,
                {
                  id: selectedSubmission.id,
                  title: selectedSubmission.title,
                  status: null,
                },
              ],
            }
          : assignment
      )
    );
  };

  const getAvailableSubmissionsForReviewer = (reviewerName: string) => {
    const assignedIds =
      assignments
        .find((a) => a.reviewer === reviewerName)
        ?.submissions.map((s) => s.id) || [];

    return availableSubmissions.filter((sub) => !assignedIds.includes(sub.id));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#000000]">
          Reviewer-Submissions Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-0 border border-[#e2e8f0] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#f8f9fa] p-4 border-r border-[#e2e8f0] border-b border-[#e2e8f0]">
            <h3 className="font-semibold text-[#000000]">Reviewer</h3>
          </div>
          <div className="bg-[#f8f9fa] p-4 border-b border-[#e2e8f0]">
            <h3 className="font-semibold text-[#000000]">
              Assigned Submissions
            </h3>
          </div>

          {/* Content */}
          {assignments.map((assignment, index) => (
            <div key={assignment.reviewer} className="contents">
              <div
                className={`p-4 border-r border-[#e2e8f0] flex items-start ${
                  index < assignments.length - 1
                    ? "border-b border-[#e2e8f0]"
                    : ""
                }`}
              >
                <span className="text-[#000000] font-medium">
                  {assignment.reviewer}
                </span>
              </div>
              <div
                className={`p-4 ${
                  index < assignments.length - 1
                    ? "border-b border-[#e2e8f0]"
                    : ""
                }`}
              >
                <div className="space-y-3">
                  {assignment.submissions.map((submission) => (
                    <div
                      key={`${assignment.reviewer}-${submission.id}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[#000000] text-sm">
                          Submission No. {submission.id} ({submission.title})
                        </span>
                        {submission.status && (
                          <Badge className="bg-[#22c55e] text-[#ffffff] hover:bg-[#22c55e]/80 text-xs">
                            {submission.status}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeSubmission(assignment.reviewer, submission.id)
                        }
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}

                  {/* Add submission dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-green-100"
                        disabled={
                          getAvailableSubmissionsForReviewer(
                            assignment.reviewer
                          ).length === 0
                        }
                      >
                        <Plus className="h-4 w-4 text-green-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          Add Submission to {assignment.reviewer}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select
                          onValueChange={(value) => {
                            addSubmission(assignment.reviewer, value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a submission to assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSubmissionsForReviewer(
                              assignment.reviewer
                            ).map((submission) => (
                              <SelectItem
                                key={submission.id}
                                value={submission.id}
                              >
                                Submission No. {submission.id} -{" "}
                                {submission.title.substring(0, 50)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
