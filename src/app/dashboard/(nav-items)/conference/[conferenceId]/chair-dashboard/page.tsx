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
import { useEffect, useState } from "react";
import React from "react";
import NewParticipant from "./NewParticipantDialog";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/server/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getName } from "country-list";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";
import { Button } from "@/components/ui/button";
import SubmissionAssignment from "@/components/SubmissionAssignment";
import { useSession } from "next-auth/react";
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

  const query = trpc.submission.getSubmissionsByConferenceId.useQuery({
    conferenceId: conferenceId || "",
  });
  const { data: invitees, isLoading: isLoadingInvitees } =
    trpc.conference.getConferenceInvitees.useQuery({
      conferenceId: conferenceId || "",
    });

  const { data: submissions, isLoading } = useProtectedQuery(query);
  const [allParticipants, setAllParticipants] = useState<Participant[]>();
  const { data: session } = useSession();
  const isMainChair = conference?.conferenceRoles?.some(
    (role) => role.role === "MAIN_CHAIR" && role.user.id === session?.user.id
  );
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
  

  const availableSubmissions = submissions.map((sub) => ({
    id: sub.id,
    title: sub.title,
  }));
  console.log("Available Submissions:", submissions);
  return (
    <div className="main-content-height bg-background">
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
        {isMainChair && (
          <SubmissionAssignment
            isReviewAssignment={false}
            conferenceId={conferenceId}
            availableSubmissions={availableSubmissions}
          />
        )}

        {/* Reviewer-Submissions Assignments */}
        <SubmissionAssignment
          isReviewAssignment={true}
          conferenceId={conferenceId}
          availableSubmissions={availableSubmissions}
        />
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
