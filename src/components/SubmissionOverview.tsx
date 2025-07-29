"use client";

import { SubmissionDetails } from "@/components/SubmissionDetails";
import { SubmissionAuthorsList } from "@/components/SubmissionAuthorsList";

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
  keywords: string | string[] | unknown; // Handle various JSON types from Prisma
  paperFilePath?: string | null;
  paperFileName?: string | null;
  primaryArea: string;
  secondaryArea: string;
  createdAt: string | Date;
  submissionAuthors: Author[];
}

interface SubmissionOverviewProps {
  submission: Submission;
  showPaperLink?: boolean;
  authorsTitle?: string;
  showCorrespondingColumn?: boolean;
  className?: string;
}

export function SubmissionOverview({
  submission,
  showPaperLink = true,
  authorsTitle = "Authors",
  showCorrespondingColumn = true,
  className = "",
}: SubmissionOverviewProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Paper Details */}
      <SubmissionDetails
        submission={submission}
        showPaperLink={showPaperLink}
      />

      {/* Authors Section */}
      <SubmissionAuthorsList
        authors={submission.submissionAuthors}
        title={authorsTitle}
        showCorrespondingColumn={showCorrespondingColumn}
      />
    </div>
  );
}
