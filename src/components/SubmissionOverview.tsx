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
  authorsTitle?: string | null;
  showCorrespondingColumn?: boolean;
  className?: string;
  isTitle?: boolean;
}

export function SubmissionOverview({
  submission,
  showPaperLink = true,
  authorsTitle = "Authors",
  showCorrespondingColumn = true,
  className = "",
  isTitle = false,
}: SubmissionOverviewProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Paper Details */}
      {isTitle && (
        <h3 className="text-md font-semibold mb-4">
          Submission{" "}
          <span className="text-muted-foreground">{submission.id}</span>
        </h3>
      )}

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
