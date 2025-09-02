"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface Author {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  affiliation: string;
  isCorresponding: boolean;
}

interface Submission {
  id: string;
  title: string;
  abstract: string;
  keywords: string | string[] | unknown;
  paperFilePath?: string | null;
  paperFileName?: string | null;
  cameraReadyFilepath?: string | null;
  cameraReadyFilename?: string | null;
  primaryArea: string;
  secondaryArea: string;
  createdAt: string | Date;
  submissionAuthors: Author[];
  conference: {
    id: string;
    submissionDeadline: string;
  };
}

interface SimpleSubmissionsListProps {
  submissions: Submission[];
}

export function SimpleSubmissionsList({
  submissions,
}: SimpleSubmissionsListProps) {
  const router = useRouter();
  const { conferenceId } = useParams<{ conferenceId: string }>();

  const handleViewDetails = (submissionId: string) => {
    router.push(
      `/dashboard/conference/${conferenceId}/submissions/${submissionId}`
    );
  };

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No submissions found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Submissions ({submissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground w-20">ID</TableHead>
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground w-32">
                Research Area
              </TableHead>
              <TableHead className="text-muted-foreground w-20 text-center">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow
                key={submission.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => handleViewDetails(submission.id)}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  #{submission.id}
                </TableCell>
                <TableCell className="font-medium text-foreground max-w-md">
                  <div className="truncate pr-2" title={submission.title}>
                    {submission.title}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {submission.primaryArea}
                    {submission.secondaryArea &&
                      ` / ${submission.secondaryArea}`}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(submission.id);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
