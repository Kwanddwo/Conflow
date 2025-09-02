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
import { FileCheck } from "lucide-react";
import { SimpleSubmissionsList } from "@/components/SimpleSubmissionsList";
import PaymentTracking from "@/components/PaymentTracking";
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
  const isChair = conference?.conferenceRoles?.some(
    (role) =>
      (role.role === "CHAIR" || role.role === "MAIN_CHAIR") &&
      role.user.id === session?.user.id
  );
  const isMainChair = conference?.conferenceRoles?.some(
    (role) => role.role === "MAIN_CHAIR" && role.user.id === session?.user.id
  );
  useEffect(() => {
    if (invitees) {
      const inviteeParticipants: Participant[] = invitees.map((entry) => ({
        id: entry.user.id,
        firstName: entry.user.firstName,
        lastName: entry.user.lastName,
        email: entry.user.email,
        country: entry.user.country,
        affiliation: entry.user.affiliation,
        role: entry.role,
      }));


      setAllParticipants(inviteeParticipants);
    }
  }, [invitees]);

  if (isLoading || !submissions || isLoadingInvitees) {
    return <LoadingSpinner />;
  }

  const availableSubmissions = submissions.map((sub) => ({
    id: sub.id,
    title: sub.title,
  }));

  // Check if camera ready deadline has passed
  const isCameraReadyDeadlinePassed = conference?.cameraReadyDeadline
    ? new Date() > new Date(conference.cameraReadyDeadline)
    : false;

  console.log("Available Submissions:", submissions);
  return (
    <div className="main-content-height bg-background">
      <main className="px-6 py-6">
        {/* Conference Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {conference?.acronym} - {conference?.title}
          </h1>
          <div className="flex gap-2">
            {isChair && (
              <Button
                asChild
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Link
                  href={`/dashboard/conference/${conferenceId}/your-decisions`}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Your Decisions
                </Link>
              </Button>
            )}
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href={`/dashboard/conference/${conferenceId}`}>
                Go to Conference
              </Link>
            </Button>
          </div>
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

        {/* Payment Tracking - Only show after camera ready deadline */}
        {isChair && (
          <div className="mb-8">
            {isCameraReadyDeadlinePassed ? (
              <PaymentTracking conferenceId={conferenceId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Payment Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Payment tracking will be available after the camera-ready
                    deadline (
                    {conference?.cameraReadyDeadline
                      ? new Date(
                          conference.cameraReadyDeadline
                        ).toLocaleDateString()
                      : "not set"}
                    ).
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
        <SimpleSubmissionsList submissions={submissions} />
      </main>
    </div>
  );
}
