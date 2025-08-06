"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";

interface SubmissionDetailsProps {
  submission: {
    id: string;
    title: string;
    abstract: string;
    keywords: string[] | string | unknown;
    paperFilePath?: string | null;
    paperFileName?: string | null;
    primaryArea: string;
    secondaryArea: string;
    createdAt: string | Date;
  };
  showPaperLink?: boolean;
  className?: string;
}

export function SubmissionDetails({
  submission,
  showPaperLink = true,
  className = "",
}: SubmissionDetailsProps) {
  const formatKeywords = (keywords: string[] | string | unknown) => {
    if (Array.isArray(keywords)) {
      return keywords.join(", ");
    }
    if (typeof keywords === "string") {
      return keywords;
    }
    if (keywords && typeof keywords === "object") {
      // Handle JSON object - try to convert to string
      try {
        return JSON.stringify(keywords);
      } catch {
        return "";
      }
    }
    return "";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date)
      .toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(",", ",");
  };

  return (
    <Card className={`border-2 border-border/60 py-0 ${className}`}>
      <CardContent className="py-4 px-6">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold text-foreground w-32">
                Title
              </TableCell>
              <TableCell className="text-foreground">
                {submission.title}
              </TableCell>
            </TableRow>

            {showPaperLink &&
              submission.paperFilePath &&
              submission.paperFileName && (
                <TableRow>
                  <TableCell className="font-bold text-foreground w-32">
                    Paper
                  </TableCell>
                  <TableCell className="text-foreground">
                    <Link
                      href={submission.paperFilePath}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {submission.paperFileName}
                    </Link>
                  </TableCell>
                </TableRow>
              )}

            <TableRow>
              <TableCell className="font-bold text-foreground w-32">
                Area/Track
              </TableCell>
              <TableCell className="text-foreground">
                {submission.primaryArea} / {submission.secondaryArea}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-bold text-foreground w-32">
                Keywords
              </TableCell>
              <TableCell className="text-foreground">
                {formatKeywords(submission.keywords)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-bold text-foreground w-32">
                Abstract
              </TableCell>
              <TableCell className="text-foreground">
                <div className="whitespace-pre-wrap break-words max-w-prose">
                  {submission.abstract}
                </div>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-bold text-foreground w-32">
                Submitted
              </TableCell>
              <TableCell className="text-foreground">
                {formatDate(submission.createdAt)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
