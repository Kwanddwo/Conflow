"use client";

import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { NewParticipantDialog } from "./NewParticipantDialog";
import Link from "next/link";

interface Submission {
  id: string;
  title: string;
  paper: string;
  area: string;
  keywords: string;
  abstract: string;
  submitted: string;
  status?: "Reviewed" | null;
}

interface Assignment {
  reviewer: string;
  submissions: Submission[];
}

export default function ConferenceDashboard() {
  const [open, setOpen] = useState(false);

  const participants = [
    {
      firstName: "Mohammed",
      lastName: "Su",
      email: "Medsu@gmail.com",
      country: "Morocco",
      affiliation: "Laboratory of Whatever, National School of Something, NSS",
      role: "Main Chair",
    },
    {
      firstName: "Mohammed",
      lastName: "Su",
      email: "Medsu@gmail.com",
      country: "Morocco",
      affiliation: "Laboratory of Whatever, National School of Something, NSS",
      role: "Chair",
    },
    {
      firstName: "Achraf",
      lastName: "Tahiri",
      email: "chraffi@gmail.com",
      country: "Morocco",
      affiliation: "Laboratory of Whatever, National School of Something, NSS",
      role: "Author",
    },
    {
      firstName: "Mohammed",
      lastName: "Alami",
      email: "m.alami@nss.ma",
      country: "Morocco",
      affiliation: "Laboratory of Whatever, National School of Something, NSS",
      role: "Reviewer",
    },
    {
      firstName: "Mohammed",
      lastName: "Su",
      email: "Medsu@gmail.com",
      country: "Morocco",
      affiliation: "Laboratory of Whatever, National School of Something, NSS",
      role: "Author",
    },
  ];

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
        {
          id: "100",
          title:
            "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
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
        {
          id: "100",
          title:
            "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
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
  ]);

  const [reviewerAssignments, setReviewerAssignments] = useState<Assignment[]>([
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
        {
          id: "100",
          title:
            "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
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
        {
          id: "100",
          title:
            "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
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
  ]);

  const submissions = [
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
    },
    {
      id: "100",
      title:
        "Something Integration for Zero-Shot Commonsense Reasoning in Multi-Agent Systems",
      paper: "MyPaper.pdf",
      area: "Artificial Intelligence and Cognitive Systems",
      keywords:
        "Neuro-symbolic AI, zero-shot learning, commonsense reasoning, multi-agent systems, cognitive architectures",
      abstract:
        "This paper introduces a novel neuro-symbolic framework for enabling zero-shot commonsense reasoning in multi-agent environments. While existing systems either rely on statistical learning or symbolic reasoning, our approach combines both by integrating a large language model with a structured knowledge base to facilitate efficient inference and generalization in unfamiliar scenarios. We evaluate the framework on a custom benchmark involving collaborative planning and navigation tasks across heterogeneous agents. Results show a significant improvement in both task completion rate and reasoning accuracy compared to baseline methods. The proposed method highlights the potential of hybrid cognitive architectures in achieving robust and adaptive behavior in complex, real-world domains.",
      submitted: "Sep 17, 13:42",
    },
    {
      id: "54",
      title:
        "Advanced Machine Learning Techniques for Natural Language Processing",
      paper: "MLPaper.pdf",
      area: "Machine Learning",
      keywords: "machine learning, natural language processing, deep learning",
      abstract:
        "This research explores advanced machine learning techniques for natural language processing applications.",
      submitted: "Sep 15, 10:30",
    },
  ];

  // Available submissions for assignment
  const availableSubmissions = submissions.map((sub) => ({
    id: sub.id,
    title: sub.title,
  }));

  // Remove submission from chair assignments
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

  // Add submission to chair assignments
  const addChairSubmission = (reviewerName: string, submissionId: string) => {
    const selectedSubmission = availableSubmissions.find(
      (sub) => sub.id === submissionId
    );
    if (!selectedSubmission) return;

    setChairAssignments((prev) =>
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

  // Remove submission from reviewer assignments
  const removeReviewerSubmission = (
    reviewerName: string,
    submissionId: string
  ) => {
    setReviewerAssignments((prev) =>
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

  // Add submission to reviewer assignments
  const addReviewerSubmission = (
    reviewerName: string,
    submissionId: string
  ) => {
    const selectedSubmission = availableSubmissions.find(
      (sub) => sub.id === submissionId
    );
    if (!selectedSubmission) return;

    setReviewerAssignments((prev) =>
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

  // Get available submissions for a specific reviewer (not already assigned)
  const getAvailableSubmissionsForChair = (reviewerName: string) => {
    const assignedIds =
      chairAssignments
        .find((a) => a.reviewer === reviewerName)
        ?.submissions.map((s) => s.id) || [];
    return availableSubmissions.filter((sub) => !assignedIds.includes(sub.id));
  };

  const getAvailableSubmissionsForReviewer = (reviewerName: string) => {
    const assignedIds =
      reviewerAssignments
        .find((a) => a.reviewer === reviewerName)
        ?.submissions.map((s) => s.id) || [];
    return availableSubmissions.filter((sub) => !assignedIds.includes(sub.id));
  };

  return (
    <div className="min-h-screen bg-[#ffffff]">

      <main className="px-6 py-6">
        {/* Conference Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#000000] mb-4">
            CONF2024 (Conference 2024)
          </h1>
          <div className="flex space-x-3">
            <Button size="sm" className="cursor-pointer">
              Edit Conference
            </Button>
            <Button size="sm" className="cursor-pointer">
              Edit CFP
            </Button>
          </div>
        </div>

        {/* Conference Participants */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#000000]">
              Conference Participants
            </CardTitle>
            <Button
              size="sm"
              className="bg-[#0f172a] text-[#ffffff] hover:bg-[#1d1b20] cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a new participant
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#64748b]">First Name</TableHead>
                  <TableHead className="text-[#64748b]">Last Name</TableHead>
                  <TableHead className="text-[#64748b]">Email</TableHead>
                  <TableHead className="text-[#64748b]">Country</TableHead>
                  <TableHead className="text-[#64748b]">Affiliation</TableHead>
                  <TableHead className="text-[#64748b]">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-[#000000]">
                      {participant.firstName}
                    </TableCell>
                    <TableCell className="text-[#000000]">
                      {participant.lastName}
                    </TableCell>
                    <TableCell className="text-[#000000]">
                      {participant.email}
                    </TableCell>
                    <TableCell className="text-[#000000]">
                      {participant.country}
                    </TableCell>
                    <TableCell className="text-[#000000]">
                      {participant.affiliation}
                    </TableCell>
                    <TableCell className="text-[#000000]">
                      {participant.role}
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
            <CardTitle className="text-lg font-semibold text-[#000000]">
              Chair-Submissions Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#64748b]">Reviewer</TableHead>
                  <TableHead className="text-[#64748b]">
                    Assigned Submissions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chairAssignments.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-[#000000] align-top">
                      {assignment.reviewer}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {assignment.submissions.map((submission, subIndex) => (
                          <div
                            key={subIndex}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-[#000000] text-sm">
                              Submission No. {submission.id} ({submission.title}
                              )
                            </span>
                            <X
                              className="h-4 w-4 text-red-600 cursor-pointer hover:text-red-800"
                              onClick={() =>
                                removeChairSubmission(
                                  assignment.reviewer,
                                  submission.id
                                )
                              }
                            />
                            {submission.status && (
                              <Badge className="bg-[#22c55e] text-[#ffffff] hover:bg-[#22c55e]/80">
                                {submission.status}
                              </Badge>
                            )}
                          </div>
                        ))}

                        {/* Add submission dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Plus className="text-green-600 cursor-pointer h-4 w-4 hover:text-green-800" />
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
                                  addChairSubmission(
                                    assignment.reviewer,
                                    value
                                  );
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a submission to assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableSubmissionsForChair(
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Reviewer-Submissions Assignments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#000000]">
              Reviewer-Submissions Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#64748b]">Reviewer</TableHead>
                  <TableHead className="text-[#64748b]">
                    Assigned Submissions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewerAssignments.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-[#000000] align-top">
                      {assignment.reviewer}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {assignment.submissions.map((submission, subIndex) => (
                          <div
                            key={subIndex}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-[#000000] text-sm">
                              Submission No. {submission.id} ({submission.title}
                              )
                            </span>
                            <X
                              className="h-4 w-4 text-red-600 cursor-pointer hover:text-red-800"
                              onClick={() =>
                                removeReviewerSubmission(
                                  assignment.reviewer,
                                  submission.id
                                )
                              }
                            />
                            {submission.status && (
                              <Badge className="bg-[#22c55e] text-[#ffffff] hover:bg-[#22c55e]/80">
                                {submission.status}
                              </Badge>
                            )}
                          </div>
                        ))}

                        {/* Add submission dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Plus className="text-green-600 cursor-pointer h-4 w-4 hover:text-green-800" />
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
                                  addReviewerSubmission(
                                    assignment.reviewer,
                                    value
                                  );
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
            <CardTitle className="text-lg font-semibold text-[#000000]">
              Submissions
            </CardTitle>
          </CardHeader>
          {submissions.map((submission, index) => (
            <CardContent key={index}>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-[#000000]">
                  Submission ID {submission.id}
                </h3>
                <div className="grid grid-cols-1 gap-0 border border-[#e2e8f0] rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 min-h-[60px]">
                    <div className="bg-[#f1f5f9] p-4 border-r border-[#e2e8f0] flex items-center">
                      <span className="font-medium text-[#000000]">Title</span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-[#000000]">{submission.title}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-[#e2e8f0]">
                    <div className="bg-[#f1f5f9] p-4 border-r border-[#e2e8f0] flex items-center">
                      <span className="font-medium text-[#000000]">Paper</span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <Link
                        href="#"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {submission.paper}
                      </Link>
                      <span className="text-[#64748b] ml-2">
                        [{submission.submitted}]
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-[#e2e8f0]">
                    <div className="bg-[#f1f5f9] p-4 border-r border-[#e2e8f0] flex items-center">
                      <span className="font-medium text-[#000000]">
                        Area/Track
                      </span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-[#000000]">{submission.area}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-[#e2e8f0]">
                    <div className="bg-[#f1f5f9] p-4 border-r border-[#e2e8f0] flex items-center">
                      <span className="font-medium text-[#000000]">
                        Keywords
                      </span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-[#000000]">
                        {submission.keywords}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 border-t border-[#e2e8f0]">
                    <div className="bg-[#f1f5f9] p-4 border-r border-[#e2e8f0] flex items-start pt-4">
                      <span className="font-medium text-[#000000]">
                        Abstract
                      </span>
                    </div>
                    <div className="col-span-3 p-4">
                      <p className="text-[#000000] leading-relaxed">
                        {submission.abstract}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 min-h-[60px] border-t border-[#e2e8f0]">
                    <div className="bg-[#f1f5f9] p-4 border-r border-[#e2e8f0] flex items-center">
                      <span className="font-medium text-[#000000]">
                        Submitted
                      </span>
                    </div>
                    <div className="col-span-3 p-4 flex items-center">
                      <span className="text-[#000000]">
                        {submission.submitted}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          ))}
        </Card>
      </main>
      <NewParticipantDialog open={open} setOpen={setOpen} />
    </div>
  );
}
